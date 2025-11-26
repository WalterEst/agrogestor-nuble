// Carga módulos necesarios
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { body, validationResult } from 'express-validator'
import mysql from 'mysql2/promise'

// Carga variables de entorno
dotenv.config()

// Crea la app Express
const app = express()
const PORT = process.env.PORT || 3000

// Activa CORS y JSON
app.use(cors())
app.use(express.json())

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
  descripcion: row.descripcion,
  precio: row.precio,
  moneda: row.moneda,
  categoria: row.categoria,
  autor: row.autor,
  fecha: row.fecha,
  estado_publicacion: row.estado_publicacion,
  portada: row.portada
})


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

    // Construye query dinámicamente
    const update = buildUpdateQuery({ nombre, apellido, email, estado_registro, rol_id })

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

      return res.json({ message: 'Usuario actualizado', usuario: rows[0] })
    } catch (error) {
      console.error('Error actualizando usuario:', error.message)
      return res.status(500).json({ message: 'No fue posible actualizar el usuario' })
    }
  }
)

// Inicializa el pool y levanta la API
bootstrapPool().finally(() => {
  app.listen(PORT, () => {
    console.log(`API de MarkeVUE escuchando en http://localhost:${PORT}`)
  })
})
