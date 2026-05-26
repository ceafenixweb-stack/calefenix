/* ══════════════════════════════════════════════════════════════
   CONFIGURACIÓN SUPABASE — CEA Fénix
   IMPORTANTE: esta es la clave pública (publishable), es segura
   para el frontend. NUNCA subas la secret key al repositorio.
══════════════════════════════════════════════════════════════ */
const SUPABASE_URL = "https://xkyfqqewxxsmdzjvrlpp.supabase.co";
const SUPABASE_KEY = "sb_publishable__8XDVZxZLHSvLQ6Sw_79AA_KFw32ygY";

async function cargarPreguntas() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/preguntas?activa=eq.true&select=categoria,pregunta,opciones,respuesta,explicacion`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Transformar al formato que usa main.js
    return data.map(p => ({
      cat: p.categoria,
      q:   p.pregunta,
      opts: p.opciones,
      ans:  p.respuesta,
      exp:  p.explicacion
    }));
  } catch (err) {
    console.error("Error cargando preguntas desde Supabase:", err);
    return null;
  }
}
