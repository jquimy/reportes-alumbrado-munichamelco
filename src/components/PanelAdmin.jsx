import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const TIPOS = [
  "Foco quemado",
  "Foco parpadeando",
  "Poste dañado",
  "Cable suelto",
  "Luminaria nueva instalada",
  "Otro",
];

function formatearFecha(fecha) {
  if (!fecha) return "Enviando...";
  return fecha.toDate().toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PanelAdmin({ usuario }) {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBarrio, setFiltroBarrio] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [fotoGrande, setFotoGrande] = useState(null);

  useEffect(() => {
    const consulta = query(
      collection(db, "reportes"),
      orderBy("fecha", "desc"),
      limit(100)
    );

    // onSnapshot = "escucha" los cambios en vivo
    const cancelar = onSnapshot(
      consulta,
      (snap) => {
        setReportes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCargando(false);
      },
      (error) => {
        console.error(error);
        setCargando(false);
      }
    );

    return cancelar; // deja de escuchar al salir de la pantalla
  }, []);

  async function marcarAtendido(id) {
    try {
      await updateDoc(doc(db, "reportes", id), {
        estado: "atendido",
        atendidoPor: usuario.nombre,
        fechaAtendido: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el reporte.");
    }
  }

  const visibles = reportes.filter(
    (r) =>
      r.barrio.toLowerCase().includes(filtroBarrio.toLowerCase()) &&
      (filtroTipo === "" || r.tipo === filtroTipo) &&
      (filtroEstado === "" || r.estado === filtroEstado)
  );

  const pendientes = reportes.filter((r) => r.estado === "pendiente").length;

  return (
    <div>
      <h2 className="titulo-panel">Panel administrativo</h2>
      <p className="resumen">
        {pendientes} pendiente(s) · {reportes.length} reporte(s) en total
      </p>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar barrio..."
          value={filtroBarrio}
          onChange={(e) => setFiltroBarrio(e.target.value)}
        />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="atendido">Atendidos</option>
        </select>
      </div>

      {cargando && <p>Cargando reportes...</p>}
      {!cargando && visibles.length === 0 && <p>No hay reportes para mostrar.</p>}

      <div className="rejilla">
        {visibles.map((r) => (
          <article key={r.id} className="reporte">
            <img
              src={r.foto}
              alt={`Foto: ${r.tipo} en ${r.barrio}`}
              onClick={() => setFotoGrande(r.foto)}
            />
            <div className="reporte-info">
              <span className={`etiqueta ${r.estado}`}>{r.estado}</span>
              <h3>{r.tipo}</h3>
              <p>
                <strong>Barrio:</strong> {r.barrio}
              </p>
              <p>
                <strong>Electricista:</strong> {r.electricista}
              </p>
              <p>
                <strong>Fecha:</strong> {formatearFecha(r.fecha)}
              </p>
              {r.observaciones && (
                <p>
                  <strong>Obs.:</strong> {r.observaciones}
                </p>
              )}
              {r.estado === "pendiente" ? (
                <button
                  className="boton-atender"
                  onClick={() => marcarAtendido(r.id)}
                >
                  ✔ Marcar como atendido
                </button>
              ) : (
                <p className="atendido-por">Atendido por {r.atendidoPor}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      {fotoGrande && (
        <div className="modal" onClick={() => setFotoGrande(null)}>
          <img src={fotoGrande} alt="Foto ampliada" />
        </div>
      )}
    </div>
  );
}

export default PanelAdmin;