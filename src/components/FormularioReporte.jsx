import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { comprimirImagen } from "../utils/comprimirImagen";

const TIPOS_REPORTE = [
  "Foco quemado",
  "Foco parpadeando",
  "Poste dañado",
  "Cable suelto",
  "Luminaria nueva instalada",
  "Otro",
];

function FormularioReporte({ usuario }) {
  const [barrio, setBarrio] = useState("");
  const [tipo, setTipo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [foto, setFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function manejarFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setFoto(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  }

  async function enviar(e) {
    e.preventDefault();
    if (!foto) {
      alert("Por favor agrega una foto.");
      return;
    }

    setEnviando(true);
    try {
      const fotoComprimida = await comprimirImagen(foto);

      await addDoc(collection(db, "reportes"), {
        barrio,
        tipo,
        observaciones,
        foto: fotoComprimida,
        estado: "pendiente",
        uid: usuario.uid,
        electricista: usuario.nombre,
        fecha: serverTimestamp(),
      });

      alert("✅ Reporte enviado correctamente");

      // Limpia el formulario
      setBarrio("");
      setTipo("");
      setObservaciones("");
      setFoto(null);
      setVistaPrevia(null);
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo enviar el reporte. Revisa la consola (F12).");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      <h2>Nuevo reporte</h2>

      <label>Barrio</label>
      <input
        type="text"
        value={barrio}
        onChange={(e) => setBarrio(e.target.value)}
        placeholder="Ej: Santa Ana"
        required
      />

      <label>Tipo de reporte</label>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
        <option value="">Selecciona una opción</option>
        {TIPOS_REPORTE.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label>Foto</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={manejarFoto}
        id="foto"
        hidden
      />
      <label htmlFor="foto" className="boton-foto">
        📷 {foto ? "Cambiar foto" : "Agregar foto"}
      </label>

      {vistaPrevia && (
        <img src={vistaPrevia} alt="Vista previa" className="vista-previa" />
      )}

      <label>Observaciones (opcional)</label>
      <textarea
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        rows="3"
        placeholder="Ej: Frente a la escuela, poste #12"
      />

      <button type="submit" className="boton-enviar" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar reporte"}
      </button>
    </form>
  );
}

export default FormularioReporte;