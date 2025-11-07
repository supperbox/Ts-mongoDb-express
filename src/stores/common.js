// stores/counter.js
import { defineStore } from 'pinia'

export const useCommonStore = defineStore('common', {
  state: () => {
    return {
      showErr: false,
      errMsg: '',
      errCode: null,
    }
  },
  actions: {
    setError(show, msg, code = null) {
      this.showErr = show
      this.errMsg = msg
      this.errCode = code
    },
  },
})
