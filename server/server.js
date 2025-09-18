const express = require('express')
const app = express()
const port = 3001

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/home/userInfo', (req, res) => {
  res.json({
    code: 0,
    data: {
      name: '张三',
      age: 18,
    },
  })
})
