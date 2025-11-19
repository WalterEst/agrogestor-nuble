USE marketplace_db;

INSERT INTO usuarios (
    nombre,
    apellido,
    email,
    passwrd,
    rol_id,
    estado_registro,
    creado_en
)
SELECT
    'Admin',
    'Principal',
    'admin@marketvue.cl',
    'Admin123',
    (SELECT id FROM roles WHERE nombre = 'administrador' LIMIT 1),
    'aprobado',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'admin@marketvue.cl'
);
