import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import File from '../../db/images.js'

const router = express.Router()

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 保留原始文件名，使用 Buffer.from 正确处理中文
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, originalName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 单文件100MB
    files: 500, // 最多500个文件
  },
})

// 单文件上传接口
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' })
    }
    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')

    // 手动生成序列号
    const lastFile = await File.findOne().sort({ serialNumber: -1 })
    const serialNumber = lastFile ? lastFile.serialNumber + 1 : 1

    // 保存文件信息到数据库
    const fileDoc = new File({
      serialNumber: serialNumber,
      fileName: fileName,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    })
    await fileDoc.save()

    res.json({
      success: true,
      message: '文件上传成功',
      file: {
        serialNumber: fileDoc.serialNumber,
        name: fileName,
        size: req.file.size,
        path: req.file.path,
        uploadTime: fileDoc.uploadTime,
      },
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    res.status(500).json({ success: false, message: '文件上传失败' })
  }
})

// 批量文件上传接口
router.post('/upload-batch', upload.array('files', 500), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: '没有上传文件' })
    }

    // 获取当前最大序列号
    const lastFile = await File.findOne().sort({ serialNumber: -1 })
    let currentSerial = lastFile ? lastFile.serialNumber : 0

    // 批量保存到数据库
    const filePromises = req.files.map(async (file) => {
      currentSerial += 1
      const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8')
      const fileDoc = new File({
        serialNumber: currentSerial,
        fileName: fileName,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
      })
      await fileDoc.save()
      return {
        serialNumber: fileDoc.serialNumber,
        name: fileName,
        size: file.size,
        path: file.path,
        uploadTime: fileDoc.uploadTime,
      }
    })

    const files = await Promise.all(filePromises)

    res.json({
      success: true,
      message: `成功上传 ${files.length} 个文件`,
      files,
    })
  } catch (error) {
    console.error('批量上传失败:', error)
    res.status(500).json({ success: false, message: '批量上传失败' })
  }
})

// 获取文件列表接口（支持分页）
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const skip = (page - 1) * pageSize

    const total = await File.countDocuments()
    const files = await File.find()
      .sort({ uploadTime: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('serialNumber fileName fileSize filePath uploadTime mimeType')

    res.json({
      success: true,
      data: {
        files: files.map((file) => ({
          serialNumber: file.serialNumber,
          name: file.fileName,
          size: file.fileSize,
          path: file.filePath,
          uploadTime: file.uploadTime,
          mimeType: file.mimeType,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    res.status(500).json({ success: false, message: '获取文件列表失败' })
  }
})

// 文件下载接口（支持通过序列号或文件名下载）
router.get('/download/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier
    let fileDoc

    // 判断是序列号还是文件名
    if (/^\d+$/.test(identifier)) {
      fileDoc = await File.findOne({ serialNumber: parseInt(identifier) })
    } else {
      fileDoc = await File.findOne({ fileName: identifier })
    }

    if (!fileDoc) {
      return res.status(404).json({ success: false, message: '文件不存在' })
    }

    if (!fs.existsSync(fileDoc.filePath)) {
      return res.status(404).json({ success: false, message: '文件已被删除' })
    }

    res.download(fileDoc.filePath, fileDoc.fileName, (err) => {
      if (err) {
        console.error('文件下载失败:', err)
        res.status(500).json({ success: false, message: '文件下载失败' })
      }
    })
  } catch (error) {
    console.error('文件下载失败:', error)
    res.status(500).json({ success: false, message: '文件下载失败' })
  }
})

// 删除文件接口（同时删除数据库记录和物理文件）
router.delete('/delete/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier
    let fileDoc

    // 判断是序列号还是文件名
    if (/^\d+$/.test(identifier)) {
      fileDoc = await File.findOne({ serialNumber: parseInt(identifier) })
    } else {
      fileDoc = await File.findOne({ fileName: identifier })
    }

    if (!fileDoc) {
      return res.status(404).json({ success: false, message: '文件不存在' })
    }

    // 删除物理文件
    if (fs.existsSync(fileDoc.filePath)) {
      fs.unlinkSync(fileDoc.filePath)
    }

    // 删除数据库记录
    await File.deleteOne({ _id: fileDoc._id })

    res.json({ success: true, message: '文件删除成功' })
  } catch (error) {
    console.error('文件删除失败:', error)
    res.status(500).json({ success: false, message: '文件删除失败' })
  }
})

export default router
