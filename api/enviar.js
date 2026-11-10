
import { Resend } from "resend";

// Escapar caracteres HTML
function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caracter]);
}

export default async function handler(req, res) {

  // Validar método
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método no permitido."
    });
  }

  try {

    // Obtener información enviada desde scripts.js
    const {
      nombre,
      telefono,
      equipo,
      tipo,
      ciudad,
      fecha,
      direccion,
      detalle
    } = req.body || {};

    // Validar campos
    if (
      !nombre?.trim() ||
      !telefono?.trim() ||
      !equipo?.trim() ||
      !tipo?.trim() ||
      !ciudad?.trim() ||
      !direccion?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Completa todos los campos obligatorios."
      });
    }

    // Obtener variables de entorno
  // Obtener variables de entorno
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const destino = process.env.DESTINO_EMAIL?.trim();
    const remitente = process.env.REMITENTE_EMAIL?.trim();

    // Comprobar qué variables están disponibles
    const faltantes = [];

    if (!apiKey) faltantes.push("RESEND_API_KEY");
    if (!destino) faltantes.push("DESTINO_EMAIL");
    if (!remitente) faltantes.push("REMITENTE_EMAIL");

    console.log("Diagnóstico de variables:", {
      RESEND_API_KEY: Boolean(apiKey),
      DESTINO_EMAIL: Boolean(destino),
      REMITENTE_EMAIL: Boolean(remitente)
    });

    if (faltantes.length > 0) {
      console.error("Variables faltantes:", faltantes);

      return res.status(500).json({
        success: false,
        message: "Faltan variables de entorno: " + faltantes.join(", ")
      });
    }
    // Inicializar Resend
    const resend = new Resend(apiKey);

    // Crear contenido del correo
    const html = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 25px;
        color: #18363b;
        border: 1px solid #ddd;
        border-radius: 12px;
      ">

        <h2 style="color: #102d35;">
          Nueva solicitud - Servitec Alvarez
        </h2>

        <p>Se ha recibido una nueva solicitud desde la página web.</p>

        <hr>

        <h3>Información del cliente</h3>

        <p><strong>Nombre:</strong><br>
        ${escaparHTML(nombre)}</p>

        <p><strong>Teléfono:</strong><br>
        ${escaparHTML(telefono)}</p>

        <p><strong>Ciudad:</strong><br>
        ${escaparHTML(ciudad)}</p>

        <p><strong>Dirección:</strong><br>
        ${escaparHTML(direccion)}</p>

        <hr>

        <h3>Información del servicio</h3>

        <p><strong>Electrodoméstico:</strong><br>
        ${escaparHTML(equipo)}</p>

        <p><strong>Tipo de servicio:</strong><br>
        ${escaparHTML(tipo)}</p>

        <p><strong>Fecha preferida:</strong><br>
        ${escaparHTML(fecha || "No indicada")}</p>

        <p><strong>Descripción de la falla:</strong><br>
        ${escaparHTML(detalle || "Sin descripción")}</p>

        <hr>

        <p style="font-size: 12px; color: #777;">
          Mensaje automático generado por Servitec Alvarez.
        </p>

      </div>
    `;

    // Enviar correo
    const { data, error } = await resend.emails.send({

      from: remitente,

      to: [destino],

      subject: `Nueva solicitud de servicio - ${nombre}`,

      html: html,

      text: `
Nueva solicitud de Servitec Alvarez

Cliente: ${nombre}
Teléfono: ${telefono}
Ciudad: ${ciudad}
Dirección: ${direccion}

Equipo: ${equipo}
Servicio: ${tipo}
Fecha: ${fecha || "No indicada"}

Descripción:
${detalle || "Sin descripción"}
      `

    });

    // Comprobar resultado
    if (error) {

      console.error("Error de Resend:", error);

      return res.status(502).json({
        success: false,
        message: "Resend no pudo enviar el correo. Revisa la configuración."
      });

    }

    console.log("Correo enviado correctamente:", data?.id);

    return res.status(200).json({
      success: true,
      message: "Solicitud enviada correctamente.",
      id: data?.id
    });

  } catch (error) {

    console.error("Error en API enviar:", error);

    return res.status(500).json({
      success: false,
      message: "Error interno al procesar la solicitud."
    });

  }

}
