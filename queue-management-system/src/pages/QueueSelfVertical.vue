<template>
  <div class="flex items-start min-h-screen bg-gradient-to-b from-primary-50 to-white" :style="isLocked ? 'overflow-x: hidden; touch-action: pan-y;' : 'overflow-x: auto;'">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    <div id="page-queue-self-vertical" class="slide-in h-screen flex flex-col pt-8" :style="isLocked ? 'width: 100vw; max-width: 100vw; overflow-x: hidden; touch-action: pan-y;' : 'width: 100vw; max-width: 100vw;'">
    <!-- 顶部标题区域 -->
    <div class="mb-6 sm:mb-8 pt-2 sm:pt-4 relative">
      <!-- 刷新按钮 -->
      <button class="absolute left-4 top-4 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors" @click="refreshRooms">
        刷新
      </button>
      <!-- 锁定按钮 -->
      <button class="absolute right-4 top-4 z-20 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors" @click="toggleLock">
        <svg v-if="!isLocked" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </button>
      <div class="text-center">
        <div class="w-16 sm:w-24 h-16 sm:h-24 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <img src="/LOGO.png" alt="新悦翔" class="w-full h-full object-contain" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold" style="color: #d71d1d;">公开见客排号系统</h2>
        <p class="text-xs sm:text-sm text-surface-400 mt-1 sm:mt-2">扫描二维码完成排号登记</p>
      </div>
    </div>
    
    <!-- 洽谈室选择区域 -->
    <div class="mb-8 overflow-y-auto" style="max-height: calc(100vh - 450px);">
      <div class="flex flex-wrap justify-center gap-6 px-4 w-full py-4">
        <div
          v-for="(room, index) in activeRooms"
          :key="room.id"
          class="room-card bg-white rounded-2xl border-2 border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
        >
          <!-- 右上角二维码 -->
          <div class="absolute top-4 right-4 z-20">
            <div class="bg-white rounded-xl p-2 shadow-lg border border-gray-100">
              <div v-if="!isQRCodeExpired(room.id)" class="relative">
                <img :src="getRoomQRCode(room.id)" :alt="room.name + '排号二维码'" class="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                <div class="text-xs text-center text-gray-500 mt-1 font-medium">扫码排号</div>
              </div>
              <div v-else class="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
                <div class="text-gray-400 text-center text-xs mb-1">已失效</div>
                <div class="text-gray-400 text-center text-xs mb-2">刷新二维码排号</div>
                <button 
                  @click.stop="refreshQRCode(room.id)" 
                  class="px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors"
                >
                  刷新
                </button>
              </div>
            </div>
          </div>

          <div class="p-6 sm:p-7">
            <!-- 洽谈室标题 -->
            <div class="flex items-center gap-3 mb-4">
              <div class="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5.5 h-5.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h4 class="text-xl sm:text-2xl font-bold text-gray-800">{{ room.name }}</h4>
            </div>

            <!-- 状态标签 -->
            <div class="mb-4">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                可排号
              </span>
            </div>

            <!-- 公司名称 -->
            <div v-if="room.companyName" class="mb-4">
              <div class="text-xs text-gray-500 mb-1.5 font-medium">公司名称</div>
              <p class="text-base font-semibold text-gray-800">{{ room.companyName }}</p>
            </div>

            <!-- 见客要求 -->
            <div v-if="room.visitRequirement && room.visitRequirement.trim()">
              <div class="text-xs text-gray-500 mb-1.5 font-medium">见客要求</div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ room.visitRequirement }}</p>
            </div>
          </div>
        </div>

        <div v-if="activeRooms.length === 0" class="w-full text-center py-8">
          <div class="marquee-container">
            <div class="marquee-text">欢迎光临新悦翔玩具展馆</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 引导语区域 -->
    <div class="fixed bottom-0 left-0 right-0 mx-4 mb-4 z-50">
      <div class="card p-4 sm:p-6 rounded-xl shadow-md bg-white">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div class="flex items-center">
            <div class="text-center">
              <h3 class="text-lg sm:text-xl font-semibold text-surface-800 mb-2" style="font-size: 32px;">温馨提示</h3>
              <p class="text-base sm:text-lg text-surface-600 font-semibold mb-2" style="color: #f91a01; font-size: 32px;">首次排号请先扫描二维码</p>
              <p class="text-base sm:text-lg text-surface-600 font-semibold" style="color: #f91a01; font-size: 32px;">关注小程序</p>
            </div>
            <!-- 动态指向二维码的箭头 -->
            <div class="ml-4 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="w-28 sm:w-32 h-28 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <!-- 小程序二维码：扫码直接进入排号页面 -->
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(miniappScanUrl)}&margin=2`" alt="小程序二维码" class="w-24 h-24 object-contain" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部信息 -->
    <div class="fixed bottom-0 left-0 right-0 text-center text-xs text-surface-400 pb-4 sm:pb-6 px-4 z-40">
      © 2026 公开见客排号系统 | 版本 1.0.0
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getMeetingList } from '@/api/meeting'

const MINIAPP_ORIGIN = 'https://xinyuexiang.com'
const MINIAPP_APPID = 'wxd1234567890abcdef'

const showMessage = ref(false)
const message = ref('')
const isLocked = ref(false)

const preventHorizontalScroll = (e) => {
  if (isLocked.value) {
    e.preventDefault()
  }
}

const preventTouchMove = (e) => {
  if (isLocked.value) {
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    
    const handleMove = (moveEvent) => {
      const moveX = moveEvent.touches[0].clientX
      const moveY = moveEvent.touches[0].clientY
      const diffX = Math.abs(moveX - startX)
      const diffY = Math.abs(moveY - startY)
      
      if (diffX > diffY && diffX > 10) {
        moveEvent.preventDefault()
      }
    }
    
    const handleEnd = () => {
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
    
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
  }
}

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const toggleLock = () => {
  isLocked.value = !isLocked.value
}

watch(isLocked, (newVal) => {
  if (newVal) {
    document.addEventListener('wheel', preventHorizontalScroll, { passive: false })
    document.addEventListener('touchstart', preventTouchMove, { passive: true })
  } else {
    document.removeEventListener('wheel', preventHorizontalScroll)
    document.removeEventListener('touchstart', preventTouchMove)
  }
})

// 响应式数据
const meetingRooms = ref([])
// 二维码状态管理 { roomId: { timestamp: number, timer: number } }
const qrcodeStates = ref({})
// 响应式时间变量，用于触发自动更新
const currentTime = ref(Date.now())

// 获取已启用的洽谈室
const activeRooms = computed(() => {
  console.log('All rooms:', meetingRooms.value)
  const active = meetingRooms.value.filter(room => room.status === 'occupied')
  console.log('Active rooms:', active)
  // 初始化每个房间的二维码状态
  active.forEach(room => {
    if (!qrcodeStates.value[room.id]) {
      initQRCodeState(room.id)
    }
  })
  return active
})

// 初始化二维码状态
const initQRCodeState = (roomId) => {
  qrcodeStates.value[roomId] = {
    timestamp: Date.now(),
    timer: null
  }
  // 设置2秒后失效
  qrcodeStates.value[roomId].timer = setTimeout(() => {
    // 失效不需要额外操作，isQRCodeExpired 会自动判断
  }, 2000)
}

// 检查二维码是否失效
const isQRCodeExpired = (roomId) => {
  const state = qrcodeStates.value[roomId]
  if (!state) return true
  // 引用 currentTime 来触发响应式更新
  const _ = currentTime.value
  return Date.now() - state.timestamp > 2000
}

// 刷新二维码
const refreshQRCode = (roomId) => {
  // 清除旧定时器
  if (qrcodeStates.value[roomId]?.timer) {
    clearTimeout(qrcodeStates.value[roomId].timer)
  }
  // 重新初始化
  initQRCodeState(roomId)
}

// 生成洽谈室排号二维码
const getRoomQRCode = (roomId) => {
  const room = activeRooms.value.find(r => r.id === roomId)
  if (!room) return ''
  const roomData = {
    roomId: room.id,
    roomName: room.name,
    type: 'room_queue',
    timestamp: qrcodeStates.value[roomId]?.timestamp || Date.now()
  }
  const encodedData = encodeURIComponent(JSON.stringify(roomData))
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}&margin=2`
}

// 从后端加载洽谈室列表
const loadMeetings = async () => {
  try {
    const response = await getMeetingList()
    if (response.code === 200) {
      meetingRooms.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载洽谈室列表失败:', error)
    showCustomMessage('加载洽谈室列表失败')
  }
}

// 在组件挂载时加载数据
onMounted(() => {
  loadMeetings()
  // 如果初始是锁定状态，添加事件监听
  if (isLocked.value) {
    document.addEventListener('wheel', preventHorizontalScroll, { passive: false })
    document.addEventListener('touchstart', preventTouchMove, { passive: true })
  }
})

// 手动刷新洽谈室列表
const refreshRooms = async () => {
  console.log('手动刷新洽谈室列表')
  try {
    await loadMeetings()
    showCustomMessage('洽谈室列表已刷新')
  } catch (e) {
    console.error('Error refreshing meetingRooms:', e)
    showCustomMessage('刷新失败，请重试')
  }
}

// 定时刷新洽谈室数据
let refreshInterval = null
// 定时更新时间，让二维码失效状态自动显示
let timeUpdateInterval = null

onMounted(() => {
  refreshInterval = setInterval(() => {
    console.log('自动刷新洽谈室数据')
    loadMeetings()
  }, 2000) // 2秒刷新一次
  
  // 每500ms更新一次时间，触发响应式更新
  timeUpdateInterval = setInterval(() => {
    currentTime.value = Date.now()
  }, 500)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
  // 清除所有二维码定时器
  Object.values(qrcodeStates.value).forEach(state => {
    if (state.timer) {
      clearTimeout(state.timer)
    }
  })
  // 清除滚动事件监听
  document.removeEventListener('wheel', preventHorizontalScroll)
  document.removeEventListener('touchstart', preventTouchMove)
})

// 小程序扫码链接：包含排号场景标识，扫码后小程序自动获取用户信息并匹配排号
const miniappScanUrl = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return `${MINIAPP_ORIGIN}/miniapp/queue?scene=scan_bind&date=${today}&autoQueue=true`
})
</script>

<style scoped>
/* 洽谈室卡片样式 */
.room-card {
  width: calc(50% - 12px);
  min-width: 320px;
  max-width: 520px;
}

@media (max-width: 768px) {
  .room-card {
    width: 100%;
    max-width: 100%;
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

/* 滚动字幕样式 */
.marquee-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  background: linear-gradient(90deg, #fef3c7, #fde68a, #fef3c7);
  border-radius: 12px;
  padding: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.marquee-text {
  display: inline-block;
  font-size: 36px;
  font-weight: 700;
  color: #d71d1d;
  animation: marquee-scroll 8s linear infinite;
  padding-left: 100%;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-200%);
  }
}
</style>