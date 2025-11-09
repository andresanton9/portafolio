const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.handler = async (event) => {
  try {
    const { prompt, threadId } = JSON.parse(event.body ?? "{}");

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt vacío o no válido" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    let currentThreadId = threadId;

    if (!currentThreadId) {
      const created = await client.beta.threads.create();
      currentThreadId = created.id;
    }

    // Enviar mensaje de usuario
    try {
      await client.beta.threads.messages.create(currentThreadId, {
        role: "user",
        content: prompt,
      });
    } catch (messageError) {
      // Si el thread no existe (caducó o ID inválido), creamos uno nuevo
      const created = await client.beta.threads.create();
      currentThreadId = created.id;
      await client.beta.threads.messages.create(currentThreadId, {
        role: "user",
        content: prompt,
      });
    }

    // Iniciar run
    const run = await client.beta.threads.runs.create(currentThreadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
    });

    // Polling con backoff exponencial
    let finalRun = run;
    const maxRetries = 10;
    let attempt = 0;
    let delay = 1000; // 1s inicial

    while (
      (finalRun.status === "queued" || finalRun.status === "in_progress") &&
      attempt < maxRetries
    ) {
      await sleep(delay);
      attempt += 1;
      delay = Math.min(5000, delay * 1.8); // cap en 5s
      finalRun = await client.beta.threads.runs.retrieve(
        currentThreadId,
        run.id
      );
    }

    if (finalRun.status !== "completed") {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Run terminado con estado inesperado: ${finalRun.status}`,
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Intentar extraer la salida desde finalRun (si la SDK la deja ahí)
    let textReply = null;
    if (finalRun.output) {
      // Ajusta según la estructura real que devuelva tu SDK
      // buscamos fragmentos de texto
      const parts = finalRun.output.filter?.(
        (p) => p.type === "output_text" || p.type === "message"
      );
      if (parts && parts.length) {
        textReply = parts.map((p) => p.text || p.content || "").join("\n").trim();
      }
    }

    // Si no hay output en finalRun, caemos a messages.list()
    if (!textReply) {
      const messages = await client.beta.threads.messages.list(
        currentThreadId
      );
      // Buscar último mensaje del assistant
      const assistantMsgs = messages.data.filter((m) => m.role === "assistant");
      if (assistantMsgs.length > 0) {
        const last = assistantMsgs[assistantMsgs.length - 1];
        // Recorrer content con robustez
        if (Array.isArray(last.content)) {
          // buscar cualquier campo que contenga texto legible
          for (const block of last.content) {
            if (block.type === "output_text" && block.text) {
              textReply = (textReply ? textReply + "\n" : "") + block.text;
            } else if (block.type === "message" && block.text) {
              textReply = (textReply ? textReply + "\n" : "") + block.text;
            } else if (block.text?.value) {
              textReply = (textReply ? textReply + "\n" : "") + block.text.value;
            } else if (block.text && typeof block.text === "string") {
              textReply = (textReply ? textReply + "\n" : "") + block.text;
            }
          }
        } else if (last.content?.text?.value) {
          textReply = last.content.text.value;
        }
      }
    }

    if (!textReply) {
      // fallback por si no hemos encontrado nada
      textReply = "";
    }

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
