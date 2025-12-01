-- Script de datos de prueba mejorado para MarketVUE
-- Contraseñas legibles y más registros para testing

USE marketplace_db;

-- ===== 1. LIMPIAR DATOS PREVIOS (OPCIONAL - descomentar si necesitas limpiar) =====
-- DELETE FROM publicaciones_imagenes;
-- DELETE FROM publicaciones;
-- DELETE FROM categorias;
-- DELETE FROM usuarios;
-- DELETE FROM roles;

-- ===== 2. INSERTAR ROLES =====
INSERT IGNORE INTO roles (id, nombre) VALUES 
(1, 'superusuario'),
(2, 'administrador'),
(3, 'usuario');

-- ===== 3. INSERTAR USUARIOS DE PRUEBA =====
INSERT IGNORE INTO usuarios (id, nombre, apellido, email, passwrd, rol_id, estado_registro, aprobado_en, creado_en) VALUES
-- Admins
(1, 'Carlos', 'Admin', 'admin@marketvue.cl', 'Admin123', 1, 'aprobado', NOW(), NOW()),
(2, 'Laura', 'Moderadora', 'moderador@marketvue.cl', 'Mod12345', 2, 'aprobado', NOW(), NOW()),

-- Vendedores/Usuarios activos
(3, 'Walter', 'Vasquez', 'walter.vasquez@example.com', 'Password123', 3, 'aprobado', NOW(), NOW()),
(4, 'María', 'González', 'maria.gonzalez@example.com', 'Maria2024', 3, 'aprobado', NOW(), NOW()),
(5, 'Juan', 'Pérez', 'juan.perez@example.com', 'Juan1234', 3, 'aprobado', NOW(), NOW()),
(6, 'Isabel', 'Rodriguez', 'isabel.rodriguez@example.com', 'IsabelPass1', 3, 'aprobado', NOW(), NOW()),
(7, 'Diego', 'Martínez', 'diego.martinez@example.com', 'Diego2024', 3, 'aprobado', NOW(), NOW()),

-- Usuarios en revisión
(8, 'Pedro', 'Flores', 'pedro.flores@example.com', 'Pedro12345', 3, 'pendiente', NULL, NOW()),
(9, 'Sofía', 'Silva', 'sofia.silva@example.com', 'Sophia2024', 3, 'pendiente', NULL, NOW());

-- ===== 4. INSERTAR CATEGORÍAS =====
INSERT IGNORE INTO categorias (nombre, slug, descripcion, activo) VALUES
('Alimentos y Bebidas', 'alimentos', 'Productos alimentarios frescos y procesados', 1),
('Herramientas Agrícolas', 'herramientas', 'Herramientas para cultivo y cosecha', 1),
('Semillas y Plantas', 'semillas', 'Semillas certificadas y plantas vivas', 1),
('Equipos de Riego', 'riego', 'Sistemas y equipos de riego eficiente', 1),
('Fertilizantes y Químicos', 'quimicos', 'Productos para nutrición de plantas', 1),
('Hogar y Cocina', 'hogar', 'Artículos para el hogar', 1),
('Electrónica', 'electronica', 'Artículos electrónicos varios', 1);

-- ===== 5. INSERTAR PUBLICACIONES (PRODUCTOS) =====
INSERT IGNORE INTO publicaciones 
(usuario_id, categoria_id, titulo, descripcion, precio, moneda, estado_publicacion, visible, creado_en) VALUES

-- Usuario 3 (Walter Vasquez)
(3, 1, 'Miel de Ulmo Orgánica', 'Miel cruda 100% natural, cosechada en los bosques nativos de la precordillera. Sin aditivos ni preservantes. Formato de 1kg en envase de vidrio.', 18500, 'CLP', 'publicada', 1, NOW()),
(3, 1, 'Queso Artesanal de Cabra', 'Queso fresco y maduro hecho con leche de cabra de granja orgánica. Presentación de 500g. Ideal para tablas de quesos.', 12000, 'CLP', 'publicada', 1, NOW()),
(3, 5, 'Fertilizante Orgánico Premium', 'Abono 100% orgánico certificado. Mejora la estructura del suelo y retiene humedad. Bolsa de 25kg.', 35000, 'CLP', 'publicada', 1, NOW()),

-- Usuario 4 (María González)
(4, 2, 'Maceta de Cerámica Grande', 'Maceta artesanal de 30cm de diámetro. Acabado natural con drenaje inferior. Perfecta para plantas grandes.', 15990, 'CLP', 'publicada', 1, NOW()),
(4, 3, 'Kit de Semillas Hortalizas', 'Colección de 10 paquetes de semillas certificadas: tomate, lechuga, acelga, zanahoria, cebolla y más. Ideales para huerto.', 8500, 'CLP', 'publicada', 1, NOW()),

-- Usuario 5 (Juan Pérez)
(5, 4, 'Kit de Riego por Goteo Completo', 'Sistema de riego automático: 20 metros de manguera, goteros, válvulas y temporizador digital. Bajo consumo de agua.', 59990, 'CLP', 'publicada', 1, NOW()),
(5, 2, 'Pala Reforzada de Jardinería', 'Pala de acero inoxidable con mango de madera. Resistente y ergonómica. Ideal para excavación y movimiento de tierra.', 24990, 'CLP', 'publicada', 1, NOW()),

-- Usuario 6 (Isabel Rodriguez)
(6, 6, 'Silla Gamer Ergonómica PRO', 'Silla gaming con respaldo de malla, apoyabrazos 3D, altura regulable y base metálica reforzada. Máxima comodidad para largas sesiones.', 149990, 'CLP', 'publicada', 1, NOW()),
(6, 7, 'Monitor 27 pulgadas 144Hz', 'Monitor IPS 27\" full HD con refresh rate 144Hz. Perfecto para gaming y edición de video. Conectividad HDMI y DisplayPort.', 399990, 'CLP', 'publicada', 1, NOW()),

-- Usuario 7 (Diego Martínez)
(7, 1, 'Café Especial Gourmet 500g', 'Café 100% arábica de origen único, tueste medio. Notas de chocolate y frutos secos. Molido al pedido.', 22000, 'CLP', 'publicada', 1, NOW()),
(7, 5, 'Pesticida Natural Ecológico', 'Insecticida orgánico a base de neem. No tóxico para humanos ni mascotas. Efectivo contra plagas comunes.', 16500, 'CLP', 'publicada', 1, NOW()),

-- Usuario 3 (segunda publicación)
(3, 3, 'Plantas Aromáticas Variadas', 'Pack de 6 plantas: albahaca, romero, menta, tomillo, orégano y salvia. Listas para trasplantar. Excelentes para cocina.', 28900, 'CLP', 'publicada', 1, NOW()),

-- Publicaciones pendientes de revisión (usuario 8)
(8, 1, 'Mermelada Casera Artesanal', 'Mermelada hecha en casa con frutas locales frescas. Sin conservantes. Disponible: fresa, frambuesa, cereza.', 9800, 'CLP', 'pendiente_revision', 1, NOW()),

-- Publicaciones rechazadas (usuario 9)
(9, 2, 'Herramienta No Verificada', 'Esta publicación fue rechazada por falta de descripción completa.', 5000, 'CLP', 'rechazada', 1, NOW());

-- ===== 6. RESUMEN Y VERIFICACIÓN =====
SELECT '=== USUARIOS ===' as section;
SELECT id, nombre, apellido, email, estado_registro, rol_id FROM usuarios ORDER BY id;

SELECT '=== CATEGORÍAS ===' as section;
SELECT id, nombre, slug FROM categorias ORDER BY id;

SELECT '=== PUBLICACIONES ===' as section;
SELECT p.id, p.usuario_id, p.titulo, p.precio, c.nombre as categoria, p.estado_publicacion 
FROM publicaciones p
LEFT JOIN categorias c ON p.categoria_id = c.id
ORDER BY p.id;

SELECT CONCAT('Total usuarios: ', COUNT(*)) as estadistica FROM usuarios;
SELECT CONCAT('Total publicaciones: ', COUNT(*)) as estadistica FROM publicaciones;
SELECT CONCAT('Publicaciones activas: ', COUNT(*)) as estadistica FROM publicaciones WHERE visible = 1 AND estado_publicacion = 'publicada';
