const nodemailer = require("nodemailer");

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
    const { name, email, subject, message } = JSON.parse(event.body || "{}");

    // Validar campos requeridos
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan campos requeridos" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email no válido" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Obtener la IP del cliente
    const clientIP = event.headers["x-forwarded-for"]?.split(",")[0] || 
                     event.headers["x-nf-client-connection-ip"] || 
                     event.headers["client-ip"] || 
                     "unknown";

    // Configuración SMTP desde variables de entorno
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 587;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || "ndresanton9@gmail.com";

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Servicio de correo no configurado. Por favor, configura las variables de entorno SMTP." 
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Crear transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: SMTP_PORT == 465, // true para 465, false para otros puertos
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Configurar el correo
    const mailOptions = {
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: subject || `Nuevo mensaje del portafolio de ${name}`,
      html: `
        <h2>Nuevo mensaje del portafolio</h2>
        <p><strong>De:</strong> ${name} (${email})</p>
        ${subject ? `<p><strong>Asunto:</strong> ${subject}</p>` : ''}
        <p><strong>IP del cliente:</strong> ${clientIP}</p>
        <hr>
        <h3>Mensaje:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Enviado desde el formulario de contacto del portafolio</small></p>
      `,
      text: `
Nuevo mensaje del portafolio

De: ${name} (${email})
${subject ? `Asunto: ${subject}` : ''}
IP del cliente: ${clientIP}

Mensaje:
${message}

---
Enviado desde el formulario de contacto del portafolio
      `,
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Correo enviado correctamente",
        messageId: info.messageId
      }),
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Error al enviar el correo. Por favor, inténtalo de nuevo más tarde.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};

