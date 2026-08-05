<?php
/**
 * Endpoint AJAX / Fetch para agregar o eliminar internos de la flota (con soporte de marca)
 * ERSA Group
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido. Utilice POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$accion = isset($input['accion']) ? trim($input['accion']) : '';

try {
    $db = getDBConnection();

    if ($accion === 'agregar') {
        $numero_interno = isset($input['numero_interno']) ? trim($input['numero_interno']) : '';
        $marca          = isset($input['marca']) && !empty(trim($input['marca'])) ? trim($input['marca']) : 'Volkswagen';
        
        if (empty($numero_interno)) {
            echo json_encode(['success' => false, 'error' => 'El número de interno es obligatorio.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Verificar si ya existe
        $stmtCheck = $db->prepare("SELECT id FROM internos WHERE numero_interno = ?");
        $stmtCheck->execute([$numero_interno]);
        if ($stmtCheck->fetch()) {
            echo json_encode(['success' => false, 'error' => "El interno N° {$numero_interno} ya existe en el sistema."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmtInsert = $db->prepare("INSERT INTO internos (numero_interno, marca, creado_en) VALUES (?, ?, NOW())");
        $stmtInsert->execute([$numero_interno, $marca]);
        $newId = $db->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => "Interno N° {$numero_interno} ({$marca}) agregado correctamente a la flota.",
            'id' => $newId,
            'numero_interno' => $numero_interno,
            'marca' => $marca
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } elseif ($accion === 'eliminar') {
        $id = isset($input['id']) ? intval($input['id']) : 0;
        
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID de interno inválido.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Obtener número para mensaje informativo
        $stmtCheck = $db->prepare("SELECT numero_interno FROM internos WHERE id = ?");
        $stmtCheck->execute([$id]);
        $interno = $stmtCheck->fetch();

        if (!$interno) {
            echo json_encode(['success' => false, 'error' => 'El interno no existe o ya fue eliminado.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmtDelete = $db->prepare("DELETE FROM internos WHERE id = ?");
        $stmtDelete->execute([$id]);

        echo json_encode([
            'success' => true,
            'message' => "El interno N° {$interno['numero_interno']} fue eliminado del sistema.",
            'id' => $id
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } else {
        echo json_encode(['success' => false, 'error' => 'Acción no reconocida.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
