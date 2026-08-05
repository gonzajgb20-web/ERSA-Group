const db = require('../config/db');

async function createCambio(req, res) {
  const { interno_id, fecha_cambio, kilometraje, mecanicos } = req.body;
  const imagen_comprobante = req.file ? req.file.path : null;

  if (!interno_id) {
    return res.status(400).json({ success: false, error: 'Identificador de colectivo no válido.' });
  }

  if (!fecha_cambio) {
    return res.status(400).json({ success: false, error: 'La fecha del cambio de aceite es obligatoria.' });
  }

  const kmVal = parseInt(kilometraje);
  if (isNaN(kmVal) || kmVal <= 0) {
    return res.status(400).json({ success: false, error: 'El kilometraje debe ser un número entero mayor a 0.' });
  }

  if (!mecanicos || !String(mecanicos).trim()) {
    return res.status(400).json({ success: false, error: 'Debe ingresar al menos un mecánico responsable.' });
  }

  try {
    // Verificar existencia del colectivo
    const internoResult = await db.query('SELECT id, numero_interno FROM internos WHERE id = $1', [interno_id]);
    if (internoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'El colectivo especificado no existe.' });
    }

    const numeroInterno = internoResult.rows[0].numero_interno;

    const insertResult = await db.query(
      `INSERT INTO historial_cambios (interno_id, fecha_cambio, kilometraje, mecanicos, imagen_comprobante)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [interno_id, fecha_cambio, kmVal, String(mecanicos).trim(), imagen_comprobante]
    );

    return res.status(201).json({
      success: true,
      message: `Cambio de aceite registrado correctamente para el Interno N° ${numeroInterno}`,
      data: {
        ...insertResult.rows[0],
        numero_interno: numeroInterno
      }
    });

  } catch (err) {
    console.error('Error al registrar cambio de aceite:', err);
    return res.status(500).json({ success: false, error: 'Error del servidor al registrar el cambio de aceite.' });
  }
}

module.exports = {
  createCambio
};
