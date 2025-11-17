import request from './request'

const imagesApi = {
  // 单文件上传
  uploadSingleFile(file, onUploadProgress) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/file/upload',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
  },

  // 批量文件上传
  uploadBatchFiles(files, onUploadProgress) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file) // 确保字段名是 'files'
    })
    return request({
      url: '/file/upload-batch',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
  },

  // 获取文件列表（支持分页参数）
  getFileList(params = {}) {
    return request({
      url: '/file/list',
      method: 'get',
      params,
    })
  },

  // 下载文件（返回文件流或直接 window.open 用此url）
  getDownloadUrl(identifier) {
    return `/file/download/${encodeURIComponent(identifier)}`
  },

  // 删除文件
  deleteImageFile(identifier) {
    return request({
      url: `/file/delete/${encodeURIComponent(identifier)}`,
      method: 'delete',
    })
  },
}

export default imagesApi
