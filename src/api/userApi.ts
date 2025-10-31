// @ts-nocheck
import request from '@/api/request'

export function getUserInfo() {
  return request({
    url: '/home/userInfo/getAllUserInfo',
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

export function eidtUser(data) {
  return request({
    url: '/home/userInfo/edit',
    method: 'post',
    data: data,
  })
}

export function deleteUser(data) {
  return request({
    url: `/home/userInfo/delete`,
    method: 'post',
    data: data,
  })
}
