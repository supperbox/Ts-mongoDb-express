import express from 'express'
import loginModel from '../../db/loginDB.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  let { account, password } = req.body
  console.log('注册数据主体:', req.body)

  let foundUser = await loginModel.findOne({ account, password })
  if (foundUser) {
    res.status(401).json({ message: '该账号已经存在' })
  } else {
    let newLogin = loginModel.create({ account, password })
    res.json({ message: '创建新用户', user: newLogin })
  }
})

router.post('/login', async (req, res) => {
  let { account, password } = req.body
  console.log('登录数据主体:', req.body)
  let findAcc = await loginModel.findOne({ account })
  if (!findAcc) {
    res.status(401).json({ message: '该账号不存在' })
    return
  }
  let foundUser = await loginModel.findOne({ account, password })
  if (foundUser) {
    res.json({ message: '登录成功', user: foundUser })
  } else {
    res.status(401).json({ message: '账号或密码错误' })
  }
})

export default router
