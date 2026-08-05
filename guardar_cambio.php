<?php
/**
 * Endpoint AJAX / Fetch para registrar un nuevo cambio de aceite
 * ERSA Group
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido. Utilice POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtener datos recibidos (JSON o FormData)
$contentType = $_SERVER["CONTENT_TYPE"] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_POST;
}

$interno_id   = isset($input['interno_id']) ? intval($input['interno_id']) : 0;
$fecha_cambio = isset($input['fecha_cambio']) ? trim($input['fecha_cambio']) : '';
$kilometraje  = isset($input['kilometraje']) ? intval($input['kilometraje']) : 0;
$mecanicos    = isset($input['mecanicos']) ? trim($input['mecanicos']) : '';

// Validaciones
if ($interno_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Identificador de interno no válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($fecha_cambio)) {
    echo json_encode(['success' => false, 'error' => 'La fecha del cambio de aceite es obligatoria.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($kilometraje <= 0) {
    echo json_encode(['success' => false, 'error' => 'El kilometraje debe ser un número entero mayor a 0.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($mecanicos)) {
    echo json_encode(['success' => false, 'error' => 'Debe especificar al menos un mecánico responsable.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = getDBConnection();
    
    // Verificar existencia del interno
    $stmtCheck = $db->prepare("SELECT id, numero_interno FROM internos WHERE id = ?");
    $stmtCheck->execute([$interno_id]);
    $interno = $stmtCheck->fetch();
    
    if (!$interno) {
        echo json_encode(['success' => false, 'error' => 'El interno especificado no existe en el sistema.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Insertar registro en historial
    $sql = "INSERT INTO historial_cambios (interno_id, fecha_cambio, kilometraje, mecanicos, creado_en) VALUES (?, ?, ?, ?, NOW())";
    $stmtInsert = $db->prepare($sql);
    $stmtInsert->execute([$interno_id, $fecha_cambio, $kilometraje, $mecanicos]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Cambio de aceite registrado con éxito para el Interno N° ' . $interno['numero_interno'],
        'data' => [
            'interno_id' => $interno_id,
            'numero_interno' => $interno['numero_interno'],
            'fecha_cambio' => $fecha_cambio,
            'kilometraje' => $kilometraje,
            'mecanicos' => $mecanicos
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al guardar el registro: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
