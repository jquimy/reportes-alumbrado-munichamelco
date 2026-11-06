import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, correo, clave);
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="formulario">
      <h2>Iniciar sesión</h2>

      <label>Correo</label>
      <input
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />

      <label>Contraseña</label>
      <input
        type="password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        required
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" className="boton-enviar" disabled={cargando}>
        {cargando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default Login;