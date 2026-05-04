<template>
  <div id="page-queue-display" class="slide-in">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-surface-900">排号显示大屏</h2>
        <p class="text-sm text-surface-400 mt-1">大屏展示内容配置与控制管理</p>
      </div>
      <div class="flex gap-3 items-center">
        <div class="flex items-center gap-2">
          <span class="text-sm text-surface-500">大屏状态</span>
          <button id="display-toggle" class="relative inline-flex w-12 h-6 rounded-full transition-colors cursor-pointer" :class="{ 'bg-accent-500': displayStatus === '已开启', 'bg-surface-300': displayStatus === '已关闭' }" @click="toggleDisplay">
            <span class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform" :class="{ 'translate-x-6': displayStatus === '已开启' }"></span>
          </button>
          <span class="text-sm font-medium text-accent-600" id="display-status">{{ displayStatus }}</span>
        </div>
        <button class="btn btn-primary" @click="previewDisplay">预览大屏</button>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-5">
      <!-- Display screen preview -->
      <div class="col-span-8">
        <div class="display-screen p-6">
          <!-- 洽谈室状态卡片 -->
          <div v-if="activeRooms.length > 0" :class="['grid', 'gap-2.5', 'w-full', 'rooms-container', activeRooms.length === 1 ? 'grid-cols-1' : activeRooms.length === 2 ? 'grid-cols-2' : 'grid-cols-3']">
            <div v-for="room in activeRooms" :key="room.id" class="room-card p-6 rounded-lg border text-center" :style="{ backgroundColor: settings.cardColor, borderColor: settings.cardColor }">
              <div class="text-2xl md:text-3xl font-bold mb-4 text-white">{{ room.name }}</div>
              <div class="text-lg md:text-xl text-white mb-3">类型: {{ room.type === 'public' ? '公开见客' : '专点见客' }}</div>
              <div class="text-lg md:text-xl text-white mb-3">当前叫号: {{ room.currentNumber || '000' }}</div>
              <div class="text-lg md:text-xl text-white mb-3">下一个号: {{ room.nextNumber || '000' }}</div>
              <div class="text-lg md:text-xl text-white">预计等待时间：{{ room.waitingTime || '0' }}分钟</div>
            </div>
          </div>
          <div v-else class="text-center text-gray-400 mt-8 rooms-container">
            暂无开启的洽谈室
          </div>

          <!-- 北京时间显示 -->
          <div class="time-display text-center">
            <div class="text-sm text-white">北京时间</div>
            <div class="text-lg font-bold text-white">{{ beijingTime }}</div>
          </div>
        </div>
      </div>
      <!-- Display settings -->
      <div class="col-span-4">
        <div class="card p-5">
          <h3 class="font-semibold text-surface-800 mb-4">大屏设置</h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">大屏标题</label>
              <input type="text" class="form-input" v-model="settings.screenTitle" />
            </div>
            <div>
              <label class="form-label">卡片颜色</label>
              <select class="form-input form-select" v-model="settings.cardColor">
                <option v-for="color in colorOptions" :key="color.value" :value="color.value">
                  {{ color.label }} ({{ color.value }})
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">刷新间隔</label>
              <select class="form-input form-select" v-model="settings.refreshInterval">
                <option value="5">5秒</option>
                <option value="10">10秒</option>
                <option value="30">30秒</option>
                <option value="60">60秒</option>
              </select>
            </div>
            <div>
              <label class="form-label">显示数量</label>
              <input type="number" class="form-input" v-model.number="settings.displayCount" min="1" max="50" />
            </div>
            <div>
              <label class="form-label">语音音色</label>
              <select class="form-input form-select" v-model="settings.voiceType">
                <option value="female">女声</option>
                <option value="male">男声</option>
              </select>
            </div>
            <div>
              <label class="form-label">语速</label>
              <select class="form-input form-select" v-model="settings.speechRate">
                <option value="0.5">很慢 (0.5x)</option>
                <option value="0.7">慢 (0.7x)</option>
                <option value="0.8">稍慢 (0.8x)</option>
                <option value="1.0">正常 (1.0x)</option>
                <option value="1.2">稍快 (1.2x)</option>
                <option value="1.5">快 (1.5x)</option>
              </select>
            </div>

            <button class="btn btn-primary w-full mt-2" @click="saveSettings">保存设置</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMeetingList } from '../api/meeting'
import { getDisplaySettings, saveDisplaySettings, getDisplayStatus, updateDisplayStatus } from '../api/display'

const displayStatus = ref('off')
const meetingRooms = ref([])

const showMessage = ref(false)
const message = ref('')

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const activeRooms = computed(() => {
  return meetingRooms.value.filter(room => room.status === 'occupied')
})

let ws = null
let reconnectTimer = null
let reconnectInterval = 5000

const getWsUrl = () => {
  const baseUrl = import.meta.env.VITE_WS_URL || (window.location.origin.replace('http', 'ws') + '/ws')
  return baseUrl
}

const connectWebSocket = () => {
  try {
    ws = new WebSocket(getWsUrl())

    ws.onopen = () => {
      console.log('WebSocket connected')
      reconnectInterval = 5000
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error('Parse WebSocket message error:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      scheduleReconnect()
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  } catch (error) {
    console.error('Create WebSocket error:', error)
    scheduleReconnect()
  }
}

const scheduleReconnect = () => {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    reconnectInterval = Math.min(reconnectInterval * 2, 30000)
    connectWebSocket()
  }, reconnectInterval)
}

const handleWebSocketMessage = (data) => {
  if (data.type === 'room_update') {
    meetingRooms.value = data.data || []
  }
}

const loadRooms = async () => {
  try {
    const res = await getMeetingList()
    if (res.code === 200 && res.data) {
      meetingRooms.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载洽谈室失败:', error)
  }
}

const colorOptions = [
  { value: '#6ba6d6', label: '浅蓝色' },
  { value: '#5698c3', label: '深蓝色' },
  { value: '#2196f3', label: '标准蓝' },
  { value: '#1976d2', label: '深海军蓝' },
  { value: '#0d47a1', label: '藏青色' },
  { value: '#4caf50', label: '绿色' },
  { value: '#81c784', label: '浅绿色' },
  { value: '#388e3c', label: '深绿色' },
  { value: '#2e7d32', label: '森林绿' },
  { value: '#ff9800', label: '橙色' },
  { value: '#ffb74d', label: '浅橙色' },
  { value: '#f57c00', label: '深橙色' },
  { value: '#f44336', label: '红色' },
  { value: '#ef5350', label: '浅红色' },
  { value: '#d32f2f', label: '深红色' },
  { value: '#b71c1c', label: '暗红色' },
  { value: '#9c27b0', label: '紫色' },
  { value: '#ba68c8', label: '浅紫色' },
  { value: '#7b1fa2', label: '深紫色' },
  { value: '#ffeb3b', label: '黄色' },
  { value: '#fff176', label: '浅黄色' },
  { value: '#fbc02d', label: '深黄色' },
  { value: '#9e9e9e', label: '灰色' },
  { value: '#616161', label: '深灰色' },
  { value: '#424242', label: '暗灰色' }
]

const settings = ref({
  screenTitle: '个人排号测试',
  displayMode: 'standard',
  refreshInterval: '10',
  displayCount: 10,
  cardColor: '#6ba6d6',
  voiceType: 'female',
  speechRate: '0.8'
})

const beijingTime = ref('')

const updateBeijingTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  beijingTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

let timeInterval = null
let refreshInterval = null

const loadDisplaySettings = async () => {
  try {
    const res = await getDisplaySettings()
    if (res.code === 200 && res.data) {
      settings.value = {
        screenTitle: res.data.screenTitle || '个人排号测试',
        displayMode: 'standard',
        refreshInterval: res.data.refreshInterval || '10',
        displayCount: res.data.displayCount || 10,
        cardColor: res.data.cardColor || '#6ba6d6',
        voiceType: res.data.voiceType || 'female',
        speechRate: res.data.speechRate || '0.8'
      }
    }
  } catch (error) {
    console.error('加载大屏设置失败:', error)
  }
}

const loadDisplayStatus = async () => {
  try {
    const res = await getDisplayStatus()
    if (res.code === 200 && res.data) {
      displayStatus.value = res.data.status === 'on' ? '已开启' : '已关闭'
    }
  } catch (error) {
    console.error('加载大屏状态失败:', error)
  }
}

onMounted(async () => {
  updateBeijingTime()
  timeInterval = setInterval(updateBeijingTime, 1000)

  await loadDisplaySettings()
  await loadDisplayStatus()
  await loadRooms()

  connectWebSocket()

  refreshInterval = setInterval(async () => {
    await loadRooms()
  }, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (ws) {
    ws.close()
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
})

const toggleDisplay = async () => {
  const newStatus = displayStatus.value === '已开启' ? 'off' : 'on'
  try {
    const res = await updateDisplayStatus({ status: newStatus })
    if (res.code === 200) {
      displayStatus.value = newStatus === 'on' ? '已开启' : '已关闭'
    }
  } catch (error) {
    console.error('切换大屏状态失败:', error)
  }
}

const previewDisplay = () => {
  window.open('/#/queue/display/preview', 'queueDisplay', 'width=1366,height=768,toolbar=no,menubar=no,fullscreen=yes')
}

const saveSettings = async () => {
  try {
    const res = await saveDisplaySettings(settings.value)
    if (res.code === 200) {
      showCustomMessage('设置保存成功！')
    } else {
      showCustomMessage(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    showCustomMessage('保存失败')
  }
}
</script>

<style scoped>
.display-screen {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.rooms-container {
  flex: 1;
  min-height: 400px;
  display: grid;
  align-items: center;
}

.room-card {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.room-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 10px,
    transparent 10px,
    transparent 20px
  );
  animation: wave 10s linear infinite;
}

@keyframes wave {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100px 100px;
  }
}

.time-display {
  margin-top: 10px;
  padding-top: 10px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  align-self: flex-end;
}

@media (max-width: 1200px) {
  .room-card {
    min-height: 120px;
  }
  .room-card .text-2xl {
    font-size: 1.5rem;
  }
  .room-card .text-lg {
    font-size: 1rem;
  }
}

@media (max-width: 992px) {
  .room-card {
    min-height: 100px;
  }
  .room-card .text-2xl {
    font-size: 1.25rem;
  }
  .room-card .text-lg {
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .room-card {
    min-height: 80px;
  }
  .room-card .text-2xl {
    font-size: 1rem;
  }
  .room-card .text-lg {
    font-size: 0.75rem;
  }
}

.custom-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 90%;
  max-width: 400px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: messageFadeIn 0.3s ease-in-out;
  text-align: center;
}

@keyframes messageFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.message-content {
  font-size: 16px;
  color: #374151;
  text-align: center;
  margin: 0;
}

.message-close {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: center;
  transition: background-color 0.2s;
}

.message-close:hover {
  background-color: #2563eb;
}
</style>