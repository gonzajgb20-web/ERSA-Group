-- Script de Migración PostgreSQL / Supabase para ERSA Group
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Usuarios (Mecánicos / Administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) DEFAULT 'mecanico',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Internos (Colectivos)
CREATE TABLE IF NOT EXISTS internos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_interno VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL DEFAULT 'Volkswagen',
    imagen_url TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Historial de Cambios de Aceite
CREATE TABLE IF NOT EXISTS historial_cambios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interno_id UUID NOT NULL REFERENCES internos(id) ON DELETE CASCADE,
    fecha_cambio DATE NOT NULL,
    kilometraje INTEGER NOT NULL,
    mecanicos VARCHAR(255) NOT NULL,
    imagen_comprobante TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usuario Administrador Inicial (Password: admin123)
INSERT INTO usuarios (email, password_hash, nombre, rol)
VALUES ('admin@ersa.com', '$2a$10$wU0Msm6c/iCFAJ61yEaT2.q9R8.k3S90zYjWz9aA9f.bJ3Y0qY.eG', 'Administrador ERSA', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserción de 55 Internos Iniciales
INSERT INTO internos (numero_interno, marca) VALUES
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
('4026', 'Volkswagen'), ('4031', 'Volkswagen'), ('4038', 'Volkswagen'), ('4147', 'Volkswagen'), ('4149', 'Volkswagen')
ON CONFLICT (numero_interno) DO NOTHING;
