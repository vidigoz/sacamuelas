// ============================================================
// Netlify Function: obtener el ranking (Top 10) desde Neon
// Ruta pública: GET /api/leaderboard
// Devuelve: { scores: [ { name, country, patients, timeMs }, ... ] }
// Orden: pacientes DESC, luego time_ms ASC (el desempate por menos tiempo).
// ============================================================
import { neon } from '@neondatabase/serverless';

const TOP_N = 10;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default async () => {
  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({ error: 'Falta DATABASE_URL en el servidor' }), {
      status: 500, headers: JSON_HEADERS,
    });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT name, country, patients, time_ms
      FROM scores
      ORDER BY patients DESC, time_ms ASC
      LIMIT ${TOP_N}
    `;

    const scores = rows.map(r => ({
      name: r.name,
      country: r.country,
      patients: r.patients,
      timeMs: Number(r.time_ms),
    }));

    return new Response(JSON.stringify({ scores }), {
      status: 200,
      // Cache corto para no golpear la BD en cada carga
      headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=15' },
    });
  } catch (err) {
    console.error('Error leyendo ranking:', err);
    return new Response(JSON.stringify({ error: 'Error al leer el ranking' }), {
      status: 500, headers: JSON_HEADERS,
    });
  }
};
