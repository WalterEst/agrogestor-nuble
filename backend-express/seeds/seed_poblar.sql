INSERT INTO Users (id, name, email, password, role, status, age, address, rut, phone)
SELECT
  UUID(),
  'Super Admin',
  'admin@marketvue.local',
  'admin123',
  'SUPERADMIN',
  'APPROVED',
  38,
  'Municipalidad de MarketVue',
  '11.111.111-1',
  '+56 9 5555 0000'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'admin@marketvue.local');

INSERT INTO Users (id, name, email, password, role, status, age, address, rut, phone)
SELECT
  UUID(),
  'María Campos',
  'productor1@marketvue.local',
  'cultivo2024',
  'USER',
  'APPROVED',
  45,
  'Parcela Los Olivos, Curicó',
  '12.345.678-5',
  '+56 9 4444 1111'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'productor1@marketvue.local');

INSERT INTO Users (id, name, email, password, role, status, age, address, rut, phone)
SELECT
  UUID(),
  'Pedro Riego',
  'productor2@marketvue.local',
  'riego2024',
  'USER',
  'APPROVED',
  41,
  'Sector San Patricio, Talca',
  '14.789.123-3',
  '+56 9 4333 2222'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'productor2@marketvue.local');

INSERT INTO Users (id, name, email, password, role, status, age, address, rut, phone)
SELECT
  UUID(),
  'Laura Mercado',
  'comprador1@marketvue.local',
  'comprador2024',
  'USER',
  'APPROVED',
  36,
  'Barrio Comercial Centro, Curicó',
  '16.987.654-8',
  '+56 9 4222 3333'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'comprador1@marketvue.local');

INSERT INTO Users (id, name, email, password, role, status, age, address, rut, phone)
SELECT
  UUID(),
  'José Ramírez',
  'comprador2@marketvue.local',
  'campo2024',
  'USER',
  'APPROVED',
  50,
  'Cooperativa AgroSur, Linares',
  '17.654.321-6',
  '+56 9 4111 4444'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'comprador2@marketvue.local');

INSERT INTO Users (id, name, email, password, role, status, age, address, rut, phone)
SELECT
  UUID(),
  'Sandra Postulante',
  'pendiente1@marketvue.local',
  'postulante2024',
  'USER',
  'PENDING',
  32,
  'Villa AgroParque, Molina',
  '18.222.333-7',
  '+56 9 4666 5555'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'pendiente1@marketvue.local');

INSERT INTO Posts (id, userId, title, description, price, imageUrl, isActive)
SELECT
  UUID(),
  u.id,
  'Trigo premium 2024',
  'Grano seleccionado de la última temporada con certificación libre de pesticidas.',
  125000,
  NULL,
  1
FROM Users u
WHERE u.email = 'productor1@marketvue.local'
  AND NOT EXISTS (
    SELECT 1 FROM Posts p WHERE p.title = 'Trigo premium 2024' AND p.userId = u.id
  );

INSERT INTO Posts (id, userId, title, description, price, imageUrl, isActive)
SELECT
  UUID(),
  u.id,
  'Maíz orgánico en choclo',
  'Mazorca fresca lista para consumo, ideal para ferias y distribución local.',
  98000,
  NULL,
  1
FROM Users u
WHERE u.email = 'productor1@marketvue.local'
  AND NOT EXISTS (
    SELECT 1 FROM Posts p WHERE p.title = 'Maíz orgánico en choclo' AND p.userId = u.id
  );

INSERT INTO Posts (id, userId, title, description, price, imageUrl, isActive)
SELECT
  UUID(),
  u.id,
  'Servicio de riego tecnificado',
  'Asesoría y arriendo de sistemas de riego por goteo para predios medianos.',
  210000,
  NULL,
  1
FROM Users u
WHERE u.email = 'productor2@marketvue.local'
  AND NOT EXISTS (
    SELECT 1 FROM Posts p WHERE p.title = 'Servicio de riego tecnificado' AND p.userId = u.id
  );

INSERT INTO Reviews (id, postId, userId, rating, comment)
SELECT
  UUID(),
  p.id,
  buyer.id,
  5,
  'Excelente calidad y rápida coordinación de entrega. Recomendado para panaderías.'
FROM Users buyer
JOIN Posts p ON p.title = 'Trigo premium 2024'
JOIN Users seller ON seller.id = p.userId AND seller.email = 'productor1@marketvue.local'
WHERE buyer.email = 'comprador1@marketvue.local'
  AND NOT EXISTS (
    SELECT 1 FROM Reviews r WHERE r.postId = p.id AND r.userId = buyer.id
  )
LIMIT 1;

INSERT INTO Reviews (id, postId, userId, rating, comment)
SELECT
  UUID(),
  p.id,
  buyer.id,
  4,
  'Buen sabor y tamaño homogéneo. Podría mejorar el embalaje para transporte largo.'
FROM Users buyer
JOIN Posts p ON p.title = 'Maíz orgánico en choclo'
JOIN Users seller ON seller.id = p.userId AND seller.email = 'productor1@marketvue.local'
WHERE buyer.email = 'comprador1@marketvue.local'
  AND NOT EXISTS (
    SELECT 1 FROM Reviews r WHERE r.postId = p.id AND r.userId = buyer.id
  )
LIMIT 1;

INSERT INTO Reviews (id, postId, userId, rating, comment)
SELECT
  UUID(),
  p.id,
  buyer.id,
  5,
  'El equipo llegó puntual y dejaron funcionando el sistema en menos de un día.'
FROM Users buyer
JOIN Posts p ON p.title = 'Servicio de riego tecnificado'
JOIN Users seller ON seller.id = p.userId AND seller.email = 'productor2@marketvue.local'
WHERE buyer.email = 'comprador2@marketvue.local'
  AND NOT EXISTS (
    SELECT 1 FROM Reviews r WHERE r.postId = p.id AND r.userId = buyer.id
  )
LIMIT 1;
