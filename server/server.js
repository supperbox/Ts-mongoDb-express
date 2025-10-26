import model from './models/User.js'
import express from 'express'

const app = express()
const port = 3001

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/home/userInfo/getAllUserInfo', async (req, res) => {
  let data = await model.find()
  console.log('查询所有数据:', data)
  res.send(data)
})

app.post('/home/userInfo/new', async (req, res) => {
  let { name, age, interests } = req.body
  console.log('数据主体:', req.body)
  let newUser = model.create({ name, age, interests })
  // newUser.save()
  res.json({ message: '创建新用户', user: newUser })
})

app.listen(port, () => {
  console.log('Server running at http://localhost:3001')
})
