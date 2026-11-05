
import { Resend } from "resend";
import { formidable } from "formidable";

export const config = {
  api: {
    bodyParser: false
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);

// Escapar caracteres HTML para evitar inyecciones
function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caracter]);
}

// Obtener el valor de un campo
function obtenerCampo(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function handler(req, res) {

  // Validar método HTTP
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método no permitido."
    });
  }

  try {

    // Procesar formulario
    const form = formidable({
      multiples: false,
      allowEmptyFiles: false
    });

    const [fields] = await form.parse(req);

    // Obtener campos
    const nombre = obtenerCampo(fields.nombre);
    const telefono = obtenerCampo(fields.telefono);
    const equipo = obtenerCampo(fields.equipo);
    const tipo = obtenerCampo(fields.tipo);
    const ciudad = obtenerCampo(fields.ciudad);
    const fecha = obtenerCampo(fields.fecha);
    const direccion = obtenerCampo(fields.direccion);
    const detalle = obtenerCampo(fields.detalle);

    // Validar campos obligatorios
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

    // Validar variables de entorno
    const destino = process.env.DESTINO_EMAIL;
    const remitente = process.env.REMITENTE_EMAIL;

    if (
      !process.env.RESEND_API_KEY ||
      !destino ||
      !remitente
    ) {
      throw new Error("Falta configurar las variables de correo.");
    }

    // Enviar correo
    const { data, error } = await resend.emails.send({

      from: remitente,
      to: [destino],

      subject: `Nueva solicitud de servicio - ${nombre}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 25px;
          color: #333;
          border: 1px solid #eee;
          border-radius: 10px;
        ">

          <h2 style="color: #1c3f60;">
            Nueva solicitud de servicio técnico
          </h2>

          <p>Se ha recibido una nueva solicitud desde el formulario web.</p>

          <hr>

          <h3>Información del cliente</h3>

          <p>
            <strong>Nombre completo:</strong><br>
            ${escaparHTML(nombre)}
          </p>

          <p>
            <strong>Celular:</strong><br>
            ${escaparHTML(telefono)}
          </p>

          <p>
            <strong>Ciudad:</strong><br>
            ${escaparHTML(ciudad)}
          </p>

          <p>
            <strong>Dirección y barrio:</strong><br>
            ${escaparHTML(direccion)}
          </p>

          <hr>

          <h3>Información del servicio</h3>

          <p>
            <strong>Electrodoméstico:</strong><br>
            ${escaparHTML(equipo)}
          </p>

          <p>
            <strong>Tipo de servicio:</strong><br>
            ${escaparHTML(tipo)}
          </p>

          <p>
            <strong>Fecha preferida:</strong><br>
            ${escaparHTML(fecha || "No indicada")}
          </p>

          <p>
            <strong>Descripción de la falla:</strong><br>
            ${escaparHTML(detalle || "Sin descripción")}
          </p>

          <hr>

          <p style="font-size: 12px; color: #888;">
            Este mensaje fue generado automáticamente
            desde el formulario de solicitud de servicio técnico.
          </p>

        </div>
      `
    });

    // Validar respuesta de Resend
    if (error) {
      console.error("Error de Resend:", error);

      return res.status(500).json({
        success: false,
        message: "No se pudo enviar la solicitud."
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: "Solicitud enviada correctamente."
    });

  } catch (error) {

    console.error("Error en el formulario:", error);

    return res.status(400).json({
      success: false,
      message: "No se pudo procesar la solicitud. Inténtalo nuevamente."
    });

  }
}

