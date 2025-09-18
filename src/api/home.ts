// @ts-nocheck
import request from '@/api/request'

export function getUserInfo() {
  return request({
    url: '/home/userInfo',
    method: 'get',
  })
}
