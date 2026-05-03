import { defineStore } from 'pinia'
import { getTodayQueueStats, getQueueList, callNextQueue } from '@/api/queue'

export const useQueueStore = defineStore('queue', {
  state: () => ({
    stats: {
      total: 0,
      done: 0,
      waiting: 0
    },
    queueList: [],
    loading: false
  }),
  actions: {
    async fetchStats() {
      try {
        this.loading = true
        const res = await getTodayQueueStats()
        this.stats = res.data
      } catch (error) {
        console.error('获取统计数据失败', error)
      } finally {
        this.loading = false
      }
    },
    async fetchQueueList(params) {
      try {
        this.loading = true
        const res = await getQueueList(params)
        this.queueList = res.data
      } catch (error) {
        console.error('获取排号列表失败', error)
      } finally {
        this.loading = false
      }
    },
    async callNext(queueId) {
      try {
        this.loading = true
        await callNextQueue(queueId)
        // 重新获取数据
        await this.fetchStats()
        await this.fetchQueueList()
      } catch (error) {
        console.error('叫号失败', error)
      } finally {
        this.loading = false
      }
    }
  }
})