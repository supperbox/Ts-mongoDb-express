// stores/counter.js
import { defineStore } from 'pinia'
import { getUserInfo, createNewUser } from '@/api/home.js'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => {
    return {
      allUserInfo: [],
    }
  },
  actions: {
    // 获取所有的用户信息
    async getAllUserInfo() {
      const res = await getUserInfo()
      this.allUserInfo = res.data || []
      console.log('Fetched all user info:', this.allUserInfo)
    },
  },
})
