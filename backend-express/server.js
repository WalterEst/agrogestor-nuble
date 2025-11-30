// Carga módulos necesarios
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { body, validationResult } from 'express-validator'
import mysql from 'mysql2/promise'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Carga variables de entorno
dotenv.config()

// Crea la app Express
const app = express()
const PORT = process.env.PORT || 3000

// Activa CORS y JSON
app.use(cors())
app.use(express.json())


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar carpeta pública para que el navegador vea las fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marketplace_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4_unicode_ci'
}

// Datos mock para modo sin base de datos (solo pruebas)
const mockUsers = [
  {
    id: 1,
    nombre: 'Admin',
    apellido: 'Principal',
    email: 'admin@marketvue.cl',
    passwrd: 'Admin123',
    estado_registro: 'aprobado',
    rol_id: 1
  }
]

const mockPublicaciones = [
  {
    id: 101,
    titulo: 'Kit de riego por goteo',
    descripcion: 'Incluye 20 metros de manguera y temporizador digital.',
    precio: 59990,
    moneda: 'CLP',
    categoria: 'Hogar y Cocina',
    autor: 'Admin Principal',
    fecha: '2024-11-18',
    estado_publicacion: 'publicada',
    portada: null
  },
  {
    id: 102,
    titulo: 'Silla gamer ergonomic PRO',
    descripcion: 'Respaldo de malla, apoyabrazos 3D y base metálica reforzada.',
    precio: 149990,
    moneda: 'CLP',
    categoria: 'Gaming',
    autor: 'Admin Principal',
    fecha: '2024-11-17',
    estado_publicacion: 'publicada',
    portada: null
  }
]

const dataSource = {
  mode: process.env.USE_INMEMORY_AUTH === 'true' ? 'mock' : 'database',
  pool: null
}

const ROLE_IDS = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  USER: 3
}

const roleCapabilities = {
  [ROLE_IDS.SUPER_ADMIN]: [
    'Acceso total al panel administrativo',
    'Aprobar o rechazar usuarios y publicaciones',
    'Modificar roles y permisos de otros administradores',
    'Revisar historial de acciones administrativas'
  ],
  [ROLE_IDS.ADMIN]: [
    'Acceso administrativo sin edición de datos de usuarios',
    'Aprobar o rechazar usuarios registrados',
    'Revisar y aprobar publicaciones pendientes',
    'Consultar historial de acciones administrativas'
  ],
  default: ['Navegar y publicar productos propios']
}

const allowedRoles = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.USER]

const normalizeRoleName = (roleId, fallbackName = '') => {
  switch (Number(roleId)) {
    case ROLE_IDS.SUPER_ADMIN:
      return 'super administrador'
    case ROLE_IDS.ADMIN:
      return 'administrador'
    case ROLE_IDS.USER:
      return 'usuario'
    default:
      return fallbackName
  }
}

const getActorRoleId = (req) => {
  const rawRole =
    req.headers['x-role-id'] ||
    req.headers['x-user-role'] ||
    req.headers['x-admin-role'] ||
    req.headers['x-actor-role']

  const roleId = Number(rawRole)

  return Number.isInteger(roleId) && allowedRoles.includes(roleId) ? roleId : null
}


const buildUpdateQuery = (fields = {}) => {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined)

  if (!entries.length) return null

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ')
  const values = entries.map(([, value]) => value)

  return { setClause, values }
}

// Formatea un usuario para la respuesta
const formatUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  apellido: user.apellido,
  email: user.email,
  estado_registro: user.estado_registro,
  rol_id: user.rol_id
})

// Formatea una fila de publicación para la respuesta
const formatPublicationRow = (row) => ({
  id: row.id,
  titulo: row.titulo,
  name: row.titulo, 
  descripcion: row.descripcion,
  precio: row.precio,
  price: row.precio, 
  moneda: row.moneda,
  categoria: row.categoria,
  autor: row.autor,
  fecha: row.fecha,
  status: row.estado_publicacion === 'publicada' ? 'approved' : 'pending',
  estado_publicacion: row.estado_publicacion,
  portada: row.portada,
  

  stock: row.stock || 0 
});


// Inicia la conexión al pool MySQL
const bootstrapPool = async () => {
  if (dataSource.mode === 'mock') return

  try {
    // Prueba la conexión a MySQL
    dataSource.pool = mysql.createPool(dbConfig)
    await dataSource.pool.query('SELECT 1')
    console.log('Conexión a MySQL establecida correctamente')
  } catch (error) {
    // Si falla, pasa a modo mock
    console.warn(
      'No se pudo establecer la conexión a MySQL. Activando modo mock para autenticación.',
      error.message
    )
    dataSource.mode = 'mock'
    dataSource.pool = null
  }
}

// Busca un usuario por email en BD o mock
const findUserByEmail = async (email) => {
  if (dataSource.mode === 'mock') {
    const user = mockUsers.find((item) => item.email === email)
    return user || null
  }

  // Consulta a MySQL
  const [rows] = await dataSource.pool.query(
    `SELECT id, nombre, apellido, email, passwrd, estado_registro, rol_id
     FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  )
  return rows[0] || null
}

app.get('/api/health', async (_req, res) => {
  if (dataSource.mode === 'mock') {
    return res.json({ status: 'ok', mode: 'mock' })
  }

  try {
    // Revisa conexión a MySQL
    await dataSource.pool.query('SELECT 1')
    return res.json({ status: 'ok', mode: 'database' })
  } catch (error) {
    console.error('Error en healthcheck de base de datos:', error.message)
    return res.status(500).json({ status: 'error', message: 'Error en base de datos' })
  }
})

app.get('/api/publicaciones', async (_req, res) => {
  if (dataSource.mode === 'mock') {
    return res.json({ publicaciones: mockPublicaciones })
  }

  try {
    const [rows] = await dataSource.pool.query(
      `SELECT p.id,
              p.titulo,
              p.descripcion,
              p.precio,
              p.moneda,
              COALESCE(c.nombre, 'Sin categoría') AS categoria,
              TRIM(CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, ''))) AS autor,
              DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha,
              p.estado_publicacion,
              (
                SELECT img.ruta_imagen
                  FROM publicaciones_imagenes img
                 WHERE img.publicacion_id = p.id
              ORDER BY img.es_portada DESC, img.orden ASC, img.id ASC
                 LIMIT 1
              ) AS portada
         FROM publicaciones p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.visible = 1 AND p.estado_publicacion = 'publicada'
     ORDER BY p.creado_en DESC
        LIMIT 50`
    )

    const publicaciones = rows.map(formatPublicationRow)
    return res.json({ publicaciones })
  } catch (error) {
    console.error('Error obteniendo publicaciones:', error.message)
    return res.status(500).json({ message: 'No se pudieron cargar las publicaciones' })
  }
})

// Endpoint para obtener detalle de una publicación específica con datos del vendedor
app.get('/api/publicaciones/:id', async (req, res) => {
  const { id } = req.params

  if (dataSource.mode === 'mock') {
    const producto = mockPublicaciones.find(p => p.id == id)
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    return res.json({
      publicacion: {
        ...producto,
        vendedor: {
          nombre: mockUsers[0].nombre,
          apellido: mockUsers[0].apellido,
          email: mockUsers[0].email,
          estado_registro: mockUsers[0].estado_registro
        }
      }
    })
  }

  try {
    // Primera consulta estricta: publicado y visible
    const [rows] = await dataSource.pool.query(
      `SELECT p.id,
              p.titulo,
              p.descripcion,
              p.precio,
              p.moneda,
              COALESCE(c.nombre, 'Sin categoría') AS categoria,
              TRIM(CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, ''))) AS autor,
              DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha,
              p.estado_publicacion,
              (
                SELECT img.ruta_imagen
                FROM publicaciones_imagenes img
                WHERE img.publicacion_id = p.id
                ORDER BY img.es_portada DESC, img.orden ASC, img.id ASC
                LIMIT 1
              ) AS portada
         FROM publicaciones p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ? AND p.visible = 1 AND p.estado_publicacion = 'publicada'
        LIMIT 1`,
      [id]
    )

    if (rows.length > 0) {
      const row = rows[0]
      const publicacion = {
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        precio: row.precio,
        moneda: row.moneda,
        categoria: row.categoria,
        autor: row.autor,
        fecha: row.fecha,
        estado_publicacion: row.estado_publicacion,
        portada: row.portada,
        vendedor: null
      }

      // Intentamos cargar datos del vendedor si existen
      try {
        const [urows] = await dataSource.pool.query(
          `SELECT id, nombre, apellido, email, estado_registro FROM usuarios WHERE id = (
             SELECT usuario_id FROM publicaciones WHERE id = ? LIMIT 1
           ) LIMIT 1`,
          [id]
        )
        if (urows.length) {
          publicacion.vendedor = {
            id: urows[0].id,
            nombre: urows[0].nombre,
            apellido: urows[0].apellido,
            email: urows[0].email,
            estado_registro: urows[0].estado_registro
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar info completa del vendedor:', e.message)
      }

      return res.json({ publicacion })
    }

    // Segunda consulta relajada: sin filtros de visible/estado
    console.warn(`Producto ${id} no encontrado con filtros estrictos. Intentando consulta relajada...`)
    const [rowsRelaxed] = await dataSource.pool.query(
      `SELECT p.id,
              p.titulo,
              p.descripcion,
              p.precio,
              p.moneda,
              COALESCE(c.nombre, 'Sin categoría') AS categoria,
              TRIM(CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, ''))) AS autor,
              DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha,
              p.estado_publicacion,
              (
                SELECT img.ruta_imagen
                FROM publicaciones_imagenes img
                WHERE img.publicacion_id = p.id
                ORDER BY img.es_portada DESC, img.orden ASC, img.id ASC
                LIMIT 1
              ) AS portada,
              u.id AS vendedor_id,
              u.nombre AS vendedor_nombre,
              u.apellido AS vendedor_apellido,
              u.email AS vendedor_email,
              u.estado_registro AS vendedor_estado
         FROM publicaciones p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
        LIMIT 1`,
      [id]
    )

    if (rowsRelaxed.length > 0) {
      const row = rowsRelaxed[0]
      const publicacion = {
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        precio: row.precio,
        moneda: row.moneda,
        categoria: row.categoria,
        autor: row.autor,
        fecha: row.fecha,
        estado_publicacion: row.estado_publicacion,
        portada: row.portada,
        vendedor: {
          id: row.vendedor_id,
          nombre: row.vendedor_nombre,
          apellido: row.vendedor_apellido,
          email: row.vendedor_email,
          estado_registro: row.vendedor_estado
        }
      }

      return res.json({ publicacion, advertencia: 'encontrado_no_publicado' })
    }

    // Fallback a mock data si no existe en BD
    const producto = mockPublicaciones.find(p => p.id == id)
    if (producto) {
      return res.json({
        publicacion: {
          ...producto,
          vendedor: {
            nombre: mockUsers[0].nombre,
            apellido: mockUsers[0].apellido,
            email: mockUsers[0].email,
            estado_registro: mockUsers[0].estado_registro
          }
        }
      })
    }

    return res.status(404).json({ message: 'Producto no encontrado' })
  } catch (error) {
    console.error('Error obteniendo detalle de publicación:', error.message)
    return res.status(500).json({ message: 'Error al cargar los detalles del producto' })
  }
})

app.post(
  '/api/auth/login',
  [
    // Validaciones básicas
    body('email').isEmail(),
    body('passwrd').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() })
    }

    const { email, passwrd } = req.body

    try {
      // Busca usuario
      const user = await findUserByEmail(email)

      // Valida credenciales
      if (!user || user.passwrd !== passwrd) {
        return res.status(401).json({ message: 'Credenciales incorrectas' })
      }

      // Marca inicio de sesión en BD
      if (dataSource.mode === 'database') {
        await dataSource.pool.query(
          'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
          [user.id]
        )
      }

      return res.json({
        message: 'Inicio de sesión exitoso',
        usuario: formatUser(user),
        origen: dataSource.mode
      })
    } catch (error) {
      console.error('Error en login:', error)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
)

// Endpoint del dashboard admin
app.get('/api/admin/dashboard', async (_req, res) => {
  if (dataSource.mode === 'mock') {
    // Devuelve datos simples en modo mock
    return res.json({
      usuarios: mockUsers.map((user) => ({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        estado: user.estado_registro,
        rol: 'superusuario',
        rol_id: user.rol_id,
        ultimo_login: null
      })),
      solicitudes: [],
      publicaciones: []
    })
  }

  try {
    // Obtiene usuarios reales
    const [usuarios] = await dataSource.pool.query(
      `SELECT u.id,
              u.nombre,
              u.apellido,
              u.email,
              u.estado_registro AS estado,
              u.rol_id,
              COALESCE(r.nombre, '') AS rol,
              DATE_FORMAT(u.ultimo_login, '%Y-%m-%d %H:%i:%s') AS ultimo_login
         FROM usuarios u
    LEFT JOIN roles r ON u.rol_id = r.id
     ORDER BY u.id`
    )

    // Obtiene publicaciones pendientes
    const [solicitudes] = await dataSource.pool.query(
      `SELECT p.id,
              p.titulo,
              COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Sin autor') AS autor,
              COALESCE(c.nombre, 'Sin categoría') AS categoria,
              p.estado_publicacion,
              DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha
         FROM publicaciones p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.estado_publicacion = 'pendiente_revision'
     ORDER BY p.creado_en DESC
        LIMIT 50`
    )

    // Obtiene publicaciones totales
    const [publicaciones] = await dataSource.pool.query(
      `SELECT p.id,
              p.titulo,
              COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Sin autor') AS autor,
              DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha,
              p.estado_publicacion AS visibilidad
         FROM publicaciones p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
     ORDER BY p.creado_en DESC
        LIMIT 100`
    )

    return res.json({ usuarios, solicitudes, publicaciones })
  } catch (error) {
    console.error('Error obteniendo datos de dashboard:', error.message)
  return res.status(500).json({ message: 'Error al cargar datos del panel' })
  }
})

// Actualiza el estado de una publicación desde el panel admin
app.patch(
  '/api/admin/publicaciones/:id/estado',
  [body('estado_publicacion').isIn(['publicada', 'pendiente_revision', 'rechazada', 'oculta'])],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Estado inválido', errors: errors.array() })
    }

    const { id } = req.params
    const { estado_publicacion } = req.body

    if (dataSource.mode === 'mock') {
      const index = mockPublicaciones.findIndex((pub) => String(pub.id) === String(id))

      if (index === -1) {
        return res.status(404).json({ message: 'Publicación no encontrada' })
      }

      mockPublicaciones[index].estado_publicacion = estado_publicacion

      return res.json({
        message: 'Estado de publicación actualizado (mock)',
        publicacion: mockPublicaciones[index]
      })
    }

    try {
      const [result] = await dataSource.pool.query(
        `UPDATE publicaciones
            SET estado_publicacion = ?, actualizado_en = NOW()
          WHERE id = ?
          LIMIT 1`,
        [estado_publicacion, id]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Publicación no encontrada' })
      }

      const [rows] = await dataSource.pool.query(
        `SELECT p.id,
                p.titulo,
                p.descripcion,
                p.precio,
                p.moneda,
                COALESCE(c.nombre, 'Sin categoría') AS categoria,
                TRIM(CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, ''))) AS autor,
                DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha,
                p.estado_publicacion,
                p.visible
           FROM publicaciones p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
          WHERE p.id = ?
          LIMIT 1`,
        [id]
      )

      const publicacion = rows.length ? formatPublicationRow(rows[0]) : { id: Number(id), estado_publicacion }

      return res.json({ message: 'Estado de publicación actualizado', publicacion })
    } catch (error) {
      console.error('Error actualizando estado de publicación:', error.message)
      return res.status(500).json({ message: 'No fue posible actualizar la publicación' })
    }
  }
)

app.get('/api/admin/usuarios/:id', async (req, res) => {
  const { id } = req.params

  if (dataSource.mode === 'mock') {
    const usuario = mockUsers.find((user) => user.id === Number(id))

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const publicacionesUsuario = mockPublicaciones.filter((item) => item.autor === usuario.nombre)

    return res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        estado_registro: usuario.estado_registro,
        rol_id: usuario.rol_id,
        rol: 'superusuario',
        ultimo_login: null,
        creado_en: null,
        actualizado_en: null
      },
      permisos: roleCapabilities[usuario.rol_id] || roleCapabilities.default,
      publicaciones: publicacionesUsuario,
      resumenPublicaciones: {
        total: publicacionesUsuario.length,
        publicadas: publicacionesUsuario.length,
        pendientes: 0,
        rechazadas: 0
      },
      rolesDisponibles: [
        { id: ROLE_IDS.SUPER_ADMIN, nombre: normalizeRoleName(ROLE_IDS.SUPER_ADMIN) },
        { id: ROLE_IDS.ADMIN, nombre: normalizeRoleName(ROLE_IDS.ADMIN) },
        { id: ROLE_IDS.USER, nombre: normalizeRoleName(ROLE_IDS.USER) }
      ]
    })
  }

  try {
    const [usuarios] = await dataSource.pool.query(
      `SELECT u.id,
              u.nombre,
              u.apellido,
              u.email,
              u.estado_registro,
              u.rol_id,
              COALESCE(r.nombre, '') AS rol,
              DATE_FORMAT(u.ultimo_login, '%Y-%m-%d %H:%i:%s') AS ultimo_login,
              DATE_FORMAT(u.creado_en, '%Y-%m-%d %H:%i:%s') AS creado_en,
              DATE_FORMAT(u.actualizado_en, '%Y-%m-%d %H:%i:%s') AS actualizado_en
         FROM usuarios u
    LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.id = ?
        LIMIT 1`,
      [id]
    )

    if (!usuarios.length) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const usuario = usuarios[0]

    const [publicaciones] = await dataSource.pool.query(
      `SELECT p.id,
              p.titulo,
              p.estado_publicacion,
              DATE_FORMAT(p.creado_en, '%Y-%m-%d') AS fecha,
              p.visible
         FROM publicaciones p
        WHERE p.usuario_id = ?
     ORDER BY p.creado_en DESC
        LIMIT 100`,
      [id]
    )

    const resumenPublicaciones = publicaciones.reduce(
      (acc, pub) => {
        acc.total += 1
        if (pub.estado_publicacion === 'publicada') acc.publicadas += 1
        if (pub.estado_publicacion === 'pendiente_revision') acc.pendientes += 1
        if (pub.estado_publicacion === 'rechazada') acc.rechazadas += 1
        return acc
      },
      { total: 0, publicadas: 0, pendientes: 0, rechazadas: 0 }
    )

    const [rolesDisponibles] = await dataSource.pool.query(
      'SELECT id, nombre FROM roles WHERE id IN (?, ?, ?) ORDER BY id',
      [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.USER]
    )

    const normalizedRoles = rolesDisponibles.map((rol) => ({
      id: rol.id,
      nombre: normalizeRoleName(rol.id, rol.nombre)
    }))


    return res.json({
      usuario,
      permisos: roleCapabilities[usuario.rol_id] || roleCapabilities.default,
      publicaciones,
      resumenPublicaciones,
      rolesDisponibles: normalizedRoles
    })
  } catch (error) {
    console.error('Error obteniendo detalle de usuario:', error.message)
    return res.status(500).json({ message: 'No fue posible cargar el usuario' })
  }
})

// Endpoint para editar usuarios
app.put(
  '/api/admin/usuarios/:id',
  [
    // Validaciones simples
    body('nombre').optional().isLength({ min: 2 }),
    body('apellido').optional().isLength({ min: 2 }),
    body('email').optional().isEmail(),
    body('estado_registro').optional().isIn(['pendiente', 'aprobado', 'rechazado', 'bloqueado']),
    body('rol_id').optional().isInt({ min: 1 })
  ],
  async (req, res) => {
    if (dataSource.mode === 'mock') {
      return res.status(503).json({ message: 'Edición no disponible en modo mock' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() })
    }

    const { id } = req.params
    const { nombre, apellido, email, estado_registro, rol_id } = req.body

    const actorRoleId = getActorRoleId(req)

    if (!actorRoleId) {
      return res.status(403).json({ message: 'Debes indicar tu rol para modificar usuarios' })
    }

    if (![ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN].includes(actorRoleId)) {
      return res.status(403).json({ message: 'No tienes permisos para modificar usuarios' })
    }

    const adminIntentoEdicion =
      actorRoleId === ROLE_IDS.ADMIN &&
      [nombre, apellido, email, rol_id].some((campo) => campo !== undefined)

    if (adminIntentoEdicion) {
      return res
        .status(403)
        .json({ message: 'Solo el super administrador puede editar datos o roles de usuarios' })
    }

    const update = buildUpdateQuery({
      nombre: actorRoleId === ROLE_IDS.SUPER_ADMIN ? nombre : undefined,
      apellido: actorRoleId === ROLE_IDS.SUPER_ADMIN ? apellido : undefined,
      email: actorRoleId === ROLE_IDS.SUPER_ADMIN ? email : undefined,
      estado_registro,
      rol_id: actorRoleId === ROLE_IDS.SUPER_ADMIN ? rol_id : undefined
    })

    if (!update) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' })
    }

    try {
      // Ejecuta actualización
      const [result] = await dataSource.pool.query(
        `UPDATE usuarios
            SET ${update.setClause}, actualizado_en = NOW()
          WHERE id = ?
          LIMIT 1`,
        [...update.values, id]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      // Devuelve usuario actualizado
      const [rows] = await dataSource.pool.query(
        `SELECT u.id,
                u.nombre,
                u.apellido,
                u.email,
                u.estado_registro AS estado,
                u.rol_id,
                COALESCE(r.nombre, '') AS rol,
                DATE_FORMAT(u.ultimo_login, '%Y-%m-%d %H:%i:%s') AS ultimo_login
           FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
          WHERE u.id = ?
          LIMIT 1`,
        [id]
      )

      return res.json({
        message: 'Usuario actualizado',
        usuario: rows[0],
        permisos: roleCapabilities[rows[0].rol_id] || roleCapabilities.default
      })
    } catch (error) {
      console.error('Error actualizando usuario:', error.message)
      return res.status(500).json({ message: 'No fue posible actualizar el usuario' })
    }
  }
)

// Endpoint para eliminar usuarios y sus publicaciones (solo super admin)
app.delete('/api/admin/usuarios/:id', async (req, res) => {
  const { id } = req.params
  const actorRoleId = getActorRoleId(req)

  if (actorRoleId !== ROLE_IDS.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Solo el super administrador puede eliminar usuarios' })
  }

  if (dataSource.mode === 'mock') {
    const index = mockUsers.findIndex((user) => String(user.id) === String(id))

    if (index === -1) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const usuario = mockUsers[index]
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim()

    mockUsers.splice(index, 1)

    let publicacionesEliminadas = 0
    for (let i = mockPublicaciones.length - 1; i >= 0; i -= 1) {
      const pub = mockPublicaciones[i]
      if (pub.usuario_id === usuario.id || pub.autor === nombreCompleto || pub.autor === usuario.nombre) {
        mockPublicaciones.splice(i, 1)
        publicacionesEliminadas += 1
      }
    }

    return res.json({
      message: 'Usuario y publicaciones eliminados (mock)',
      usuarioId: usuario.id,
      publicacionesEliminadas
    })
  }

  let connection

  try {
    connection = await dataSource.pool.getConnection()
    await connection.beginTransaction()

    const [publicaciones] = await connection.query(
      'DELETE FROM publicaciones WHERE usuario_id = ?',
      [id]
    )

    const [result] = await connection.query('DELETE FROM usuarios WHERE id = ? LIMIT 1', [id])

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    await connection.commit()

    return res.json({
      message: 'Usuario y sus publicaciones eliminados correctamente',
      usuarioId: Number(id),
      publicacionesEliminadas: publicaciones.affectedRows
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error('Error eliminando usuario:', error.message)
    return res.status(500).json({ message: 'No fue posible eliminar el usuario' })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// Endpoint para registrar nuevos usuarios
app.post(
  '/api/auth/register',
  [
    // Validaciones básicas
    body('nombre').isLength({ min: 2 }),
    body('apellido').isLength({ min: 2 }),
    body('email').isEmail(),
    body('passwrd').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() })
    }

    const { nombre, apellido, email, passwrd } = req.body

    try {
      // Verifica si el email ya existe
      const existing = await findUserByEmail(email)
      if (existing) {
        return res.status(409).json({ message: 'El email ya está registrado' })
      }

      // Modo mock (sin base de datos)
      if (dataSource.mode === 'mock') {
        const nextId = mockUsers.reduce((max, u) => Math.max(max, u.id), 0) + 1
        const newUser = {
          id: nextId,
          nombre,
          apellido,
          email,
          passwrd,
          estado_registro: 'pendiente',
          rol_id: 3
        }

        mockUsers.push(newUser)

        return res.status(201).json({
          message: 'Registro creado (mock)',
          usuario: formatUser(newUser),
          origen: 'mock'
        })
      }

      // Inserta usuario en la base de datos
      const [result] = await dataSource.pool.query(
        `INSERT INTO usuarios (nombre, apellido, email, passwrd, estado_registro, rol_id, creado_en)
           VALUES (?, ?, ?, ?, 'pendiente', ?, NOW())`,
        [nombre, apellido, email, passwrd, 3]
      )

      const insertedId = result.insertId

      const [rows] = await dataSource.pool.query(
        `SELECT id, nombre, apellido, email, estado_registro, rol_id
           FROM usuarios WHERE id = ? LIMIT 1`,
        [insertedId]
      )

      return res.status(201).json({
        message: 'Usuario creado',
        usuario: formatUser(rows[0]),
        origen: 'database'
      })
    } catch (error) {
      console.error('Error en register:', error)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
)

// 1. GET: Mis Publicaciones 
app.get('/api/publisher/products', async (req, res) => {
    const currentUserId = 1; 
    
    if (dataSource.mode === 'mock') {
        return res.json(mockPublicaciones.map(formatPublicationRow));
    }

    try {

        const [rows] = await dataSource.pool.query(
            `SELECT 
                p.id, 
                p.titulo, 
                p.descripcion, 
                p.precio, 
                p.estado_publicacion, 
                p.stock,  
                (SELECT ruta_imagen FROM publicaciones_imagenes WHERE publicacion_id = p.id ORDER BY es_portada DESC LIMIT 1) as portada
             FROM publicaciones p 
             WHERE usuario_id = ? 
             ORDER BY p.creado_en DESC`, 
            [currentUserId]
        );
        return res.json(rows.map(formatPublicationRow));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error cargando mis productos' });
    }
});

// 2. GET: Detalle de mi producto 
app.get('/api/publisher/products/:id', async (req, res) => {
    const { id } = req.params;
    
    // Si estamos en modo Mock
    if (dataSource.mode === 'mock') {
        const prod = mockPublicaciones.find(p => p.id == id);
        return prod ? res.json(formatPublicationRow(prod)) : res.status(404).json({message: 'No encontrado'});
    }
    
    // Lógica DB Real
    try {
        const [rows] = await dataSource.pool.query(
            `SELECT 
                p.id, 
                p.titulo, 
                p.descripcion, 
                p.precio, 
                p.moneda, 
                p.estado_publicacion, 
                p.stock,  
                p.creado_en as fecha,
                (SELECT ruta_imagen FROM publicaciones_imagenes WHERE publicacion_id = p.id ORDER BY es_portada DESC LIMIT 1) as portada
             FROM publicaciones p 
             WHERE p.id = ?`, 
            [id]
        );

        if(rows.length > 0) {
            
            return res.json(formatPublicationRow(rows[0]));
        }
        
        return res.status(404).json({message: 'Producto no encontrado'});
    } catch (e) {
        console.error("ERROR EN DETALLE:", e.message); 
        return res.status(500).json({message: 'Error servidor al cargar detalle'});
    }
});

// 3. POST: Crear Producto
app.post('/api/publisher/products', upload.single('portada'), async (req, res) => {
    
  
    console.log("-----------------------------------------");
    console.log("INTENTO DE CREAR PRODUCTO");
    console.log("Body (Texto):", req.body);
    console.log("File (Imagen):", req.file);
    console.log("-----------------------------------------");

    const { name, price, stock, description } = req.body;
    const file = req.file;
    const portadaUrl = file ? `http://localhost:${PORT}/uploads/${file.filename}` : null;

    // Validación Backend
    if (!name || !price) {
        console.log("ERROR: Nombre o precio faltantes");
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

try {
        const [result] = await dataSource.pool.query(
            `INSERT INTO publicaciones 
            (titulo, precio, stock, descripcion, usuario_id, estado_publicacion, visible, creado_en)
            VALUES (?, ?, ?, ?, ?, 'pendiente_revision', 1, NOW())`, 
            [name, price, stock, description, 1]
        );
        
        const newProductId = result.insertId;

        if (portadaUrl) {
            await dataSource.pool.query(
                `INSERT INTO publicaciones_imagenes (publicacion_id, ruta_imagen, es_portada, orden)
                 VALUES (?, ?, 1, 1)`,
                [newProductId, portadaUrl]
            );
        }

        return res.status(201).json({ message: 'Creado', id: newProductId });

    } catch (error) {
        console.error("ERROR SQL DETALLADO:", error); 
        return res.status(500).json({ message: 'Error en base de datos', error: error.message });
    }
});

// 4. PUT: Editar
app.put('/api/publisher/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (dataSource.mode === 'mock') {
      
       return res.json({ message: 'Editado (Mock)' });
    }
    
    try {
        await dataSource.pool.query(
            'UPDATE publicaciones SET titulo=?, precio=?, descripcion=? WHERE id=?',
            [name, price, description, id]
        );
        return res.json({ message: 'Actualizado correctamente' });
    } catch (e) {
        return res.status(500).json({ message: 'Error al actualizar' });
    }
});

// 5. DELETE: Eliminar
app.delete('/api/publisher/products/:id', async (req, res) => {
    const { id } = req.params;
    if (dataSource.mode === 'mock') {
        mockPublicaciones = mockPublicaciones.filter(p => p.id != id);
        return res.json({ message: 'Eliminado (Mock)' });
    }
    try {
        await dataSource.pool.query('DELETE FROM publicaciones WHERE id = ?', [id]);
        return res.json({ message: 'Producto eliminado de BD' });
    } catch (error) {
        return res.status(500).json({ message: 'Error eliminando' });
    }
});


// 6. GET: Obtener mi perfil
app.get('/api/publisher/profile', async (req, res) => {

    const userId = req.query.userId || 1;

    console.log(`Buscando perfil en BD para ID: ${userId}`);

    if (dataSource.mode === 'mock') {
        return res.json(mockUsers[0]);
    }

    try {
        const [rows] = await dataSource.pool.query(
            `SELECT id, nombre, apellido, email, estado_registro 
             FROM usuarios 
             WHERE id = ?`, 
            [userId]
        );

        if (rows.length > 0) {
            console.log("Usuario encontrado:", rows[0].nombre);
            return res.json(rows[0]);
        }

        console.warn("Usuario no encontrado en la tabla 'usuarios'");
        return res.status(404).json({ message: 'Usuario no encontrado en BD' });

    } catch (e) { 
        console.error("ERROR CRÍTICO EN PERFIL:", e); 
        return res.status(500).json({message: 'Error al leer perfil en base de datos'}); 
    }
});

// 7. PUT: Actualizar perfil
app.put('/api/publisher/profile', async (req, res) => {
    
    const userId = req.query.userId || 1;
    const { nombre, apellido, email, password, currentPassword } = req.body;

    if (dataSource.mode === 'mock') {
     
        return res.json({ message: 'Perfil actualizado (Mock)' });
    }

    try {
        
        let query = 'UPDATE usuarios SET nombre=?, apellido=?, email=?';
        let params = [nombre, apellido, email];

    
        if (password && password.length > 0) {
            query += ', passwrd=?'; 
            params.push(password);
        }

        query += ' WHERE id=?';
        params.push(currentUserId);

        await dataSource.pool.query(query, params);

        return res.json({ message: 'Perfil actualizado correctamente' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar perfil' });
    }
});


// RUTAS DE SOPORTE Y REPORTES
let mockReportes = [
    { id: 1, asunto: 'Problema con subida de imágenes', mensaje: 'No me deja subir fotos PNG', estado: 'resuelto', fecha: '2024-11-20', respuesta: 'Actualiza tu navegador.' },
    { id: 2, asunto: 'Denuncia de usuario', mensaje: 'El usuario X vende productos falsos', estado: 'pendiente', fecha: '2024-11-28', respuesta: null }
];

// 8. GET: Mis Reportes/Tickets
app.get('/api/publisher/reports', async (req, res) => {
    const userId = 1; // Hardcodeado
    if (dataSource.mode === 'mock') return res.json(mockReportes);

    try {
        const [rows] = await dataSource.pool.query(
            `SELECT id, asunto, mensaje, estado, respuesta, DATE_FORMAT(creado_en, '%Y-%m-%d') as fecha 
             FROM soporte_tickets WHERE usuario_id = ? ORDER BY creado_en DESC`, 
            [userId]
        );
        return res.json(rows);
    } catch (e) {
        return res.json(mockReportes); 
    }
});

// 9. POST: Crear Nuevo Reporte/Contacto
app.post('/api/publisher/contact', async (req, res) => {
    const { asunto, mensaje } = req.body;
    
    if (dataSource.mode === 'mock') {
        const nuevo = { id: Date.now(), asunto, mensaje, estado: 'pendiente', fecha: new Date().toISOString().split('T')[0], respuesta: null };
        mockReportes.unshift(nuevo);
        return res.status(201).json({ message: 'Mensaje enviado' });
    }

    try {
        await dataSource.pool.query(
            `INSERT INTO soporte_tickets (usuario_id, asunto, mensaje, estado, creado_en) VALUES (?, ?, ?, 'pendiente', NOW())`,
            [1, asunto, mensaje]
        );
        return res.status(201).json({ message: 'Mensaje enviado correctamente' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al enviar mensaje' });
    }
});

// Inicializa el pool y levanta la API
bootstrapPool().finally(() => {
  app.listen(PORT, () => {
    console.log(`API de MarkeVUE escuchando en http://localhost:${PORT}`)
  })
})
