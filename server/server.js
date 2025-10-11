import model from './models/User.js'
import express from 'express'

const app = express()
const port = 3001

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/home/userInfo', async (req, res) => {
  let data = await model.find()
  console.log(data)
  res.json(data)
})

app.listen(port, () => {
  console.log('Server running at http://localhost:3001')
})
