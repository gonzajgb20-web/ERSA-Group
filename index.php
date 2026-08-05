<?php
/**
 * Pantalla Principal (Inicio / Control de Flota) - ERSA Group
 * Incluye visualización de Marca del colectivo e integración con Excel
 */

require_once __DIR__ . '/config/db.php';

try {
    $db = getDBConnection();

    // Consulta SQL para obtener los colectivos con su Marca y su último cambio de aceite
    $sql = "SELECT 
                i.id,
                i.numero_interno,
                COALESCE(i.marca, 'Volkswagen') AS marca,
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
                CAST(i.numero_interno AS UNSIGNED) ASC";

    $stmt = $db->query($sql);
    $internos = $stmt->fetchAll();
    $totalInternos = count($internos);

} catch (Exception $e) {
    $errorBD = "No se pudo conectar a la base de datos: " . $e->getMessage();
    $internos = [];
    $totalInternos = 0;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERSA Group - Control de Mantenimiento de Flota</title>
    <!-- Tipografía Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Estilos CSS -->
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>

    <div class="app-container">
        <!-- Cabecera Principal -->
        <header class="header-navbar">
            <div class="brand-container">
                <div class="brand-logo-ersa">ERSA</div>
                <div class="brand-text-container">
                    <h1 class="brand-title">Control de Flota</h1>
                    <p class="brand-subtitle">Gestión Preventiva de Mantenimiento de Aceite</p>
                </div>
            </div>

            <div class="nav-actions">
                <a href="exportar_excel.php" class="btn btn-dark" title="Descargar planilla Excel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Descargar Planilla Excel
                </a>
                <a href="configuracion.php" class="btn btn-secondary" title="Gestión de Colectivos">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Gestión de Colectivos
                </a>
            </div>
        </header>

        <?php if (!empty($errorBD)): ?>
            <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; color: #991b1b;">
                <h3 style="margin-bottom: 0.5rem; font-size: 1rem; color: #991b1b;">Error de Conexión a la Base de Datos</h3>
                <p><?php echo htmlspecialchars($errorBD); ?></p>
            </div>
        <?php endif; ?>

        <!-- Sección de Búsqueda -->
        <section class="search-section">
            <label class="search-title" for="searchInterno">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Búsqueda rápida por número de colectivo:
            </label>
            <div class="search-box-large">
                <svg class="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" 
                       id="searchInterno" 
                       class="search-input-large" 
                       placeholder="Ingrese el número de interno (ej: 3624, 3760)..." 
                       autocomplete="off">
            </div>

            <div class="stats-bar">
                <span>Prioridad automática: Mostrando primero unidades con mayor antigüedad de servicio.</span>
                <div>
                    Unidades visibles: <span class="stat-pill" id="visibleCount"><?php echo $totalInternos; ?></span> de <?php echo $totalInternos; ?>
                </div>
            </div>
        </section>

        <!-- Grilla de Tarjetas -->
        <main class="internos-grid" id="gridInternos">
            <?php foreach ($internos as $item): ?>
                <?php
                    $id = $item['id'];
                    $numero = htmlspecialchars($item['numero_interno']);
                    $marca = htmlspecialchars($item['marca']);
                    $fecha = $item['ultimo_cambio_fecha'];
                    $km = $item['ultimo_kilometraje'];
                    $mecanicos = htmlspecialchars($item['ultimo_mecanicos'] ?? '');

                    // Evaluación de estado
                    $prioridadClass = 'prioridad-alta';
                    $badgeText = 'Revisión Prioritaria';

                    if ($fecha) {
                        $fechaObj = new DateTime($fecha);
                        $hoyObj = new DateTime();
                        $diasTranscurridos = $hoyObj->diff($fechaObj)->days;

                        if ($diasTranscurridos > 90) {
                            $prioridadClass = 'prioridad-alta';
                            $badgeText = 'Prioridad Alta (' . $diasTranscurridos . ' días)';
                        } elseif ($diasTranscurridos > 45) {
                            $prioridadClass = 'prioridad-media';
                            $badgeText = 'Atención (' . $diasTranscurridos . ' días)';
                        } else {
                            $prioridadClass = 'al-dia';
                            $badgeText = 'Al Día (' . $diasTranscurridos . ' días)';
                        }
                    }
                ?>

                <article class="interno-card <?php echo $prioridadClass; ?>" data-numero="<?php echo $numero; ?>" data-id="<?php echo $id; ?>">
                    <div class="card-header">
                        <div class="interno-number-box">
                            <span class="interno-label">Interno</span>
                            <span class="interno-number">N° <?php echo $numero; ?></span>
                        </div>
                        <span class="badge-estado <?php echo $prioridadClass; ?>">
                            <?php echo $badgeText; ?>
                        </span>
                    </div>

                    <div class="card-body-details">
                        <div class="data-row">
                            <span class="data-label">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                                Marca del Colectivo:
                            </span>
                            <span class="data-value">
                                <?php echo $marca; ?>
                            </span>
                        </div>

                        <div class="data-row">
                            <span class="data-label">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Último Cambio:
                            </span>
                            <span class="data-value <?php echo !$fecha ? 'urgente' : ''; ?>">
                                <?php echo $fecha ? date('d/m/Y', strtotime($fecha)) : 'Sin registro'; ?>
                            </span>
                        </div>

                        <div class="data-row">
                            <span class="data-label">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 12l3-3"/></svg>
                                Kilometraje:
                            </span>
                            <span class="data-value">
                                <?php echo $km ? number_format($km, 0, ',', '.') . ' Km' : '-'; ?>
                            </span>
                        </div>

                        <div class="data-row">
                            <span class="data-label">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                                Mecánico(s):
                            </span>
                            <span class="data-value" style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <?php echo $mecanicos ?: '-'; ?>
                            </span>
                        </div>
                    </div>

                    <div>
                        <button class="btn btn-primary btn-open-modal" 
                                style="width: 100%;"
                                data-id="<?php echo $id; ?>" 
                                data-numero="<?php echo $numero; ?>"
                                data-ultimo-km="<?php echo $km ?: 0; ?>">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Registrar Cambio de Aceite
                        </button>
                    </div>
                </article>
            <?php endforeach; ?>

            <div class="empty-box" id="emptyState" style="display: none;">
                <h3 style="font-size: 1.1rem; color: var(--color-text-primary); margin-bottom: 0.35rem;">Sin resultados</h3>
                <p style="color: var(--color-text-muted);">No existe ninguna unidad registrada con ese número de interno.</p>
            </div>
        </main>
    </div>

    <!-- Modal Formulario de Cambio de Aceite -->
    <div class="modal-overlay" id="modalCambioAceite">
        <div class="modal-card-large">
            <div class="modal-header-subtle">
                <h3 class="modal-title-text">Registrar Cambio de Aceite</h3>
                <button class="btn-cerrar-modal" aria-label="Cerrar ventana">&times;</button>
            </div>
            
            <form id="formCambioAceite">
                <div class="modal-form-body">
                    <input type="hidden" id="modal_interno_id" name="interno_id">

                    <div style="background: var(--color-card-subtle); border: 1px solid var(--color-border); padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.25rem;">
                        <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary);">
                            Unidad seleccionada: Interno N° <span id="modal_display_numero" style="color: var(--color-ersa-red);"></span>
                        </span>
                    </div>

                    <div class="form-group-large">
                        <label class="label-large" for="modal_fecha_cambio">Fecha de mantenimiento *</label>
                        <input type="date" id="modal_fecha_cambio" class="input-large" required>
                    </div>

                    <div class="form-group-large">
                        <label class="label-large" for="modal_kilometraje">Kilometraje al momento del cambio (Km) *</label>
                        <input type="number" id="modal_kilometraje" class="input-large" placeholder="Ejemplo: 450100" min="1" step="1" required>
                        <p class="ayuda-texto">Ingrese el valor exacto del cuentakilómetros del colectivo.</p>
                    </div>

                    <div class="form-group-large">
                        <label class="label-large" for="modal_mecanicos">Mecánico(s) responsable(s) *</label>
                        <input type="text" id="modal_mecanicos" class="input-large" placeholder="Ejemplo: Carlos Gómez, Juan Pérez" required>
                        <p class="ayuda-texto">Ingrese los nombres del personal de taller que realizó el trabajo.</p>
                    </div>
                </div>

                <div class="modal-footer-btns">
                    <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Guardar Registro
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Script JavaScript -->
    <script src="assets/js/script.js"></script>
</body>
</html>
