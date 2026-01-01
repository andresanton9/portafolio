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

const createResponse = async (input, previousResponseId = null, model = "gpt-4o") => {
  const body = {
    model,
    input,
    store: true, // Mantener estado entre turnos
  };

  // Si hay una respuesta previa, la pasamos para mantener el contexto
  if (previousResponseId) {
    body.previous_response_id = previousResponseId;
  }

  return await openaiFetch("/responses", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const extractTextFromResponse = (response) => {
  if (!response || !Array.isArray(response.output)) {
    return "";
  }

  const chunks = [];

  for (const item of response.output) {
    if (item.type === "message" && Array.isArray(item.content)) {
      for (const block of item.content) {
        if (block.type === "output_text" && block.text) {
          chunks.push(block.text);
        }
      }
    }
  }

  return chunks.join("\n").trim();
};

const openaiStreamResponse = async (input, previousResponseId = null, model = "gpt-4o") => {
  ensureEnv();

  const body = {
    model,
    input,
    stream: true,
    store: true,
  };

  if (previousResponseId) {
    body.previous_response_id = previousResponseId;
  }

  const response = await fetchWithFallback(`${API_BASE}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
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
    const { prompt, previousResponseId, stream, model } = JSON.parse(event.body ?? "{}");
    const shouldStream = stream === true || stream === "true";
    const modelToUse = model || "gpt-4o";

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
            const bodyStream = await openaiStreamResponse(prompt, previousResponseId, modelToUse);
            const reader = bodyStream.getReader();

            let responseId = null;
            let buffer = "";

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              
              if (value) {
                buffer += new TextDecoder().decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      
                      // Extraer response_id del primer evento
                      if (data.id && !responseId) {
                        responseId = data.id;
                        controller.enqueue(
                          encoder.encode(
                            `event: response\n` +
                              `data: ${JSON.stringify({ responseId: responseId })}\n\n`
                          )
                        );
                      }
                    } catch (e) {
                      // Ignorar errores de parsing
                    }
                  }
                  
                  // Reenviar la línea original
                  controller.enqueue(encoder.encode(line + "\n"));
                }
              }
            }

            // Enviar el buffer restante
            if (buffer) {
              controller.enqueue(encoder.encode(buffer));
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

    // Modo no-streaming
    const response = await createResponse(prompt, previousResponseId, modelToUse);
    const textReply = extractTextFromResponse(response);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        reply: textReply, 
        responseId: response.id,
        previousResponseId: previousResponseId || null
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
