<?php
/**
 * Sección de Gestión de Colectivos (Internos) - ERSA Group
 * Incluye selección e ingreso del campo Marca (Volkswagen, Mercedes-Benz, Scania, etc.)
 */

require_once __DIR__ . '/config/db.php';

try {
    $db = getDBConnection();
    // Obtener la lista completa de internos ordenados numéricamente con su marca
    $stmt = $db->query("SELECT id, numero_interno, COALESCE(marca, 'Volkswagen') AS marca, creado_en FROM internos ORDER BY CAST(numero_interno AS UNSIGNED) ASC, numero_interno ASC");
    $internos = $stmt->fetchAll();
} catch (Exception $e) {
    $errorBD = "Error al consultar la base de datos: " . $e->getMessage();
    $internos = [];
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERSA Group - Gestión de Colectivos</title>
    <!-- Tipografía Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Estilos CSS ERSA -->
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>

    <div class="app-container">
        <!-- Cabecera Principal -->
        <header class="header-navbar">
            <div class="brand-container">
                <div class="brand-logo-ersa">ERSA</div>
                <div class="brand-text-container">
                    <h1 class="brand-title">Gestión de Colectivos</h1>
                    <p class="brand-subtitle">Administración de la Flota e Ingreso de Marcas</p>
                </div>
            </div>

            <div class="nav-actions">
                <a href="index.php" class="btn btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Volver al Inicio
                </a>
            </div>
        </header>

        <!-- Formulario para Agregar Nuevo Colectivo -->
        <div class="config-card">
            <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Agregar Nuevo Colectivo a la Flota
            </h2>

            <form id="formAgregarInterno" style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end;">
                <div style="flex: 1; min-width: 200px;">
                    <label class="label-large" for="nuevo_numero_interno">Número de Interno *</label>
                    <input type="text" id="nuevo_numero_interno" class="input-large" placeholder="Ejemplo: 4250" required autocomplete="off">
                </div>
                
                <div style="flex: 1; min-width: 200px;">
                    <label class="label-large" for="nuevo_marca">Marca del Colectivo *</label>
                    <input type="text" id="nuevo_marca" class="input-large" placeholder="Ejemplo: Volkswagen, Mercedes-Benz..." value="Volkswagen" required autocomplete="off">
                </div>

                <div>
                    <button type="submit" class="btn btn-primary" style="height: 42px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Dar de Alta Colectivo
                    </button>
                </div>
            </form>
        </div>

        <!-- Padrón Completo de Colectivos -->
        <div class="config-card">
            <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Padrón de Colectivos Registrados (Total: <?php echo count($internos); ?>)
            </h2>

            <?php if (!empty($errorBD)): ?>
                <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 1rem; border-radius: 8px; color: #991b1b;">
                    <p><?php echo htmlspecialchars($errorBD); ?></p>
                </div>
            <?php else: ?>
                <div style="overflow-x: auto;">
                    <table class="tabla-internos">
                        <thead>
                            <tr>
                                <th>Número de Interno</th>
                                <th>Marca</th>
                                <th>Fecha de Registro</th>
                                <th style="text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($internos as $row): ?>
                                <tr>
                                    <td>
                                        <strong style="font-size: 1.05rem; color: var(--color-text-primary);">
                                            Interno N° <?php echo htmlspecialchars($row['numero_interno']); ?>
                                        </strong>
                                    </td>
                                    <td>
                                        <span style="font-weight: 600; color: var(--color-text-secondary);">
                                            <?php echo htmlspecialchars($row['marca']); ?>
                                        </span>
                                    </td>
                                    <td style="color: var(--color-text-secondary); font-weight: 500;">
                                        <?php echo date('d/m/Y - H:i', strtotime($row['creado_en'])); ?> hs
                                    </td>
                                    <td style="text-align: right;">
                                        <button class="btn btn-danger-subtle btn-eliminar-interno" 
                                                style="padding: 0.4rem 0.85rem; font-size: 0.825rem;"
                                                data-id="<?php echo $row['id']; ?>" 
                                                data-numero="<?php echo htmlspecialchars($row['numero_interno']); ?>">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Script JavaScript -->
    <script src="assets/js/script.js"></script>
</body>
</html>
