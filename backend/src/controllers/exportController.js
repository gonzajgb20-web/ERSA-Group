const ExcelJS = require('exceljs');
const db = require('../config/db');

async function exportExcel(req, res) {
  try {
    const query = `
      SELECT 
        i.numero_interno,
        COALESCE(i.marca, 'Volkswagen') AS marca,
        COALESCE(TO_CHAR(h.fecha_cambio, 'DD/MM/YYYY'), 'Sin Registro') AS fecha_cambio,
        COALESCE(h.kilometraje, 0) AS kilometraje,
        COALESCE(h.mecanicos, 'Sin Registrar') AS mecanicos
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
      ORDER BY CAST(REGEXP_REPLACE(i.numero_interno, '\\D', '', 'g') AS INTEGER) ASC;
    `;

    const result = await db.query(query);
    const registros = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Padrón Flota ERSA', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    // Fila 1 a 3: Banner de título corporativo ERSA
    worksheet.mergeCells('B2:F2');
    const titleCell = worksheet.getCell('B2');
    titleCell.value = 'GRUPO ERSA - REPORTE DE FLOTA Y MANTENIMIENTO';
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFC91A25' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 30;

    // Fila 4: Cabecera con fondo Rojo ERSA (#C91A25) y texto blanco como en la foto
    const headerRow = worksheet.getRow(4);
    headerRow.values = ['', 'Interno', 'Marca', 'Último Cambio', 'Kilometraje (Km)', 'Mecánico(s)'];
    headerRow.height = 26;

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC91A25' }
    };

    const headerFont = {
      name: 'Calibri',
      size: 12,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };

    const borderStyle = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };

    ['B4', 'C4', 'D4', 'E4', 'F4'].forEach(colRef => {
      const cell = worksheet.getCell(colRef);
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF990000' } },
        bottom: { style: 'medium', color: { argb: 'FF990000' } }
      };
    });

    // Anchos de columnas
    worksheet.getColumn('A').width = 4;
    worksheet.getColumn('B').width = 16;
    worksheet.getColumn('C').width = 22;
    worksheet.getColumn('D').width = 20;
    worksheet.getColumn('E').width = 22;
    worksheet.getColumn('F').width = 28;

    // Filas de Datos
    let rowIndex = 5;
    registros.forEach(row => {
      const dataRow = worksheet.getRow(rowIndex);
      const kmFormatted = row.kilometraje > 0 ? Number(row.kilometraje).toLocaleString('es-AR') + ' Km' : '-';

      dataRow.values = [
        '',
        row.numero_interno,
        row.marca,
        row.fecha_cambio,
        kmFormatted,
        row.mecanicos
      ];

      ['B', 'C', 'D', 'E', 'F'].forEach(colLetter => {
        const cell = worksheet.getCell(`${colLetter}${rowIndex}`);
        cell.font = { name: 'Calibri', size: 11 };
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', horizontal: (colLetter === 'C' || colLetter === 'F') ? 'left' : 'center' };
      });

      // Poner en negrita la columna B (Interno)
      worksheet.getCell(`B${rowIndex}`).font = { name: 'Calibri', size: 11, bold: true };
      dataRow.height = 22;
      rowIndex++;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_Flota_ERSA_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Error al generar Excel con ExcelJS:', err);
    return res.status(500).json({ success: false, error: 'Error del servidor al exportar el archivo Excel.' });
  }
}

module.exports = {
  exportExcel
};
