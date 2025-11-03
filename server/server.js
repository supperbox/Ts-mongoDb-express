import model from '../db/User.js'
import express from 'express'
import userRoute from './expressRoutes/user.js'

const app = express()
const port = 3001

app.use(express.json())

app.use('/home', userRoute)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('Server running at http://localhost:3001')
})
