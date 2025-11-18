import model from '../db/User.js'
import express from 'express'
import userRoute from './expressRoutes/user.js'
import loginRoute from './expressRoutes/loginExpress.js'
import fileRoute from './expressRoutes/file.js'
import path from 'path'
import { fileURLToPath } from 'url'

// 计算 ES 模块中的 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3001

app.use(express.json())

app.use('/home', userRoute)
app.use('/login', loginRoute)
app.use('/file', fileRoute)

const uploadDir = path.join(__dirname, '../uploads') // 确保路径正确
app.use('/uploads', express.static(uploadDir)) // 将 uploads 文件夹公开为静态资源

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('Server running at http://localhost:3001')
})
