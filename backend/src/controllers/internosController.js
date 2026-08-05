const db = require('../config/db');

// Obtener todos los internos ordenados por Prioridad de Mantenimiento
async function getInternos(req, res) {
  try {
    const query = `
      SELECT 
        i.id,
        i.numero_interno,
        COALESCE(i.marca, 'Volkswagen') AS marca,
        i.imagen_url,
        i.creado_en,
        h.fecha_cambio AS ultimo_cambio_fecha,
        h.kilometraje AS ultimo_kilometraje,
        h.mecanicos AS ultimo_mecanicos
      FROM internos i
      LEFT JOIN (
        SELECT hc1.*
        FROM historial_cambios hc1
        INNER JOIN (
          SELECT interno_id, MAX(fecha_cambio) as max_fecha, MAX(id) as max_id
          FROM historial_cambios
          GROUP BY interno_id
        ) hc2 ON hc1.interno_id = hc2.interno_id AND hc1.id = hc2.max_id
      ) h ON i.id = h.interno_id
      ORDER BY 
        CASE WHEN h.fecha_cambio IS NULL THEN 0 ELSE 1 END ASC,
        h.fecha_cambio ASC,
        CASE WHEN i.numero_interno ~ '^[0-9]+$' THEN i.numero_interno::INTEGER ELSE 999999 END ASC,
        i.numero_interno ASC;
    `;

    const result = await db.query(query);
    return res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    console.error('Error al consultar internos en PostgreSQL:', err.message);
    return res.status(500).json({ 
      success: false, 
      error: `Error al consultar la base de datos Supabase: ${err.message}. Verifique que el script schema.sql haya sido ejecutado en el Editor SQL de Supabase.` 
    });
  }
}

// Agregar nuevo interno a la flota
async function createInterno(req, res) {
  const { numero_interno, marca } = req.body;
  const numTrimmed = numero_interno ? String(numero_interno).trim() : '';
  const marcaTrimmed = marca && String(marca).trim() ? String(marca).trim() : 'Volkswagen';
  const imagen_url = req.file ? req.file.path : null;

  if (!numTrimmed) {
    return res.status(400).json({ success: false, error: 'El número de interno es obligatorio.' });
  }

  try {
    const checkResult = await db.query('SELECT id FROM internos WHERE numero_interno = $1', [numTrimmed]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ success: false, error: `El Interno N° ${numTrimmed} ya existe en el sistema.` });
    }

    const insertResult = await db.query(
      'INSERT INTO internos (numero_interno, marca, imagen_url) VALUES ($1, $2, $3) RETURNING *',
      [numTrimmed, marcaTrimmed, imagen_url]
    );

    return res.status(201).json({
      success: true,
      message: `Interno N° ${numTrimmed} (${marcaTrimmed}) agregado con éxito a la flota.`,
      data: insertResult.rows[0]
    });

  } catch (err) {
    console.error('Error al crear interno:', err);
    return res.status(500).json({ success: false, error: 'Error de base de datos al agregar el colectivo: ' + err.message });
  }
}

// Eliminar un interno por ID
async function deleteInterno(req, res) {
  const { id } = req.params;

  try {
    const checkResult = await db.query('SELECT numero_interno FROM internos WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'El colectivo no existe o ya fue eliminado.' });
    }

    const numInterno = checkResult.rows[0].numero_interno;
    await db.query('DELETE FROM internos WHERE id = $1', [id]);

    return res.json({
      success: true,
      message: `El Interno N° ${numInterno} fue eliminado correctamente del sistema.`,
      id
    });

  } catch (err) {
    console.error('Error al eliminar interno:', err);
    return res.status(500).json({ success: false, error: 'Error al eliminar el colectivo: ' + err.message });
  }
}

module.exports = {
  getInternos,
  createInterno,
  deleteInterno
};
