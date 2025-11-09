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
  if (!process.env.OPENAI_ASSISTANT_ID) {
    throw new Error("OPENAI_ASSISTANT_ID no configurada.");
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
      "OpenAI-Beta": "assistants=v2",
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

const createThreadIfNeeded = async (threadId) => {
  if (threadId) return threadId;
  const created = await openaiFetch("/threads", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return created.id;
};

const sendUserMessage = async (threadId, prompt) => {
  try {
    await openaiFetch(`/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      }),
    });
    return threadId;
  } catch (error) {
    const needsNewThread =
      typeof error.message === "string" &&
      (error.message.includes("404") ||
        error.message.includes("not found") ||
        error.message.includes("invalid thread"));

    if (!needsNewThread) {
      throw error;
    }

    const created = await openaiFetch("/threads", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const newThreadId = created.id;
    await openaiFetch(`/threads/${newThreadId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      }),
    });

    return newThreadId;
  }
};

const runAssistant = async (threadId) => {
  const run = await openaiFetch(`/threads/${threadId}/runs`, {
    method: "POST",
    body: JSON.stringify({
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
    }),
  });

  let finalRun = run;
  const maxRetries = 10;
  let attempt = 0;
  let delay = 1000;

  while (
    (finalRun.status === "queued" || finalRun.status === "in_progress") &&
    attempt < maxRetries
  ) {
    await sleep(delay);
    attempt += 1;
    delay = Math.min(5000, delay * 1.8);
    finalRun = await openaiFetch(`/threads/${threadId}/runs/${run.id}`);
  }

  return finalRun;
};

const extractTextFromMessage = (message) => {
  if (!message || !Array.isArray(message.content)) {
    return "";
  }

  const chunks = [];

  for (const block of message.content) {
    if (block.type === "text" && block.text?.value) {
      chunks.push(block.text.value);
    } else if (block.type === "output_text" && typeof block.text === "string") {
      chunks.push(block.text);
    } else if (block.type === "output_text" && block.text?.value) {
      chunks.push(block.text.value);
    } else if (typeof block.text === "string") {
      chunks.push(block.text);
    }
  }

  return chunks.join("\n").trim();
};

const fetchAssistantReply = async (threadId) => {
  const messages = await openaiFetch(`/threads/${threadId}/messages?limit=20`);
  const assistantMessages = (messages.data || [])
    .filter((message) => message.role === "assistant")
    .sort((a, b) => a.created_at - b.created_at);

  if (!assistantMessages.length) {
    return "";
  }

  const lastMessage = assistantMessages[assistantMessages.length - 1];
  return extractTextFromMessage(lastMessage);
};

const openaiStreamRun = async (threadId) => {
  ensureEnv();

  const response = await fetchWithFallback(`${API_BASE}/threads/${threadId}/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "OpenAI-Beta": "assistants=v2",
    },
    body: JSON.stringify({
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
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
            let currentThreadId = await createThreadIfNeeded(threadId);
            currentThreadId = await sendUserMessage(currentThreadId, prompt);

            controller.enqueue(
              encoder.encode(
                `event: thread\n` +
                  `data: ${JSON.stringify({ threadId: currentThreadId })}\n\n`
              )
            );

            const bodyStream = await openaiStreamRun(currentThreadId);
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

    let currentThreadId = await createThreadIfNeeded(threadId);
    currentThreadId = await sendUserMessage(currentThreadId, prompt);
    const finalRun = await runAssistant(currentThreadId);

    if (finalRun.status !== "completed") {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Run terminado con estado inesperado: ${finalRun.status}`,
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const textReply = await fetchAssistantReply(currentThreadId);

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: textReply, threadId: currentThreadId }),
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
