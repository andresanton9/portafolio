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

const getConversationItemsAsInput = async (conversationId) => {
  try {
    const itemsResponse = await openaiFetch(`/conversations/${conversationId}/items?limit=100&order=asc`);
    const items = itemsResponse.data || [];
    
    // Convertir items de conversación al formato input del Responses API
    const input = items
      .filter((item) => item.type === "message" && (item.role === "user" || item.role === "assistant"))
      .map((item) => {
        const content = Array.isArray(item.content) 
          ? item.content.map((block) => {
              if (block.type === "input_text" || block.type === "output_text") {
                return block.text || "";
              }
              return "";
            }).filter(Boolean).join("")
          : "";
        
        return {
          role: item.role,
          content: content,
        };
      })
      .filter((msg) => msg.content); // Filtrar mensajes vacíos
    
    return input;
  } catch (error) {
    console.error("Error obteniendo items de conversación:", error);
    return [];
  }
};

const openaiStreamResponse = async (conversationId) => {
  ensureEnv();
  const model = "gpt-5-nano-2025-08-07";

  // Obtener todos los mensajes de la conversación para pasarlos como input
  const input = await getConversationItemsAsInput(conversationId);

  const requestBody = {
    model: model,
    input: input,
    stream: true,
  };

  // Agregar conversation_id si está disponible para mantener el contexto
  if (conversationId) {
    requestBody.conversation_id = conversationId;
  }

  const response = await fetchWithFallback(`${API_BASE}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(requestBody),
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
    const { prompt, threadId } = JSON.parse(event.body ?? "{}");

    // Mantener compatibilidad con threadId pero usar conversationId internamente
    const conversationId = threadId;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt vacío o no válido" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Siempre usar streaming
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
  } catch (error) {
    console.error("Error handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(error?.message ?? error) }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
