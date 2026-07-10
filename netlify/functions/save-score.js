// ============================================================
// Netlify Function: guardar un puntaje en el ranking (Neon)
// Ruta pública: POST /api/save-score
// Body JSON: { name, country, patients, timeMs }
// ============================================================
import { neon } from '@neondatabase/serverless';

// Límites de validación (anti-basura / anti-trampa básico)
const MAX_NAME_LEN     = 24;
const MAX_PATIENTS     = 100000;   // techo razonable; nadie atiende más que esto
const MAX_TIME_MS      = 24 * 60 * 60 * 1000; // 24h de racha como máximo lógico

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405, headers: JSON_HEADERS,
    });
  }

  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({ error: 'Falta DATABASE_URL en el servidor' }), {
      status: 500, headers: JSON_HEADERS,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400, headers: JSON_HEADERS,
    });
  }

  // ---------- Validación ----------
  let { name, country, patients, timeMs } = body || {};

  name = typeof name === 'string' ? name.trim().slice(0, MAX_NAME_LEN) : '';
  if (!name) {
    return new Response(JSON.stringify({ error: 'El nombre no puede estar vacío' }), {
      status: 400, headers: JSON_HEADERS,
    });
  }

  // País: código de 2 letras a-z. Si no es válido, se guarda 'xx' (bandera neutra).
  country = typeof country === 'string' ? country.trim().toLowerCase() : '';
  if (!/^[a-z]{2}$/.test(country)) country = 'xx';

  patients = Number(patients);
  timeMs   = Number(timeMs);

  if (!Number.isFinite(patients) || !Number.isInteger(patients) || patients < 0 || patients > MAX_PATIENTS) {
    return new Response(JSON.stringify({ error: 'Número de pacientes inválido' }), {
      status: 400, headers: JSON_HEADERS,
    });
  }
  if (!Number.isFinite(timeMs) || timeMs < 0 || timeMs > MAX_TIME_MS) {
    return new Response(JSON.stringify({ error: 'Tiempo inválido' }), {
      status: 400, headers: JSON_HEADERS,
    });
  }
  timeMs = Math.round(timeMs);

  // ---------- Guardar ----------
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      INSERT INTO scores (name, country, patients, time_ms)
      VALUES (${name}, ${country}, ${patients}, ${timeMs})
      RETURNING id
    `;

    // Calcular en qué puesto quedó (ranking = pacientes DESC, luego tiempo ASC)
    const rankRows = await sql`
      SELECT COUNT(*) + 1 AS rank
      FROM scores
      WHERE patients > ${patients}
         OR (patients = ${patients} AND time_ms < ${timeMs})
    `;
    const rank = Number(rankRows[0].rank);

    return new Response(JSON.stringify({ ok: true, id: rows[0].id, rank }), {
      status: 200, headers: JSON_HEADERS,
    });
  } catch (err) {
    console.error('Error guardando puntaje:', err);
    return new Response(JSON.stringify({ error: 'Error al guardar en la base de datos' }), {
      status: 500, headers: JSON_HEADERS,
    });
  }
};
