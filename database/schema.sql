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
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS totp_habilitado BOOLEAN DEFAULT FALSE;
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

-- Usuario admin por defecto (password: EcoAdmin#2026!)
-- Hash generado con werkzeug.security.generate_password_hash (compatible con check_password_hash del backend)
INSERT INTO usuarios (nombre, correo, password, rol)
VALUES (
    'Administrador',
    'admin@ecomapa.com',
    'scrypt:32768:8:1$OANrnUF4N3TaZOzr$2a48c804d1fb6147f2c776acf9066dafe0a2b0b4e4b7d1925adb6fcf12d45098ba67ddbf58a31c8367e0dc45199f2dd48db8ec829e59f8e02347fdb533e2216a',
    'admin'
) ON CONFLICT (correo) DO NOTHING;


-- =====================================================================
-- SEGURIDAD A NIVEL DE FILA (Row-Level Security) — punto 4 y 3 de la lista
-- Supabase expone por defecto las tablas del esquema "public" mediante una API REST
-- pública (protegida solo por la "anon key", que es pública). Con RLS activado y SIN
-- políticas, esa API queda sin acceso a ninguna fila. EcoMapaGo no la usa: el frontend
-- habla únicamente con nuestro backend Flask, que se conecta con el rol "postgres"
-- (ese rol ignora RLS), así que la aplicación sigue funcionando igual.
-- =====================================================================
ALTER TABLE usuarios                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_recicladoras      ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE canjes                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados               ENABLE ROW LEVEL SECURITY;
ALTER TABLE restablecimientos_password ENABLE ROW LEVEL SECURITY;

-- Defensa en profundidad: además, se quitan los permisos de los roles públicos de la API
-- de Supabase (solo si existen; así este script también corre en un PostgreSQL normal).
DO $$
DECLARE rol text;
BEGIN
  FOREACH rol IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = rol) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM %I', rol);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', rol);
    END IF;
  END LOOP;
END $$;

