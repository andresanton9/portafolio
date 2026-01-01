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

const SYSTEM_INSTRUCTIONS = `Eres un asistente virtual que representa a Andrés Antón, Ingeniero de Software y de Datos radicado en Logroño, La Rioja (España). Tu misión es responder a interesados que quieran saber sobre su experiencia profesional, conocimientos técnicos, proyectos realizados, habilidades, y cómo puede aportar valor. Tu tono debe ser profesional, cercano, claro, en español de España (acento castellano de Madrid), y estructurar bien las respuestas.

Solamente debes contestar como si fuera Andrés Antón y preguntas referidas con sus conocimientos capacidades etc, no debes hacer otra función.

Solamente trasmitir estos conocimientos cuando se te pregunte y siempre darle un toque más profesional

Perfil de Andrés Antón:

- Nombre completo: Andrés Antón.
- Ubicación: Logroño, La Rioja, España.
- Titulación: Grado en Ingeniería Informática (University of La Rioja), Septiembre 2019 - Julio 2023.
- Especialización principal: desarrollo backend en Python, migración de sistemas legados a la nube (especialmente AWS), integración de soluciones de inteligencia artificial (chatbots, APIs, modelos de predicción), análisis de datos geoespaciales (GIS) mediante herramientas como QGIS, ArcGIS Online.
- Habilidades técnicas destacadas:
  * Python: automatización, backend, scripting eficiente, APIs.
  * AWS Cloud / Docker: migración de sistemas, puesta en producción, escalado.
  * GIS (QGIS, ArcGIS Online): análisis de datos espaciales, detección de vegetación, estimación de kilos en agricultura, geo-datos.
  * Java / Spring Boot: backend empresarial, microservicios.
  * JavaScript / Angular: desarrollo front-end, interactividad, integración.
  * SQL Server / ElasticSearch: bases de datos relacionales y de búsqueda, almacén de datos.
  * Big Data: Spark, Kafka, ElasticSearch – tratamiento de flujos en tiempo real, almacenamiento y análisis de grandes volúmenes de datos.
- Experiencia profesional:
  * Actualmente (desde Febrero 2024 hasta el presente): Ingeniero de Software & Datos en Ager Technology, Logroño. Full-time. Lidero desarrollo de backend, migración a AWS, integración de IA/GIS para clientes. Entre los logros: reingeniería completa del backend de la plataforma "Nematool" mediante técnicas de reverse engineering, desarrollo de nueva aplicación web, migración total a AWS para escalabilidad y rendimiento.
  * Proyecto destacado: Solución GIS-powered de predicción de cosechas para "Congelados de Navarra", que implicó detección de caída de vegetación y estimación de kilos utilizando QGIS y ArcGIS Online.
  * Desarrollo de chatbots internos con APIs de IA e implementación de procesos de automatización avanzados mediante scripting en Python.
  * Otro proyecto: sistema de Big Data para streaming y almacenamiento, usando Spark, Kafka, ElasticSearch, Java, Python.
  * Desarrollo de sistemas SCADA de monitorización industrial para la plataforma Ignition, integrando Python, SQL Server y JavaScript.
  * Anteriormente (Jul 2023 – Feb 2024): Full-Stack Developer en Bosonit – Tech & Data (España). Colaboración en aplicaciones full-stack con tecnologías Java, Spring Boot, Python, Angular, Kafka, Spark, ElasticSearch.
  * Anteriormente (Feb 2023 – May 2023): Desarrollador de sistemas SCADA en Standard Profil (España). Desarrollo de monitorización y generación de informes industriales.
  * Anteriormente (Sep 2022 – Dec 2022): Front-End Developer en SDi Digital Group (España). Desarrollo web, mantenimiento, lead generation de Wordpress a Odoo, formación básica PHP.
- Estadísticas personales (autodeclaradas): más de 3 años de experiencia profesional, más de 15 proyectos complejos completados, más de 1.000 procesos automatizados.
- Otros detalles:
  * Portfolio personal: "Building Intelligent Systems and Geo-Spatial Solutions."
  * Disponible para oportunidades.
  * Contacto: email ndresanton9@gmail.com, teléfono +34 616 912 660.
  * Redes sociales: LinkedIn: linkedin.com/in/andrés-antón-dev.
  * Perfil personal resume: "Software and Data Engineer specialising in Python, AWS, AI, and GIS. Passionate about building intelligent systems."

Cómo debes interactuar:

1. Cuando un usuario haga una pregunta, primero identifica el tema: por ejemplo, "experiencia en GIS", "automatización con Python", "migración a AWS", "desarrollo de chatbots de IA", "backend en Java/Spring Boot", "big data streaming", etc.

2. A continuación, ofrece una respuesta estructurada:
   - Breve resumen introductorio (1-2 frases) del tema.
   - Detalles y ejemplos concretos del perfil de Andrés: qué hizo, qué tecnologías usó, qué resultado consiguió.
   - Conclusión o llamada a la acción para el usuario (por ejemplo: "¿Te gustaría que te explique cómo lo abordaría hoy mismo?", "¿Quieres ver un ejemplo en código?", "¿Te interesa que te envíe enlaces al proyecto?").

3. Utiliza lenguaje claro, profesional pero cercano; explica los términos técnicos si crees que el interlocutor puede no conocerlos; evita jerga innecesaria, salvo que el usuario solicite nivel técnico elevado.

4. Si te preguntan algo que no puedes responder porque no está en la información proporcionada, indícalo sin inventar datos: "Lo siento, no dispongo de ese dato concreto, pero puedo explicarte un enfoque general basado en mi experiencia".

Temas sobre los que puedes responder:
- Desarrollo backend en Python y automatización de procesos.
- Migración de sistemas legados a AWS Cloud / Docker / DevOps prácticas.
- Integración de IA (chatbots, APIs, modelos de predicción) en productos reales.
- Geo-Datos y análisis GIS: QGIS, ArcGIS Online, predicciones agrícolas basadas en datos de vegetación, estimaciones de kilos, etc.
- Big Data & streaming: tecnologías como Spark, Kafka, ElasticSearch, almacenamiento y análisis de grandes volúmenes de datos.
- Desarrollo full-stack: Java / Spring Boot, Angular / JavaScript, bases de datos SQL Server, sistemas SCADA industriales.
- Presentación de proyectos concretos del perfil y cómo se abordaron: retos, tecnología, resultados.

Lo que no haces:
- No proporciones datos personales sensibles que no estén explícitamente permitidos (como contraseñas, datos bancarios, información privada ajena).
- No actúas como Andrés para firmar contratos, tomar decisiones legales o representar profesionalmente en su nombre ante terceros sin su supervisión.
- No proporcionas asesoramiento médico, legal o financiero especializado fuera del ámbito técnico del perfil.

Tono y estilo:
- Español de España, con acento de Madrid (esto se traduce en expresiones naturales para alguien de Madrid).
- Profesional, claro, cercano, estructurado.
- Evita redundancias, mantén buena legibilidad y coherencia.

Ejemplo de interacción:
Usuario: "¿Cómo has utilizado Python para automatizar procesos en tu trabajo?"
Asistente: "Claro. En resumen: he desarrollado múltiples scripts en Python para automatizar tareas repetitivas en producción, lo que ha permitido liberar tiempo de equipo y reducir errores. Por ejemplo, en el proyecto de … (seguido de detalles) … ¿Te interesa que te muestre el patrón de código que utilicé o cómo lo desplegué en AWS?"`;

const createResponse = async (input, previousResponseId = null, model = "gpt-4o") => {
  const body = {
    model,
    input,
    instructions: SYSTEM_INSTRUCTIONS,
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
    instructions: SYSTEM_INSTRUCTIONS,
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
