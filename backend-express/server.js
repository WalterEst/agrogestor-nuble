import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { body, validationResult } from 'express-validator'
import mysql from 'mysql2/promise'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

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

const dataSource = {
  mode: process.env.USE_INMEMORY_AUTH === 'true' ? 'mock' : 'database',
  pool: null
}

const formatUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  apellido: user.apellido,
  email: user.email,
  estado_registro: user.estado_registro,
  rol_id: user.rol_id
})

const bootstrapPool = async () => {
  if (dataSource.mode === 'mock') return

  try {
    dataSource.pool = mysql.createPool(dbConfig)
    await dataSource.pool.query('SELECT 1')
    console.log('Conexión a MySQL establecida correctamente')
  } catch (error) {
    console.warn(
      'No se pudo establecer la conexión a MySQL. Activando modo mock para autenticación.',
      error.message
    )
    dataSource.mode = 'mock'
    dataSource.pool = null
  }
}

const findUserByEmail = async (email) => {
    if (dataSource.mode === 'mock') {
    const user = mockUsers.find((item) => item.email === email)
    return user || null
  }
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
    await dataSource.pool.query('SELECT 1')
    return res.json({ status: 'ok', mode: 'database' })
  } catch (error) {
    console.error('Error en healthcheck de base de datos:', error.message)
    return res.status(500).json({ status: 'error', message: 'Error en base de datos' })
  }
})

app.post(
  '/api/auth/login',
  [body('email').isEmail(), body('passwrd').isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Datos inválidos', errors: errors.array() })
    }

    const { email, passwrd } = req.body

    try {
      const user = await findUserByEmail(email)

      if (!user || user.passwrd !== passwrd) {
        return res.status(401).json({ message: 'Credenciales incorrectas' })
      }

      if (dataSource.mode === 'database') {
        await dataSource.pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [user.id])
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

bootstrapPool().finally(() => {
  app.listen(PORT, () => {
    console.log(`API de MarkeVUE escuchando en http://localhost:${PORT}`)
  })
})
