const fetchWithFallback = (...args) => {
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch(...args);
  }
  return import("node-fetch").then(({ default: fetch }) => fetch(...args));
};

// Función para obtener la IP del cliente
const getClientIP = (event) => {
  return event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || 
         event.headers["x-nf-client-connection-ip"] || 
         event.headers["client-ip"] || 
         event.headers["x-real-ip"] ||
         "unknown";
};

// Función para obtener información del user agent
const getUserAgent = (event) => {
  return event.headers["user-agent"] || "unknown";
};

// Función para obtener el referer
const getReferer = (event) => {
  return event.headers["referer"] || event.headers["referrer"] || "direct";
};

// Función para guardar en Netlify DB (Neon PostgreSQL)
const saveToNetlifyDB = async (eventData, serverTimestamp) => {
  try {
    // Verificar que NETLIFY_DATABASE_URL esté disponible
    if (!process.env.NETLIFY_DATABASE_URL) {
      console.warn("NETLIFY_DATABASE_URL no está disponible");
      return { success: false, error: "NETLIFY_DATABASE_URL not configured" };
    }

    // Importar @netlify/neon dinámicamente
    const { neon } = await import("@netlify/neon");
    const sql = neon(); // Automáticamente usa NETLIFY_DATABASE_URL
    
    // Insertar el evento en la base de datos
    const result = await sql`
      INSERT INTO events (
        event_type,
        element,
        section,
        url,
        client_ip,
        user_agent,
        referer,
        client_timestamp,
        server_timestamp,
        language,
        viewport_width,
        viewport_height,
        additional_data
      ) VALUES (
        ${eventData.eventType},
        ${eventData.element},
        ${eventData.section},
        ${eventData.url},
        ${eventData.clientIP},
        ${eventData.userAgent.substring(0, 500)},
        ${eventData.referer},
        ${eventData.clientTimestamp},
        ${serverTimestamp},
        ${eventData.additionalData?.language || null},
        ${eventData.additionalData?.viewport?.width || null},
        ${eventData.additionalData?.viewport?.height || null},
        ${JSON.stringify(eventData.additionalData || {})}
      )
    `;
    
    console.log("Event saved to Netlify DB successfully");
    return { success: true, result };
  } catch (error) {
    console.error("Error saving to Netlify DB:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      eventType: eventData.eventType
    });
    return { success: false, error: error.message };
  }
};

exports.handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" },
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      eventType,      // Tipo de evento: 'click', 'scroll', 'pageview', 'navigation', etc.
      element,       // Elemento donde ocurrió el evento
      section,       // Sección de la página
      url,           // URL actual
      timestamp,     // Timestamp del cliente
      additionalData // Datos adicionales
    } = body;

    // Obtener información del servidor
    const serverTimestamp = new Date().toISOString();
    const clientIP = getClientIP(event);
    const userAgent = getUserAgent(event);
    const referer = getReferer(event);

    // Crear el objeto de evento
    const eventData = {
      eventType: eventType || "unknown",
      element: element || null,
      section: section || null,
      url: url || event.headers["referer"] || "unknown",
      clientIP,
      userAgent,
      referer,
      clientTimestamp: timestamp || serverTimestamp,
      serverTimestamp,
      additionalData: additionalData || {},
      // Información adicional del request
      method: event.httpMethod,
      path: event.path,
    };

    // Aquí puedes guardar el evento en diferentes lugares:
    // 1. En un archivo (usando el sistema de archivos de Netlify)
    // 2. En una base de datos (MongoDB, PostgreSQL, etc.)
    // 3. En un servicio externo (Google Analytics, Mixpanel, etc.)
    // 4. En un servicio de logging (Loggly, Papertrail, etc.)

    // Por ahora, simplemente logueamos el evento
    // En producción, deberías guardarlo en una base de datos o servicio de logging
    console.log("Event tracked:", JSON.stringify(eventData, null, 2));

    // Opción 1: Guardar en Netlify DB (Neon PostgreSQL) - RECOMENDADO si tienes Netlify DB configurado
    // Netlify DB usa automáticamente NETLIFY_DATABASE_URL si está disponible
    let dbSaveResult = null;
    if (process.env.NETLIFY_DATABASE_URL) {
      dbSaveResult = await saveToNetlifyDB(eventData, serverTimestamp);
      if (!dbSaveResult.success) {
        console.error("Failed to save to Netlify DB:", dbSaveResult.error);
      }
    } else {
      console.warn("NETLIFY_DATABASE_URL no está configurada. Los eventos no se guardarán en la BD.");
    }

    // Opción 2: Guardar en un servicio externo (ejemplo con un webhook)
    // Puedes configurar un webhook URL en las variables de entorno
    const WEBHOOK_URL = process.env.TRACKING_WEBHOOK_URL;
    
    if (WEBHOOK_URL) {
      try {
        await fetchWithFallback(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });
      } catch (webhookError) {
        console.error("Error sending to webhook:", webhookError);
        // No fallamos la request si el webhook falla
      }
    }

    // Opción 3: Guardar en Supabase (PostgreSQL gratuito)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
    
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetchWithFallback(`${SUPABASE_URL}/rest/v1/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            event_type: eventData.eventType,
            element: eventData.element,
            section: eventData.section,
            url: eventData.url,
            client_ip: eventData.clientIP,
            user_agent: eventData.userAgent.substring(0, 500),
            referer: eventData.referer,
            client_timestamp: eventData.clientTimestamp,
            server_timestamp: serverTimestamp,
            language: eventData.additionalData?.language || null,
            viewport_width: eventData.additionalData?.viewport?.width || null,
            viewport_height: eventData.additionalData?.viewport?.height || null,
            additional_data: eventData.additionalData || {}
          }),
        });
      } catch (supabaseError) {
        console.error("Error saving to Supabase:", supabaseError);
        // No fallamos la request si falla
      }
    }

    // Opción 4: Guardar en MongoDB Atlas usando Data API (gratuito)
    const MONGODB_APP_ID = process.env.MONGODB_APP_ID;
    const MONGODB_API_KEY = process.env.MONGODB_API_KEY;
    const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;
    const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "portfolio";
    
    if (MONGODB_APP_ID && MONGODB_API_KEY && MONGODB_CLUSTER) {
      try {
        // MongoDB Atlas Data API
        const mongoApiUrl = `https://data.mongodb-api.com/app/${MONGODB_APP_ID}/endpoint/data/v1/action/insertOne`;
        
        await fetchWithFallback(mongoApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": MONGODB_API_KEY
          },
          body: JSON.stringify({
            dataSource: MONGODB_CLUSTER,
            database: MONGODB_DATABASE,
            collection: "events",
            document: {
              eventType: eventData.eventType,
              element: eventData.element,
              section: eventData.section,
              url: eventData.url,
              clientIP: eventData.clientIP,
              userAgent: eventData.userAgent.substring(0, 500),
              referer: eventData.referer,
              clientTimestamp: eventData.clientTimestamp,
              serverTimestamp: serverTimestamp,
              language: eventData.additionalData?.language || null,
              viewportWidth: eventData.additionalData?.viewport?.width || null,
              viewportHeight: eventData.additionalData?.viewport?.height || null,
              additionalData: eventData.additionalData || {},
              createdAt: new Date()
            }
          }),
        });
      } catch (mongoError) {
        console.error("Error saving to MongoDB:", mongoError);
        // No fallamos la request si falla
      }
    }

    // Opción 5: Guardar en Google Sheets usando Google Apps Script
    const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK;
    
    if (GOOGLE_SHEETS_WEBHOOK) {
      try {
        // Formatear datos para Google Sheets (fila simple)
        const sheetData = {
          timestamp: serverTimestamp,
          eventType: eventData.eventType,
          section: eventData.section || '',
          element: eventData.element || '',
          url: eventData.url,
          clientIP: eventData.clientIP,
          userAgent: eventData.userAgent.substring(0, 200), // Limitar longitud
          referer: eventData.referer,
          language: eventData.additionalData?.language || 'unknown',
          viewportWidth: eventData.additionalData?.viewport?.width || '',
          viewportHeight: eventData.additionalData?.viewport?.height || '',
          additionalInfo: JSON.stringify(eventData.additionalData || {}).substring(0, 500)
        };

        await fetchWithFallback(GOOGLE_SHEETS_WEBHOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sheetData),
        });
      } catch (sheetsError) {
        console.error("Error sending to Google Sheets:", sheetsError);
        // No fallamos la request si falla
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Event tracked successfully",
        eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        savedToDB: dbSaveResult?.success || false,
        dbError: dbSaveResult?.error || null
      }),
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    console.error("Error tracking event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Error al registrar el evento",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};

