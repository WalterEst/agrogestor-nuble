CREATE DATABASE IF NOT EXISTS marketplace_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE marketplace_db;

CREATE TABLE roles (
    id              TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO roles (nombre) VALUES ('superusuario'), ('administrador'), ('usuario');

CREATE TABLE usuarios (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    apellido          VARCHAR(100),
    email             VARCHAR(150) NOT NULL UNIQUE,
    passwrd          VARCHAR(255) NOT NULL,
    rol_id            TINYINT UNSIGNED NOT NULL DEFAULT 3,
    estado_registro   ENUM('pendiente','aprobado','rechazado','bloqueado') NOT NULL DEFAULT 'pendiente',
    aprobado_por      INT UNSIGNED,
    aprobado_en       DATETIME,
    ultimo_login      DATETIME,
    creado_en         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON UPDATE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_usuarios_estado ON usuarios (estado_registro);
CREATE INDEX idx_usuarios_rol ON usuarios (rol_id);

CREATE TABLE categorias (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    descripcion     TEXT,
    activo          TINYINT(1) NOT NULL DEFAULT 1,
    creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE publicaciones (
    id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id           INT UNSIGNED NOT NULL,
    categoria_id         INT UNSIGNED,
    titulo               VARCHAR(150) NOT NULL,
    descripcion          TEXT NOT NULL,
    precio               DECIMAL(10,2) NOT NULL,
    moneda               CHAR(3) NOT NULL DEFAULT 'CLP',
    estado_publicacion   ENUM('borrador','pendiente_revision','publicada','rechazada','archivada') NOT NULL DEFAULT 'borrador',
    aprobada_por         INT UNSIGNED,
    aprobada_en          DATETIME,
    visible              TINYINT(1) NOT NULL DEFAULT 1,
    creado_en            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_publicaciones_usuario ON publicaciones (usuario_id, estado_publicacion);
CREATE INDEX idx_publicaciones_categoria ON publicaciones (categoria_id);
CREATE INDEX idx_publicaciones_estado ON publicaciones (estado_publicacion);

CREATE TABLE publicaciones_imagenes (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    publicacion_id  INT UNSIGNED NOT NULL,
    ruta_imagen     VARCHAR(255) NOT NULL,
    es_portada      TINYINT(1) NOT NULL DEFAULT 0,
    orden           INT UNSIGNED NOT NULL DEFAULT 1,
    creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_pubimg_pub ON publicaciones_imagenes (publicacion_id, orden);

CREATE TABLE admin_acciones (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id       INT UNSIGNED NOT NULL,
    tipo_accion    ENUM('aprobar_usuario','rechazar_usuario','editar_usuario','aprobar_publicacion','rechazar_publicacion','editar_publicacion') NOT NULL,
    objetivo_tipo  ENUM('usuario','publicacion') NOT NULL,
    objetivo_id    INT UNSIGNED NOT NULL,
    detalle        TEXT,
    creado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_admin_acciones_obj ON admin_acciones (objetivo_tipo, objetivo_id);
