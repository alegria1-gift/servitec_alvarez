
const formulario = document.getElementById("formulario");
const botonEnviar = formulario.querySelector(".boton.enviar");

// Elemento para mostrar mensajes
const estado = document.getElementById("estado");

// Mostrar mensajes al visitante
function mostrarEstado(mensaje, tipo) {
  estado.textContent = mensaje;
  estado.className = "estado " + tipo;
}

// Enviar formulario
formulario.addEventListener("submit", async function (event) {

  event.preventDefault();

  // Validar campos obligatorios
  if (!formulario.reportValidity()) {
    return;
  }

  // Obtener datos del formulario
  const datos = new FormData(formulario);

  // Deshabilitar botón
  botonEnviar.disabled = true;
  botonEnviar.textContent = "Enviando solicitud...";

  mostrarEstado(
    "Estamos enviando tu solicitud. Espera un momento.",
    "info"
  );

  try {

    // Enviar información al servidor
    const respuesta = await fetch("/api/enviar", {
      method: "POST",
      body: datos
    });

    const resultado = await respuesta.json();

    // Comprobar respuesta
    if (!respuesta.ok || !resultado.success) {
      throw new Error(
        resultado.message || "No se pudo enviar la solicitud."
      );
    }

    // Mostrar confirmación
    mostrarEstado(
      "¡Excelente! Tu solicitud fue enviada correctamente. Pronto nos pondremos en contacto contigo.",
      "exito"
    );

    // Limpiar formulario
    formulario.reset();

  } catch (error) {

    mostrarEstado(
      error.message || "Ocurrió un error al enviar la solicitud. Inténtalo nuevamente.",
      "error"
    );

  } finally {

    // Reactivar botón
    botonEnviar.disabled = false;
    botonEnviar.textContent = "Revisar solicitud →";

  }

});
