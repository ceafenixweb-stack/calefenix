/* ══════════════════════════════════════════════════════════════
   CONFIGURACIÓN SUPABASE — CEA Fénix
   anon key: segura para el frontend (solo lectura con RLS activo)
   NUNCA subas la service_role key al repositorio.
══════════════════════════════════════════════════════════════ */
const SUPABASE_URL = "https://xkyfqqewxxsmdzjvrlpp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreWZxcWV3eHhzbWR6anZybHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTk1OTQsImV4cCI6MjA5NTMzNTU5NH0.3188IFGUvesomnPiutz54QKd99gUgUFaSJEPyhnGJKM";

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
    return data.map(p => ({
      cat:  p.categoria,
      q:    p.pregunta,
      opts: p.opciones,
      ans:  p.respuesta,
      exp:  p.explicacion
    }));
  } catch (err) {
    console.error("Error cargando preguntas desde Supabase:", err);
    return null;
  }
}
