-- Base de datos para Sistema de Mantenimiento de Flota - ERSA Group
CREATE DATABASE IF NOT EXISTS `ersa_mantenimiento` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ersa_mantenimiento`;

-- Tabla de Internos (Unidades de la Flota) con columna 'marca'
CREATE TABLE IF NOT EXISTS `internos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero_interno` VARCHAR(20) NOT NULL UNIQUE,
  `marca` VARCHAR(50) NOT NULL DEFAULT 'Volkswagen',
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- En caso de que la tabla ya existiera, agregar la columna 'marca' si falta
ALTER TABLE `internos` ADD COLUMN IF NOT EXISTS `marca` VARCHAR(50) NOT NULL DEFAULT 'Volkswagen' AFTER `numero_interno`;

-- Tabla de Historial de Cambios de Aceite
CREATE TABLE IF NOT EXISTS `historial_cambios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `interno_id` INT NOT NULL,
  `fecha_cambio` DATE NOT NULL,
  `kilometraje` INT NOT NULL,
  `mecanicos` VARCHAR(255) NOT NULL,
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`interno_id`) REFERENCES `internos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserción de lista inicial de Internos de ERSA Group (55 unidades) con marca Volkswagen por defecto
INSERT IGNORE INTO `internos` (`numero_interno`, `marca`) VALUES
('3624', 'Volkswagen'), ('3625', 'Volkswagen'), ('3626', 'Volkswagen'), ('3627', 'Volkswagen'), ('3629', 'Volkswagen'),
('3631', 'Volkswagen'), ('3634', 'Volkswagen'), ('3648', 'Volkswagen'), ('3649', 'Volkswagen'), ('3650', 'Volkswagen'),
('3655', 'Volkswagen'), ('3658', 'Volkswagen'), ('3683', 'Volkswagen'), ('3684', 'Volkswagen'), ('3687', 'Volkswagen'),
('3690', 'Volkswagen'), ('3694', 'Volkswagen'), ('3705', 'Volkswagen'), ('3730', 'Volkswagen'), ('3736', 'Volkswagen'),
('3742', 'Volkswagen'), ('3752', 'Volkswagen'), ('3757', 'Volkswagen'), ('3760', 'Volkswagen'), ('3761', 'Volkswagen'),
('3768', 'Volkswagen'), ('3769', 'Volkswagen'), ('3772', 'Volkswagen'), ('3778', 'Volkswagen'), ('3781', 'Volkswagen'),
('3784', 'Volkswagen'), ('3791', 'Volkswagen'), ('3881', 'Volkswagen'), ('3882', 'Volkswagen'), ('3883', 'Volkswagen'),
('3888', 'Volkswagen'), ('3889', 'Volkswagen'), ('3890', 'Volkswagen'), ('3891', 'Volkswagen'), ('4002', 'Volkswagen'),
('4008', 'Volkswagen'), ('4009', 'Volkswagen'), ('4010', 'Volkswagen'), ('4012', 'Volkswagen'), ('4014', 'Volkswagen'),
('4021', 'Volkswagen'), ('4022', 'Volkswagen'), ('4023', 'Volkswagen'), ('4024', 'Volkswagen'), ('4025', 'Volkswagen'),
('4026', 'Volkswagen'), ('4031', 'Volkswagen'), ('4038', 'Volkswagen'), ('4147', 'Volkswagen'), ('4149', 'Volkswagen');

-- Cargar datos iniciales de prueba de cambios de aceite
INSERT INTO `historial_cambios` (`interno_id`, `fecha_cambio`, `kilometraje`, `mecanicos`) VALUES
((SELECT id FROM internos WHERE numero_interno = '3624' LIMIT 1), '2026-05-10', 450200, 'Carlos Gómez'),
((SELECT id FROM internos WHERE numero_interno = '3625' LIMIT 1), '2026-04-15', 510450, 'Roberto Martínez, Juan Pérez'),
((SELECT id FROM internos WHERE numero_interno = '3629' LIMIT 1), '2026-06-01', 380120, 'Luis Fernández'),
((SELECT id FROM internos WHERE numero_interno = '3760' LIMIT 1), '2026-03-20', 620000, 'Carlos Gómez'),
((SELECT id FROM internos WHERE numero_interno = '4025' LIMIT 1), '2026-07-12', 290500, 'Esteban Quito, Juan Pérez'),
((SELECT id FROM internos WHERE numero_interno = '4038' LIMIT 1), '2026-07-28', 195000, 'Roberto Martínez');
