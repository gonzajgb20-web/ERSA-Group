<?php
/**
 * Script de exportación de reporte de mantenimiento a formato Excel (.xls / .xlsx)
 * Diseñado con el formato corporativo ERSA idéntico a la fotografía provista
 * (Encabezado con logo ERSA, cabecera de tabla roja con texto blanco, columnas Interno y Marca)
 */

require_once __DIR__ . '/config/db.php';

try {
    $db = getDBConnection();

    // Consulta para obtener la lista de internos con su marca y su último cambio de aceite
    $sql = "SELECT 
                i.numero_interno,
                COALESCE(i.marca, 'Volkswagen') AS marca,
                COALESCE(h.fecha_cambio, 'Sin Registro') AS fecha_cambio,
                COALESCE(h.kilometraje, '0') AS kilometraje,
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
            ORDER BY CAST(i.numero_interno AS UNSIGNED) ASC";

    $stmt = $db->query($sql);
    $registros = $stmt->fetchAll();

    // Configurar cabeceras HTTP para descarga directa en Microsoft Excel (.xls HTML Spreadsheet)
    $filename = "Reporte_Flota_ERSA_" . date('Y-m-d') . ".xls";
    header('Content-Type: application/vnd.ms-excel; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: max-age=0');
    header('Pragma: public');

?>
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <!--[if gte mso 9]>
    <xml>
     <x:ExcelWorkbook>
      <x:ExcelWorksheets>
       <x:ExcelWorksheet>
        <x:Name>Padrón de Flota ERSA</x:Name>
        <x:WorksheetOptions>
         <x:DisplayGridlines/>
        </x:WorksheetOptions>
       </x:ExcelWorksheet>
      </x:ExcelWorksheets>
     </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        .title-banner { font-size: 16pt; font-weight: bold; color: #C91A25; text-align: center; height: 35px; }
        .logo-text { font-size: 18pt; font-weight: 900; font-style: italic; color: #C91A25; }
        .table-header {
            background-color: #C91A25;
            color: #FFFFFF;
            font-weight: bold;
            font-size: 12pt;
            text-align: center;
            height: 28px;
            border: 1px solid #990000;
        }
        .data-cell {
            font-size: 11pt;
            border: 1px solid #CCCCCC;
            padding: 4px;
            text-align: center;
            mso-number-format:"\@";
        }
        .text-left { text-align: left; }
    </style>
</head>
<body>
    <table>
        <!-- Fila 1 a 3: Encabezado ERSA como en la imagen -->
        <tr>
            <td colspan="5" style="height: 10px;"></td>
        </tr>
        <tr>
            <td colspan="5" class="title-banner">
                <span class="logo-text">GRUPO ERSA</span> &nbsp; - &nbsp; REPORTE DE FLOTA Y MANTENIMIENTO
            </td>
        </tr>
        <tr>
            <td colspan="5" style="height: 10px;"></td>
        </tr>

        <!-- Fila 4: Cabecera con fondo Rojo ERSA y texto Blanco idéntica a la foto -->
        <tr>
            <th class="table-header" style="width: 120px;">Interno</th>
            <th class="table-header" style="width: 180px;">Marca</th>
            <th class="table-header" style="width: 160px;">Último Cambio</th>
            <th class="table-header" style="width: 160px;">Kilometraje (Km)</th>
            <th class="table-header" style="width: 220px;">Mecánico(s)</th>
        </tr>

        <!-- Datos de las Unidades -->
        <?php foreach ($registros as $row): ?>
            <?php
                $fechaFormatted = ($row['fecha_cambio'] !== 'Sin Registro') 
                    ? date('d/m/Y', strtotime($row['fecha_cambio'])) 
                    : 'Sin Registro';

                $kmFormatted = ($row['kilometraje'] !== '0') 
                    ? number_format($row['kilometraje'], 0, ',', '.') . ' Km' 
                    : '-';
            ?>
            <tr>
                <td class="data-cell" style="font-weight: bold;"><?php echo htmlspecialchars($row['numero_interno']); ?></td>
                <td class="data-cell text-left"><?php echo htmlspecialchars($row['marca']); ?></td>
                <td class="data-cell"><?php echo $fechaFormatted; ?></td>
                <td class="data-cell"><?php echo $kmFormatted; ?></td>
                <td class="data-cell text-left"><?php echo htmlspecialchars($row['mecanicos']); ?></td>
            </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>
<?php
    exit;

} catch (Exception $e) {
    http_response_code(500);
    die("Error al generar el reporte: " . $e->getMessage());
}
