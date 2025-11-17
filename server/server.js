import model from '../db/User.js'
import express from 'express'
import userRoute from './expressRoutes/user.js'
import loginRoute from './expressRoutes/loginExpress.js'
import fileRoute from './expressRoutes/file.js'

const app = express()
const port = 3001

app.use(express.json())

app.use('/home', userRoute)
app.use('/login', loginRoute)
app.use('/file', fileRoute)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('Server running at http://localhost:3001')
})
