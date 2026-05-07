<template>
  <div id="page-system-log" class="slide-in flex flex-col" style="height: calc(100vh - 150px);">
    <div class="flex items-center justify-between mb-6 flex-shrink-0">
      <div>
        <h2 class="text-xl font-bold text-surface-900">系统日志</h2>
        <p class="text-sm text-surface-400 mt-1">查看系统操作记录与审计日志</p>
      </div>
    </div>

    <div class="card p-4 mb-4 flex-shrink-0">
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
        <div style="flex: 1; min-width: 180px;">
          <div style="position: relative;">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" v-model="searchOperator" placeholder="搜索操作人..." style="width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; height: 36px;" />
          </div>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <div style="position: relative;">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" v-model="searchDetail" placeholder="搜索详情信息..." style="width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; height: 36px;" />
          </div>
        </div>
        <div style="display: flex; gap: 4px;">
          <select v-model="filterModule" style="width: 130px; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.75rem; height: 36px;">
            <option value="">全部模块</option>
            <option value="用户管理">用户管理</option>
            <option value="角色管理">角色管理</option>
            <option value="客户资料">客户资料</option>
            <option value="洽谈室管理">洽谈室管理</option>
            <option value="业务管理">业务管理</option>
            <option value="排号系统">排号系统</option>
            <option value="页面管理">页面管理</option>
            <option value="系统登录">系统登录</option>
          </select>
          <input type="date" v-model="filterStartDate" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.75rem; height: 36px;" />
          <input type="date" v-model="filterEndDate" style="padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.75rem; height: 36px;" />
        </div>
        <button class="btn btn-primary" style="height: 36px; padding: 0 1rem;" @click="handleSearch">查询</button>
        <button class="btn btn-outline" style="height: 36px; padding: 0 1rem;" @click="resetSearch">重置</button>
      </div>
    </div>

    <div class="card overflow-hidden flex-1 flex flex-col">
      <div class="overflow-y-auto flex-1">
        <table class="data-table w-full">
          <thead class="sticky top-0 bg-white z-10">
            <tr>
              <th style="width: 60px;">序号</th>
              <th style="width: 100px;">操作模块</th>
              <th>操作内容</th>
              <th>详情信息</th>
              <th style="width: 100px;">操作人</th>
              <th style="width: 120px;">操作人账号</th>
              <th style="width: 80px;">状态</th>
              <th style="width: 160px;">操作时间</th>
              <th style="width: 80px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="empty-row">
              <td colspan="9">
                <span class="empty-text">加载中...</span>
              </td>
            </tr>
            <tr v-else-if="logs.length === 0" class="empty-row">
              <td colspan="9">
                <span class="empty-text">暂无日志记录</span>
              </td>
            </tr>
            <tr v-for="(log, index) in pagedLogs" :key="log.id" v-else>
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>
                <span class="badge" :class="getModuleBadgeClass(log.module)">{{ log.module }}</span>
              </td>
              <td style="text-align: center; max-width: 200px;">
                <span class="log-detail" :title="log.action">{{ log.action }}</span>
              </td>
              <td style="text-align: left; max-width: 300px;">
                <span class="log-detail" :title="log.detail">{{ log.detail || '-' }}</span>
              </td>
              <td>{{ log.operatorName || '-' }}</td>
              <td>{{ log.operator || '-' }}</td>
              <td>
                <span :class="log.status === 1 ? 'badge badge-green' : 'badge badge-red'">
                  {{ log.status === 1 ? '成功' : '失败' }}
                </span>
              </td>
              <td>{{ log.createdAt }}</td>
              <td>
                <div class="flex justify-center items-center gap-2">
                  <button class="btn-icon p-2 rounded-full hover:bg-gray-100 transition-colors" @click="handleViewDetail(log)">
                    <Eye class="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-4 border-t border-surface-100 flex items-center justify-between text-sm text-surface-400 flex-shrink-0">
        <span>共 <strong class="text-surface-700">{{ total }}</strong> 条日志</span>
        <div class="flex gap-1">
          <button class="btn-icon w-7 h-7" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)"><ChevronLeft class="w-3.5 h-3.5" /></button>
          <button v-for="page in totalPages" :key="page" class="w-7 h-7 flex items-center justify-center text-xs rounded-lg" :class="currentPage === page ? 'bg-primary-600 text-white' : 'text-surface-500 hover:bg-surface-100'" @click="handlePageChange(page)">{{ page }}</button>
          <button class="btn-icon w-7 h-7" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)"><ChevronRight class="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>日志详情</h3>
            <button class="modal-close" @click="showDetailModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">操作模块</span>
              <span class="detail-value">{{ currentLog.module }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">操作内容</span>
              <span class="detail-value">{{ currentLog.action }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">操作人</span>
              <span class="detail-value">{{ currentLog.operatorName }}（{{ currentLog.operator }}）</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">目标ID</span>
              <span class="detail-value">{{ currentLog.targetId || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">IP地址</span>
              <span class="detail-value">{{ currentLog.ip || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">状态</span>
              <span class="detail-value">
                <span :class="currentLog.status === 1 ? 'badge badge-green' : 'badge badge-red'">
                  {{ currentLog.status === 1 ? '成功' : '失败' }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">操作时间</span>
              <span class="detail-value">{{ currentLog.createdAt }}</span>
            </div>
            <div class="detail-row" v-if="currentLog.detail">
              <span class="detail-label">详细信息</span>
              <div class="detail-value">
                <div v-for="(section, index) in parseDetailSections(currentLog.detail)" :key="index" class="detail-section">
                  <div v-if="section.type === 'text'" class="detail-text">{{ section.content }}</div>
                  <div v-else-if="section.type === 'json'" class="detail-json">
                    <div class="detail-json-title" v-if="section.title">{{ section.title }}</div>
                    <pre class="detail-json-content">{{ JSON.stringify(section.content, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="canRestore(currentLog)" class="btn btn-primary flex items-center gap-2" @click="handleRestore(currentLog)">
              <RotateCcw class="w-4 h-4" /> 恢复数据
            </button>
            <button class="btn btn-outline" @click="showDetailModal = false">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Eye, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-vue-next'
import { getLogList } from '@/api/log'
import { updateMeeting } from '@/api/meeting'
import { addQueue, callNextQueue, completeQueue } from '@/api/queue'

const logs = ref([])
const total = ref(0)
const loading = ref(false)

const searchOperator = ref('')
const searchDetail = ref('')
const filterModule = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')

const currentPage = ref(1)
const pageSize = ref(200)

const showDetailModal = ref(false)
const currentLog = ref({})

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const pagedLogs = computed(() => {
  return logs.value
})

const fetchLogList = async () => {
  loading.value = true
  try {
    const res = await getLogList({
      page: currentPage.value,
      pageSize: pageSize.value,
      operator: searchOperator.value,
      detail: searchDetail.value,
      module: filterModule.value,
      startDate: filterStartDate.value,
      endDate: filterEndDate.value
    })
    logs.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取日志列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchLogList()
}

const resetSearch = () => {
  searchOperator.value = ''
  searchDetail.value = ''
  filterModule.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  currentPage.value = 1
  fetchLogList()
}

const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchLogList()
}

const handleViewDetail = (log) => {
  currentLog.value = log
  showDetailModal.value = true
}

const getModuleBadgeClass = (module) => {
  const map = {
    '用户管理': 'badge-blue',
    '角色管理': 'badge-purple',
    '客户资料': 'badge-cyan',
    '洽谈室管理': 'badge-indigo',
    '业务管理': 'badge-amber',
    '排号系统': 'badge-green',
    '页面管理': 'badge-pink',
    '系统登录': 'badge-orange'
  }
  return map[module] || 'badge-gray'
}

const parseDetailSections = (detail) => {
  if (!detail) return []

  const sections = []
  let remaining = detail

  // 匹配 [RESTORE_JSON]...[/RESTORE_JSON]
  const restoreMatch = remaining.match(/\[RESTORE_JSON\](.+?)\[\/RESTORE_JSON\]/s)
  if (restoreMatch) {
    const beforeText = remaining.substring(0, restoreMatch.index).trim()
    if (beforeText) {
      sections.push({ type: 'text', content: beforeText })
    }
    try {
      sections.push({
        type: 'json',
        title: '洽谈室恢复数据',
        content: JSON.parse(restoreMatch[1])
      })
    } catch (e) {
      sections.push({ type: 'text', content: restoreMatch[0] })
    }
    remaining = remaining.substring(restoreMatch.index + restoreMatch[0].length).trim()
  }

  // 匹配 [QUEUE_DATA]...[/QUEUE_DATA]
  const queueMatch = remaining.match(/\[QUEUE_DATA\](.+?)\[\/QUEUE_DATA\]/s)
  if (queueMatch) {
    const beforeText = remaining.substring(0, queueMatch.index).trim()
    if (beforeText) {
      sections.push({ type: 'text', content: beforeText })
    }
    try {
      sections.push({
        type: 'json',
        title: '排号数据',
        content: JSON.parse(queueMatch[1])
      })
    } catch (e) {
      sections.push({ type: 'text', content: queueMatch[0] })
    }
    remaining = remaining.substring(queueMatch.index + queueMatch[0].length).trim()
  }

  if (remaining) {
    sections.push({ type: 'text', content: remaining })
  }

  return sections.length > 0 ? sections : [{ type: 'text', content: detail }]
}

const canRestore = (log) => {
  if (!log || log.module !== '洽谈室管理' || log.status !== 1) return false
  return log.action === '关闭洽谈室' || log.action === '删除排号记录'
}

const handleRestore = async (log) => {
  if (!log.detail) return

  if (log.action === '关闭洽谈室') {
    await handleRestoreMeeting(log)
  } else if (log.action === '删除排号记录') {
    await handleRestoreQueue(log)
  }
}

const handleRestoreMeeting = async (log) => {
  let restoreData = null

  const jsonMatch = log.detail.match(/\[RESTORE_JSON\](.+?)\[\/RESTORE_JSON\]/)
  if (jsonMatch) {
    try {
      restoreData = JSON.parse(jsonMatch[1])
    } catch (e) {
      console.error('解析恢复数据JSON失败:', e)
    }
  }

  if (!restoreData) {
    const restoreMatch = log.detail.match(/恢复操作: (.+?)(?:\s*\||$)/)
    if (restoreMatch) {
      const restoreStr = restoreMatch[1]
      restoreData = {}

      const statusMatch = restoreStr.match(/状态: ([^,]+)/)
      const typeMatch = restoreStr.match(/类型: ([^,]+)/)
      const companyMatch = restoreStr.match(/公司: ([^,]+)/)
      const pointsMatch = restoreStr.match(/报价点数: ([^,]+)/)
      const requirementMatch = restoreStr.match(/见客要求: ([^,]+)/)

      if (statusMatch) {
        const statusMap = { '空闲': 'free', '启用': 'occupied', '暂停': 'disabled' }
        restoreData.status = statusMap[statusMatch[1].trim()] || 'occupied'
      }
      if (typeMatch) {
        const typeMap = { '公开见客': 'public', '专点见客': 'private' }
        restoreData.type = typeMap[typeMatch[1].trim()] || 'public'
      }
      if (companyMatch) restoreData.companyName = companyMatch[1].trim()
      if (pointsMatch) restoreData.quotePoints = pointsMatch[1].trim()
      if (requirementMatch) restoreData.visitRequirement = requirementMatch[1].trim()

      const queueMatch = log.detail.match(/排号记录: (.+?)(?:\s*$)/)
      if (queueMatch) {
        restoreData.queues = queueMatch[1].split(', ').map(q => {
          const numMatch = q.match(/^([^\(]+)/)
          return {
            queueNumber: numMatch ? numMatch[1].trim() : q.trim()
          }
        })
      }
    }
  }

  if (!restoreData) {
    const roomInfo = log.detail.split(' | ')[0] || log.detail
    const hasRoomInfo = /洽谈室:/.test(roomInfo)
    if (!hasRoomInfo) {
      alert('未找到恢复数据')
      return
    }

    restoreData = {}

    const statusMatch = roomInfo.match(/状态: ([^,]+)/)
    const typeMatch = roomInfo.match(/类型: ([^,]+)/)
    const companyMatch = roomInfo.match(/公司: ([^,]+)/)
    const pointsMatch = roomInfo.match(/报价点数: ([^,]+)/)
    const requirementMatch = roomInfo.match(/见客要求: ([^,]+)/)

    if (statusMatch) {
      const statusMap = { '空闲': 'free', '启用': 'occupied', '暂停': 'disabled' }
      restoreData.status = statusMap[statusMatch[1].trim()] || 'occupied'
    }
    if (typeMatch) {
      const typeMap = { '公开见客': 'public', '专点见客': 'private' }
      restoreData.type = typeMap[typeMatch[1].trim()] || 'public'
    }
    if (companyMatch) restoreData.companyName = companyMatch[1].trim()
    if (pointsMatch) restoreData.quotePoints = pointsMatch[1].trim()
    if (requirementMatch) restoreData.visitRequirement = requirementMatch[1].trim()

    const queueMatch = log.detail.match(/排号记录: (.+?)(?:\s*\[)/)
    if (queueMatch) {
      restoreData.queues = queueMatch[1].split(', ').map(q => {
        const numMatch = q.match(/^([^\(]+)/)
        return {
          queueNumber: numMatch ? numMatch[1].trim() : q.trim()
        }
      })
    }
  }

  try {
    const roomNameMatch = log.detail.match(/洽谈室: ([^,]+)/)
    const roomName = roomNameMatch ? roomNameMatch[1].trim() : (log.targetId + '号洽谈室')

    const updateData = {
      id: parseInt(log.targetId),
      name: roomName,
      type: restoreData.type || 'public',
      status: 'occupied',
      companyName: restoreData.companyName || '',
      quotePoints: restoreData.quotePoints || '',
      visitRequirement: restoreData.visitRequirement || ''
    }

    const res = await updateMeeting(updateData)
    if (res.code === 200) {
      let queueRestored = 0
      let callRestored = 0
      const queueDataMatch = log.detail.match(/\[QUEUE_DATA\](.+?)\[\/QUEUE_DATA\]/)
      if (queueDataMatch) {
        try {
          const queueRecords = JSON.parse(queueDataMatch[1])
          for (const record of queueRecords) {
            if (record.companyId && record.roomId) {
              try {
                const addRes = await addQueue({
                  companyId: record.companyId,
                  roomId: record.roomId,
                  queueNumber: record.queueNumber
                })
                queueRestored++
                if (addRes.data?.id && (record.status === 'called' || record.status === 'completed')) {
                  try {
                    await callNextQueue(addRes.data.id)
                    callRestored++
                  } catch (e) {
                    console.error('恢复叫号状态失败:', e)
                  }
                }
                if (addRes.data?.id && record.completed) {
                  try {
                    await completeQueue(addRes.data.id)
                  } catch (e) {
                    console.error('恢复完成状态失败:', e)
                  }
                }
              } catch (e) {
                console.error('恢复排号失败:', e)
              }
            }
          }
        } catch (e) {
          console.error('解析排号恢复数据失败:', e)
        }
      }
      let msg = '洽谈室已恢复'
      if (queueRestored > 0) msg += `，${queueRestored} 条排号记录已恢复`
      if (callRestored > 0) msg += `（含 ${callRestored} 条已叫号）`
      alert(msg)
      showDetailModal.value = false
    } else {
      alert(res.message || '恢复失败')
    }
  } catch (error) {
    console.error('恢复失败:', error)
    alert('恢复失败')
  }
}

const handleRestoreQueue = async (log) => {
  const queueDataMatch = log.detail.match(/\[QUEUE_DATA\](.+?)\[\/QUEUE_DATA\]/)
  if (!queueDataMatch) {
    alert('未找到排号恢复数据')
    return
  }

  let queueRecords = []
  try {
    queueRecords = JSON.parse(queueDataMatch[1])
  } catch (e) {
    console.error('解析排号恢复数据失败:', e)
    alert('排号数据解析失败')
    return
  }

  if (queueRecords.length === 0) {
    alert('没有可恢复的排号数据')
    return
  }

  if (!confirm(`确定要恢复 ${queueRecords.length} 条排号记录吗？`)) return

  let successCount = 0
  let failCount = 0

  for (const record of queueRecords) {
    try {
      const data = {}
      if (record.roomId) data.roomId = record.roomId
      if (record.companyId) data.companyId = record.companyId
      if (record.customerId) data.customerId = record.customerId
      if (record.queueNumber) data.queueNumber = record.queueNumber
      if (Object.keys(data).length > 0) {
        const res = await addQueue(data)
        if (res.code === 200) {
          successCount++
          if (res.data?.id && (record.status === 'called' || record.status === 'completed')) {
            try { await callNextQueue(res.data.id) } catch (e) {}
          }
          if (res.data?.id && record.completed) {
            try { await completeQueue(res.data.id) } catch (e) {}
          }
        } else {
          failCount++
        }
      } else {
        failCount++
      }
    } catch (error) {
      console.error('恢复排号失败:', record, error)
      failCount++
    }
  }

  let msg = `恢复成功 ${successCount} 条`
  if (failCount > 0) {
    msg += `，失败 ${failCount} 条`
  }
  alert(msg)
  if (successCount > 0) {
    showDetailModal.value = false
  }
}

onMounted(() => {
  fetchLogList()
})
</script>

<style scoped>
.data-table th, .data-table td {
  text-align: center;
}

.empty-row td {
  text-align: center !important;
  padding: 40px !important;
  color: #94a3b8 !important;
}

.empty-text {
  display: block;
  text-align: center;
}

.log-detail {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
}

.detail-content {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  display: block;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-top: 8px;
}

.detail-section {
  margin-bottom: 12px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-text {
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-json {
  margin-top: 8px;
}

.detail-json-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.detail-json-content {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.badge-green {
  background-color: #dcfce7;
  color: #166534;
}

.badge-red {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-blue {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-purple {
  background-color: #f3e8ff;
  color: #6b21a8;
}

.badge-cyan {
  background-color: #cffafe;
  color: #155e75;
}

.badge-indigo {
  background-color: #e0e7ff;
  color: #3730a3;
}

.badge-amber {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-pink {
  background-color: #fce7f3;
  color: #9d174d;
}

.badge-orange {
  background-color: #ffedd5;
  color: #9a3412;
}

.badge-gray {
  background-color: #f1f5f9;
  color: #475569;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  margin: 0;
  padding: 0;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 90%;
  max-width: 550px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background-color: #f9fafb;
}
</style>
