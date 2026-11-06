export function comprimirImagen(archivo, ladoMax = 1024, calidad = 0.6) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = reject;

    lector.onload = () => {
      const img = new Image();
      img.onerror = reject;

      img.onload = () => {
        // Calcula el tamaño nuevo (máximo 1024 px por el lado más largo)
        const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);

        // Dibuja la foto reducida y la exporta como JPEG comprimido
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", calidad));
      };

      img.src = lector.result;
    };

    lector.readAsDataURL(archivo);
  });
}