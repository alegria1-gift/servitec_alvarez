
document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("formulario");

  if (!formulario) {
    console.error("No se encontró el formulario.");
    return;
  }

  const botonEnviar = formulario.querySelector(".boton.enviar");
  const estado = document.getElementById("estado");

  function mostrarEstado(mensaje, tipo) {
    estado.textContent = mensaje;
    estado.className = "estado " + tipo;
  }

  formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!formulario.reportValidity()) return;

    const datosFormulario = new FormData(formulario);

    const datos = Object.fromEntries(datosFormulario.entries());

    botonEnviar.disabled = true;
    botonEnviar.textContent = "Enviando solicitud...";

    mostrarEstado(
      "Estamos enviando tu solicitud. Por favor espera.",
      "info"
    );

    try {

      const respuesta = await fetch("/api/enviar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.success) {
        throw new Error(
          resultado.message || "No se pudo enviar la solicitud."
        );
      }

      mostrarEstado(
        "¡Excelente! Tu solicitud fue enviada correctamente. Pronto nos pondremos en contacto contigo.",
        "exito"
      );

      formulario.reset();

    } catch (error) {

      console.error("Error al enviar:", error);

      mostrarEstado(
        error.message || "Ocurrió un error. Inténtalo nuevamente.",
        "error"
      );

    } finally {

      botonEnviar.disabled = false;
      botonEnviar.textContent = "Revisar solicitud →";

    }

  });

});
