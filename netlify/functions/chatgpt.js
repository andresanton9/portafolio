const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const API_BASE = "https://api.openai.com/v1";
const fetchWithFallback = (...args) => {
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch(...args);
  }
  return import("node-fetch").then(({ default: fetch }) => fetch(...args));
};

const ensureEnv = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY no configurada.");
  }
};

const openaiFetch = async (path, options = {}) => {
  ensureEnv();

  const { headers: customHeaders, method, ...rest } = options;
  const requestInit = {
    method: method || "GET",
    ...rest,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      ...customHeaders,
    },
  };

  const response = await fetchWithFallback(`${API_BASE}${path}`, requestInit);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenAI request failed (${response.status}): ${
        typeof payload === "string" ? payload : JSON.stringify(payload)
      }`
    );
  }

  return payload;
};

const createConversationIfNeeded = async (conversationId) => {
  if (conversationId) {
    // Verificar si la conversación existe
    try {
      await openaiFetch(`/conversations/${conversationId}`);
      return conversationId;
    } catch (error) {
      // Si no existe, crear una nueva
      if (error.message.includes("404") || error.message.includes("not found")) {
        const created = await openaiFetch("/conversations", {
          method: "POST",
          body: JSON.stringify({}),
        });
        return created.id;
      }
      throw error;
    }
  }
  
  const created = await openaiFetch("/conversations", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return created.id;
};

const sendUserMessage = async (conversationId, prompt) => {
  try {
    await openaiFetch(`/conversations/${conversationId}/items`, {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });
    return conversationId;
  } catch (error) {
    const needsNewConversation =
      typeof error.message === "string" &&
      (error.message.includes("404") ||
        error.message.includes("not found") ||
        error.message.includes("invalid conversation"));

    if (!needsNewConversation) {
      throw error;
    }

    const created = await openaiFetch("/conversations", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const newConversationId = created.id;
    await openaiFetch(`/conversations/${newConversationId}/items`, {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    return newConversationId;
  }
};

const generateResponse = async (conversationId) => {
  const response = await openaiFetch("/responses", {
    method: "POST",
    body: JSON.stringify({
      model: "gpt-5-nano-2025-08-07",
      conversation_id: conversationId,
    }),
  });

  let finalResponse = response;
  const maxRetries = 10;
  let attempt = 0;
  let delay = 1000;

  // Si la respuesta tiene un status, esperar hasta que esté completada
  while (
    finalResponse.status &&
    (finalResponse.status === "queued" || finalResponse.status === "in_progress") &&
    attempt < maxRetries
  ) {
    await sleep(delay);
    attempt += 1;
    delay = Math.min(5000, delay * 1.8);
    if (finalResponse.id) {
      finalResponse = await openaiFetch(`/responses/${finalResponse.id}`);
    } else {
      break;
    }
  }

  return finalResponse;
};

const extractTextFromItem = (item) => {
  if (!item || !Array.isArray(item.content)) {
    return "";
  }

  const chunks = [];

  for (const block of item.content) {
    if (block.type === "output_text") {
      if (typeof block.text === "string") {
        chunks.push(block.text);
      } else if (block.text?.value) {
        chunks.push(block.text.value);
      } else if (block.text) {
        chunks.push(String(block.text));
      }
    } else if (block.type === "input_text" && block.text) {
      // Para mensajes de usuario (no debería usarse aquí, pero por seguridad)
      chunks.push(typeof block.text === "string" ? block.text : String(block.text));
    }
  }

  return chunks.join("\n").trim();
};

const fetchAssistantReply = async (conversationId) => {
  const itemsResponse = await openaiFetch(`/conversations/${conversationId}/items?limit=20&order=desc`);
  const items = itemsResponse.data || [];
  
  // Buscar el último mensaje del asistente
  const assistantItems = items.filter((item) => item.role === "assistant" && item.type === "message");

  if (!assistantItems.length) {
    return "";
  }

  const lastItem = assistantItems[0]; // Ya están ordenados desc
  return extractTextFromItem(lastItem);
};

const openaiStreamResponse = async (conversationId) => {
  ensureEnv();

  const response = await fetchWithFallback(`${API_BASE}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: "gpt-5-nano-2025-08-07",
      conversation_id: conversationId,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const errorPayload = await response.text();
    throw new Error(
      `OpenAI stream request failed (${response.status}): ${errorPayload}`
    );
  }

  return response.body;
};

exports.handler = async (event) => {
  try {
    const { prompt, threadId, stream } = JSON.parse(event.body ?? "{}");
    const shouldStream = stream === true || stream === "true";

    // Mantener compatibilidad con threadId pero usar conversationId internamente
    const conversationId = threadId;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt vacío o no válido" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (shouldStream) {
      const streamResponse = new ReadableStream({
        start: async (controller) => {
          const encoder = new TextEncoder();
          try {
            let currentConversationId = await createConversationIfNeeded(conversationId);
            currentConversationId = await sendUserMessage(currentConversationId, prompt);

            controller.enqueue(
              encoder.encode(
                `event: conversation\n` +
                  `data: ${JSON.stringify({ threadId: currentConversationId, conversationId: currentConversationId })}\n\n`
              )
            );

            const bodyStream = await openaiStreamResponse(currentConversationId);
            const reader = bodyStream.getReader();

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (value) {
                controller.enqueue(value);
              }
            }

            controller.close();
          } catch (err) {
            controller.enqueue(
              new TextEncoder().encode(
                `event: error\n` +
                  `data: ${JSON.stringify({ message: err.message })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(streamResponse, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    let currentConversationId = await createConversationIfNeeded(conversationId);
    currentConversationId = await sendUserMessage(currentConversationId, prompt);
    const finalResponse = await generateResponse(currentConversationId);

    // Si hay un error en el estado de la respuesta
    if (finalResponse.status && finalResponse.status !== "completed") {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Respuesta terminada con estado inesperado: ${finalResponse.status}`,
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const textReply = await fetchAssistantReply(currentConversationId);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        reply: textReply, 
        threadId: currentConversationId,
        conversationId: currentConversationId 
      }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    console.error("Error handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(error?.message ?? error) }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
