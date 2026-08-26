CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario',
    puntos INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    localidad VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    puntos_otorgados BOOLEAN DEFAULT FALSE,
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Si la base ya existía antes de esta actualización, estas líneas agregan las columnas nuevas sin perder datos:
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS puntos_otorgados BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS restablecimientos_password (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expira_en TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    puntos_al_emitir INTEGER NOT NULL,
    nivel VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS empresas_recicladoras (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo_material VARCHAR(50) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    localidad VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    correo_contacto VARCHAR(150),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beneficios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas_recicladoras(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    costo_puntos INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canjes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    beneficio_id INTEGER REFERENCES beneficios(id) ON DELETE CASCADE,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    puntos_utilizados INTEGER NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Si la tabla ya existía con VARCHAR(500), esto la amplía para soportar imágenes en base64
ALTER TABLE noticias ALTER COLUMN imagen TYPE TEXT;
ALTER TABLE empresas_recicladoras ADD COLUMN IF NOT EXISTS logo TEXT;

-- Usuario admin por defecto (password: Admin123)
-- Hash generado con werkzeug.security.generate_password_hash (compatible con check_password_hash del backend)
INSERT INTO usuarios (nombre, correo, password, rol)
VALUES (
    'Administrador',
    'admin@ecomapa.com',
    'scrypt:32768:8:1$QxsvEsPNip4qRfk2$6d7594146f470bce70cd470ba1dd2515224f331f2c89f998fb970142dffa52d0142742ec233cdd29cf47dd6c029febd9205f5f8ff1ea6cd09dff0be2665fc570',
    'admin'
) ON CONFLICT (correo) DO NOTHING;
