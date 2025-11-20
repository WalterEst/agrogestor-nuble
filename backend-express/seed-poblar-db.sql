INSERT INTO usuarios (nombre, apellido, email, passwrd, rol_id, estado_registro, aprobado_por, aprobado_en, ultimo_login)
VALUES
  ('Walter', 'Vasquez', 'walter@marketplace.cl', 'hashed_superuser_123', 1, 'aprobado', NULL, '2025-11-01 10:00:00', '2025-11-18 09:30:00'),
  ('Carlos', 'Jameux', 'carlos@marketplace.cl', 'hashed_admin_123', 2, 'aprobado', 1, '2025-11-02 11:15:00', '2025-11-18 10:10:00'),
  ('Nain', 'Burgos', 'nain@marketplace.cl', 'hashed_user_abc', 3, 'aprobado', 2, '2025-11-03 12:00:00', '2025-11-18 18:05:00'),
  ('Lucas', 'Concha', 'lucas@marketplace.cl', 'hashed_user_xyz', 3, 'aprobado', 2, '2025-11-04 09:45:00', '2025-11-18 19:20:00');

INSERT INTO categorias (nombre, slug, descripcion, activo)
VALUES
  ('Electrónica', 'electronica', 'Dispositivos electrónicos y accesorios.', 1),
  ('Hogar y Cocina', 'hogar-cocina', 'Artículos para el hogar y cocina.', 1),
  ('Gaming', 'gaming', 'PC gamer, consolas y periféricos.', 1);

INSERT INTO publicaciones
(usuario_id, categoria_id, titulo, descripcion, precio, moneda, estado_publicacion, aprobada_por, aprobada_en, visible)
VALUES
  (3, 1, 'Notebook Lenovo IdeaPad 14"', 'Notebook Lenovo 8GB RAM, 256GB SSD, buen estado.', 299990, 'CLP', 'publicada', 2, '2025-11-10 10:00:00', 1),
  (4, 3, 'Silla gamer ergonomic PRO', 'Silla gamer ergonómica con apoyo lumbar, poco uso.', 149990, 'CLP', 'publicada', 2, '2025-11-10 10:30:00', 1),
  (3, 2, 'Set de ollas acero inoxidable', 'Set de 5 ollas con tapas de vidrio templado.', 69990, 'CLP', 'publicada', 2, '2025-11-11 09:15:00', 1),
  (4, 3, 'Teclado mecánico RGB Redragon', 'Teclado mecánico con switches rojos e iluminación RGB.', 39990, 'CLP', 'pendiente_revision', NULL, NULL, 1),
  (2, 1, 'Monitor Samsung 24" Full HD', 'Monitor Full HD con HDMI y FreeSync.', 109990, 'CLP', 'publicada', 1, '2025-11-12 16:20:00', 1),
  (3, 2, 'Lámparas LED de escritorio', 'Lámparas LED con brazo flexible y control táctil.', 24990, 'CLP', 'borrador', NULL, NULL, 0);

INSERT INTO admin_acciones (admin_id, tipo_accion, objetivo_tipo, objetivo_id, detalle)
VALUES
  (2, 'aprobar_usuario', 'usuario', 3, 'Usuario aprobado tras verificación.'),
  (2, 'aprobar_usuario', 'usuario', 4, 'Usuario aprobado correctamente.'),
  (2, 'aprobar_publicacion', 'publicacion', 1, 'Publicación revisada y aprobada.'),
  (1, 'aprobar_publicacion', 'publicacion', 5, 'Publicación aprobada por buena calidad.');
