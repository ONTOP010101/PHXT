import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{"username":"","name":"","role":"","permissions":{}}'),
    token: localStorage.getItem('token') || '',
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
  }),
  actions: {
    async login(credentials) {
      try {
        const res = await loginApi(credentials)
        this.token = res.data.token
        this.userInfo = res.data.user
        this.isLoggedIn = true
        localStorage.setItem('token', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        localStorage.setItem('isLoggedIn', 'true')
      } catch (error) {
        console.error('登录失败', error)
        throw error
      }
    },
    logout() {
      this.token = ''
      this.userInfo = { username: '', name: '', role: '' }
      this.isLoggedIn = false
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('isLoggedIn')
    }
  }
})