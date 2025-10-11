import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost:27017/userInfo')

const db = mongoose.connection
db.on('error', () => console.log('MongoDB 连接失败'))
db.on('connected', () => {
  console.log(`Connected to database: ${mongoose.connection.db.databaseName}`)
})
db.once('open', () => {
  console.log('MongoDB 连接成功')
})

export default mongoose
