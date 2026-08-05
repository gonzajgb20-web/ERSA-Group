<?php
/**
 * Configuración de la base de datos MySQL / MariaDB mediante PDO
 * ERSA Group - Sistema de Mantenimiento de Flota
 */

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: 'ersa_mantenimiento');
define('DB_PORT', getenv('DB_PORT') ?: '3306');

function getDBConnection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Si la base de datos aún no se ha creado o falla la conexión
            http_response_code(500);
            die(json_encode([
                'success' => false,
                'error' => 'Error de conexión a la base de datos: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE));
        }
    }
    return $pdo;
}
