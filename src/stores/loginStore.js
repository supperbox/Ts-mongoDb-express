// stores/counter.js
import { defineStore } from 'pinia'
import { login, register } from '@/api/loginApi.js'

export const useLoginStore = defineStore('login', {
  state: () => {
    return {
      token: null,
      username: '',
      password: '',
    }
  },
  actions: {
    // 获取所有的用户信息
    async login(data) {
      console.log('loginStore login 接收到的数据:', data)
      const res = await login({
        account: data.account,
        password: data.password,
      })

      this.token = res.token
      console.log('登录成功返回数据:', res)
    },
    // 获取所有的用户信息
    async register(data) {
      const res = await register({
        account: data.account,
        password: data.password,
      })
    },

    // 添加登出功能
    logout() {
      this.token = null
      console.log('用户已登出')
    },
  },
})
