// @ts-nocheck
import request from '@/api/request'

export function getUserInfo() {
  return request({
    url: '/home/userInfo',
    method: 'get',
  })
}

export function createNewUser(data) {
  return request({
    url: '/home/userInfo/new',
    method: 'post',
    data: data,
  })
}
