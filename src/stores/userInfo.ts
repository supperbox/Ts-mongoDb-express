// stores/counter.js
import { defineStore } from 'pinia'
import { getUserInfo, createNewUser, eidtUser, deleteUser } from '@/api/userApi'

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

    async createNewUser(data) {
      const res = await createNewUser(data)
      console.log('Created new user:', res)
      return res
    },

    async updateUser(data, payload) {
      // 调用编辑用户的 API
      const res = await eidtUser({ ...data, ...payload })
      console.log('Edited user:', res)
      return res
    },

    async deleteUser(data) {
      // 调用删除用户的 API
      const res = await deleteUser(data)
      console.log('Deleted user:', res)
      return res
    },
  },
})
