import request from './request'

const imagesApi = {
  /**
   * 单文件上传
   * @param {File} file - 要上传的文件对象
   * @param {Function} [onUploadProgress] - 上传进度回调函数
   * @returns {Promise} - 返回上传结果的 Promise
   */
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

  /**
   * 批量文件上传
   * @param {File[]} files - 要上传的文件数组
   * @param {Function} [onUploadProgress] - 上传进度回调函数
   * @returns {Promise} - 返回上传结果的 Promise
   */
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

  /**
   * 获取文件列表
   * @param {Object} [params={}] - 查询参数（分页参数等）
   * @param {number} [params.page] - 当前页码
   * @param {number} [params.pageSize] - 每页显示的文件数量
   * @returns {Promise} - 返回文件列表的 Promise
   */
  getFileList(params = {}) {
    return request({
      url: '/file/list',
      method: 'get',
      params,
    })
  },

  /**
   * 获取文件下载链接
   * @param {string|number} identifier - 文件的标识符（序列号或文件名）
   * @returns {string} - 返回文件下载的 URL
   */
  getDownloadUrl(identifier) {
    return `/file/download/${encodeURIComponent(identifier)}`
  },

  /**
   * 删除文件
   * @param {string|number} identifier - 文件的标识符（序列号或文件名）
   * @returns {Promise} - 返回删除结果的 Promise
   */
  deleteImageFile(identifier) {
    return request({
      url: `/file/delete/${encodeURIComponent(identifier)}`,
      method: 'delete',
    })
  },
}

export default imagesApi
