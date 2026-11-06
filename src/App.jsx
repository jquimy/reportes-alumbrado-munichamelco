import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import logo from "./assets/logo.png";
import "./App.css";
import Login from "./components/Login";
import FormularioReporte from "./components/FormularioReporte";
import PanelAdmin from "./components/PanelAdmin";

function App() {
  const [usuario, setUsuario] = useState(null); // { uid, nombre, rol }
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Se ejecuta cada vez que alguien inicia o cierra sesión
    const cancelar = onAuthStateChanged(auth, async (user) => {
      setCargando(true);

      if (!user) {
        setUsuario(null);
        setCargando(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (snap.exists()) {
          setUsuario({ uid: user.uid, ...snap.data() });
        } else {
          alert("Tu cuenta no tiene un rol asignado. Contacta al administrador.");
          await signOut(auth);
        }
      } catch (error) {
        console.error(error);
        await signOut(auth);
      }
      setCargando(false);
    });

    return cancelar;
  }, []);

  function pantalla() {
    if (cargando) return <p>Cargando...</p>;
    if (!usuario) return <Login />;
    if (usuario.rol === "electricista") {
      return <FormularioReporte usuario={usuario} />;
    }
        if (usuario.rol === "administrativo") {
      return <PanelAdmin usuario={usuario} />;
    }
    return <p>Rol no reconocido.</p>;
  }

  return (
    <>
      <header className="encabezado">
        <img src={logo} alt="Logo Aj Poop B'atz'" />
        <div>
          <h1>Dirección de Servicios Públicos Municipales</h1>
          <p>Sistema de reportes de alumbrado</p>
        </div>

        {usuario && (
          <div className="sesion">
            <span>{usuario.nombre}</span>
            <button onClick={() => signOut(auth)}>Salir</button>
          </div>
        )}
      </header>

      <main className="contenedor">
        <div className="tarjeta">{pantalla()}</div>
      </main>
    </>
  );
}

export default App;