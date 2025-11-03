import express from 'express'
import model from '../../db/User.js'

const router = express.Router()

router.get('/userInfo/getAllUserInfo', async (req, res) => {
  let data = await model.find()
  console.log('查询所有数据:', data)
  res.send(data)
})

router.post('/userInfo/new', async (req, res) => {
  let { name, age, interests } = req.body
  console.log('数据主体:', req.body)
  let newUser = model.create({ name, age, interests })
  // newUser.save()
  res.json({ message: '创建新用户', user: newUser })
})

router.post('/userInfo/edit', async (req, res) => {
  let { id, name, age, interests } = req.body
  console.log('编辑数据主体:', req.body)
  let updatedUser = await model.findOneAndUpdate(
    { id: id },
    { name, age, interests },
    { new: true },
  )
  res.json({ message: '用户信息已更新', user: updatedUser })
})

router.post('/userInfo/delete', async (req, res) => {
  console.log('删除数据主体:', req.body)
  let { id } = req.body
  let deletedUser = await model.deleteOne({
    id: id,
  })
  res.json({ message: '用户已删除', user: deletedUser })
})

export default router
