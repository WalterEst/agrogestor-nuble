import express from 'express'
import cors from 'cors'
import { body, validationResult } from 'express-validator'
import mysql from 'mysql2/promise'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// Pool MySQL local
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'marketplace_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4_unicode_ci'
})

const formatUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  apellido: user.apellido,
  email: user.email,
  estado_registro: user.estado_registro,
  rol_id: user.rol_id
})

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT id, nombre, apellido, email, passwrd, estado_registro, rol_id
     FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  )
  return rows[0] || null
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
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

      await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [user.id])

      return res.json({
        message: 'Inicio de sesión exitoso',
        usuario: formatUser(user),
        origen: 'database'
      })
    } catch (error) {
      console.error('Error en login:', error)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
)

app.listen(PORT, () => {
  console.log(`API de MarkeVUE escuchando en http://localhost:${PORT}`)
})
