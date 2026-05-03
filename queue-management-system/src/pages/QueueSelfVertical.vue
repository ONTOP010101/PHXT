<template>
  <div class="flex items-start min-h-screen bg-gradient-to-b from-primary-50 to-white overflow-x-auto">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    <div id="page-queue-self-vertical" class="slide-in h-screen flex flex-col pt-[100px]" style="width: 100vw; max-width: 100vw;">
    <!-- 返回按钮 -->
    <button v-if="hasSelectedRoom" class="ml-4 mt-4 mb-2 text-white font-bold transition-colors px-8 py-6 bg-primary-600 rounded-lg shadow-md w-32" style="height: 70px;" onclick="window.location.href='#/queue/self/vertical'">
      <span>返回</span>
    </button>
    <!-- 顶部标题区域 -->
    <div class="mb-6 sm:mb-8 pt-4 sm:pt-6">
      <div class="text-center">
        <div class="w-16 sm:w-24 h-16 sm:h-24 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <img src="/LOGO.png" alt="新悦翔" class="w-full h-full object-contain" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold" style="color: #d71d1d;">公开见客排号系统</h2>
        <p class="text-xs sm:text-sm text-surface-400 mt-1 sm:mt-2">请填写以下信息完成排号登记</p>
        <button class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors" @click="refreshRooms">
          刷新洽谈室列表
        </button>
      </div>
    </div>
    
    <!-- 洽谈室选择区域 -->
    <div class="mb-8">

      <!-- 选择模式 -->
      <div v-if="!hasSelectedRoom" class="flex flex-wrap justify-between gap-2 px-2 w-full">
        <div v-for="(room, index) in activeRooms" :key="room.id" class="card p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 w-[49%]" :class="{ 'border-2 border-primary-600 bg-primary-50': form.room === room.name }" :style="{ backgroundColor: index === 0 ? '#FFE4E1' : index === 1 ? '#E0FFFF' : '#F0F8FF' }" @click="selectRoom(room.name)">
          <h4 class="font-semibold text-surface-800 text-sm sm:text-base mb-1" style="font-size: 30px; text-align: center;">{{ room.name }}</h4>
          <div class="flex items-center justify-between">
            <i data-lucide="check" v-if="form.room === room.name" class="w-3 sm:w-4 h-3 sm:h-4 text-primary-600"></i>
          </div>
          <div v-if="room.companyName" class="text-xs text-surface-500 mt-1 sm:mt-2" style="font-size: 30px; text-align: center; display: flex; flex-direction: column; line-height: 50px;"><span style="color: #ff6a38; text-align: left; font-weight: 700;">公司名称: </span><span style="background-color: #ffffff; padding: 10px; border-radius: 5px; color: #0d0d0d;">{{ room.companyName }}</span></div>
          <div v-if="room.visitRequirement && room.visitRequirement.trim()" class="text-xs text-surface-500 mt-0.5 sm:mt-1" style="font-size: 20px; line-height: 80px; text-align: center; display: flex; flex-direction: column;"><span style="color: rgb(255, 106, 56); font-size: 30px; text-align: left; font-weight: 700;">见客要求：</span><span style="background-color: #ffffff; padding: 10px; border-radius: 5px; color: #050505; font-weight: 700; opacity: 0.8;">{{ room.visitRequirement }}</span></div>
        </div>
        <div v-if="activeRooms.length === 0" class="w-full text-center py-8">
          <p class="text-surface-400">暂无启用的洽谈室</p>
        </div>
      </div>
      <!-- 选中模式 -->
      <div v-else class="px-4">
        <div v-if="selectedRoom" class="card selected-room p-4 sm:p-6 rounded-xl transition-all duration-300 shadow-lg w-full mx-5 max-w-[calc(100%-60px)] min-h-[200px] sm:min-h-[400px]">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-surface-800 text-lg sm:text-xl">{{ selectedRoom.name }}</h4>
            <button class="text-primary-600 hover:text-primary-800" @click="resetSelectedRoom">
              <i data-lucide="x" class="w-4 sm:w-5 h-4 sm:h-5"></i>
            </button>
          </div>
          <div class="flex items-center mb-4">
            <span class="badge badge-orange px-2 sm:px-3 py-1 text-sm">启用中</span>
          </div>
          <div v-if="selectedRoom.companyName" class="text-xl sm:text-2xl text-surface-600 mb-2" style="line-height: 80px; font-size: 50px; color: #080808; font-weight: 800;">
            <span class="text-red-600 font-bold text-2xl sm:text-3xl" style="line-height: 80px; font-size: 50px;">公司名称：</span>{{ selectedRoom.companyName }}
          </div>
          <div v-if="selectedRoom.visitRequirement && selectedRoom.visitRequirement.trim()" class="text-xl sm:text-2xl" style="line-height: 100px; font-size: 50px; color: #080808; font-weight: 800;">
            <span class="text-red-600 font-bold text-2xl sm:text-3xl" style="line-height: 100px; font-size: 50px;">见客要求：</span>{{ selectedRoom.visitRequirement }}
          </div>
        </div>
      </div>
    </div>
    

    
    <!-- 排号信息区域 -->
    <div v-if="route.path === '/queue/self/vertical/new'" class="card mx-4 p-4 sm:p-6 rounded-xl shadow-md flex-1">
      <div class="flex items-center mb-4 sm:mb-6">
        <div class="w-6 sm:w-8 h-6 sm:h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
          <i data-lucide="edit-3" class="w-3 sm:w-4 h-3 sm:h-4 text-primary-600"></i>
        </div>
        <h3 class="font-semibold text-surface-800 text-lg sm:text-xl">排号信息</h3>
      </div>
      <div class="space-y-4 sm:space-y-5" @click="closeKeyboards">
        <!-- 选择洽谈室 -->
        <div class="space-y-2">
          <label class="form-label text-surface-600 font-medium text-sm sm:text-base">选择洽谈室</label>
          <select id="self-room" class="form-input form-select rounded-lg border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100" v-model="form.room" :disabled="hasSelectedRoom">
            <option value="">请选择洽谈室</option>
            <option v-for="room in activeRooms" :key="room.id" :value="room.name">{{ room.name }}</option>
          </select>
        </div>
        
        <!-- 生成二维码按钮 -->
        <button id="print-ticket-btn" class="btn btn-primary w-full justify-center py-3 sm:py-4 text-base sm:text-lg mt-6 sm:mt-8 mb-10 sm:mb-12 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1" @click.stop="generateQRCode">
          <i data-lucide="qrcode" class="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2"></i> 生成排号二维码
        </button>
        
        <!-- 二维码显示区域 -->
        <div v-if="qrcodeUrl" class="pt-10 sm:pt-12 text-center">
          <h4 class="font-semibold text-surface-800 text-lg sm:text-xl mb-4">排号二维码</h4>
          <div class="flex justify-center">
            <img :src="qrcodeUrl" alt="排号二维码" class="w-48 sm:w-64 h-48 sm:h-64 rounded-lg shadow-lg object-contain" />
          </div>
          <p class="mt-4 text-sm sm:text-base text-surface-600">请扫描二维码查看排号信息</p>
        </div>
      </div>
    </div>
    
    <!-- 引导语区域 -->
    <div v-if="route.path === '/queue/self/vertical'" class="mx-4 mb-8">
      <div class="card p-6 sm:p-8 rounded-xl shadow-md bg-white">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div class="flex items-center">
            <div class="text-center">
              <h3 class="text-lg sm:text-xl font-semibold text-surface-800 mb-4" style="font-size: 40px;">温馨提示</h3>
              <p class="text-base sm:text-lg text-surface-600 font-semibold mb-4" style="color: #f91a01; font-size: 40px;">首次排号请先扫描二维码</p>
              <p class="text-base sm:text-lg text-surface-600 font-semibold" style="color: #f91a01; font-size: 40px;">关注小程序</p>
            </div>
            <!-- 动态指向二维码的箭头 -->
            <div class="ml-4 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="w-32 sm:w-40 h-32 sm:h-40 bg-gray-100 rounded-lg flex items-center justify-center">
            <!-- 小程序二维码示例图 -->
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com&margin=2" alt="小程序二维码" class="w-28 h-28 object-contain" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部信息 -->
    <div class="mt-[-20px] sm:mt-0 text-center text-xs text-surface-400 pb-4 sm:pb-6 px-4">
      © 2026 公开见客排号系统 | 版本 1.0.0
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const form = ref({
  room: ''
})

const showNumKeyboard = ref(false)
const showHwKeyboard = ref(false)
const selectedRoomId = ref(null)
const qrcodeUrl = ref('')
const router = useRouter()
const route = useRoute()

const showMessage = ref(false)
const message = ref('')

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

// 确保全局内存存储存在
if (!window.__meetingRoomsStore) {
  window.__meetingRoomsStore = []
}

// 响应式数据
const meetingRooms = ref(window.__meetingRoomsStore)

// 获取已启用的洽谈室
const activeRooms = computed(() => {
  console.log('All rooms:', meetingRooms.value)
  const active = meetingRooms.value.filter(room => room.status === 'occupied')
  console.log('Active rooms:', active)
  return active
})


// 在组件挂载时检查路由
onMounted(() => {
  // 如果是直接访问 /queue/self/vertical 页面，重置状态
  resetStateByRoute()
})

// 监听路由变化
watch(() => route.path, () => {
  // 当路由路径变化时，根据路径重置状态
  resetStateByRoute()
})

// 手动刷新洽谈室列表
const refreshRooms = () => {
  console.log('手动刷新洽谈室列表')
  try {
    if (window.__meetingRoomsStore) {
      // 使用 splice 方法更新数据，确保 Vue 能够正确检测到变化
      meetingRooms.value.splice(0, meetingRooms.value.length, ...window.__meetingRoomsStore)
      console.log('刷新后的数据:', meetingRooms.value)
      showCustomMessage('洽谈室列表已刷新')
    }
  } catch (e) {
    console.error('Error refreshing meetingRooms:', e)
    showCustomMessage('刷新失败，请重试')
  }
}

// 定时刷新洽谈室数据
onMounted(() => {
  setInterval(() => {
    // 从全局内存存储中读取数据
    console.log('自动刷新洽谈室数据')
    try {
      if (window.__meetingRoomsStore) {
        // 使用 splice 方法更新数据，确保 Vue 能够正确检测到变化
        meetingRooms.value.splice(0, meetingRooms.value.length, ...window.__meetingRoomsStore)
        console.log('刷新后的数据:', meetingRooms.value)
      }
    } catch (e) {
      console.error('Error refreshing meetingRooms:', e)
    }
  }, 2000) // 2秒刷新一次
})

// 根据路由路径重置状态
const resetStateByRoute = () => {
  // 如果是直接访问 /queue/self/vertical 页面，重置状态
  if (route.path === '/queue/self/vertical') {
    selectedRoomId.value = null
    form.value.room = ''
    qrcodeUrl.value = ''
  }
}

const hasSelectedRoom = computed(() => {
  return selectedRoomId.value !== null
})

const selectedRoom = computed(() => {
  return activeRooms.value.find(room => room.id === selectedRoomId.value)
})

// 关闭所有键盘
const closeKeyboards = () => {
  showNumKeyboard.value = false
  showHwKeyboard.value = false
}

const queueList = ref([
  { id: 1, number: 'A-018', customerName: '张三', phone: '13800138001', company: '腾讯科技', waitingTime: '5分钟', status: 'processing' },
  { id: 2, number: 'A-019', customerName: '李四', phone: '13900139002', company: '阿里巴巴', waitingTime: '10分钟', status: 'waiting' },
  { id: 3, number: 'A-020', customerName: '王五', phone: '13700137003', company: '百度在线', waitingTime: '15分钟', status: 'waiting' },
  { id: 4, number: 'A-021', customerName: '赵六', phone: '13600136004', company: '字节跳动', waitingTime: '20分钟', status: 'waiting' }
])



const addNumber = (num) => {
  if (form.value.phone.length < 11) {
    form.value.phone += num
  }
}

const deleteNumber = () => {
  form.value.phone = form.value.phone.slice(0, -1)
}

const addChar = (char) => {
  form.value.company += char
}

const deleteChar = () => {
  form.value.company = form.value.company.slice(0, -1)
}

const selectRoom = (roomName) => {
  form.value.room = roomName
  const selectedRoom = activeRooms.value.find(room => room.name === roomName)
  if (selectedRoom) {
    selectedRoomId.value = selectedRoom.id
    // 跳转到新页面
    router.push('/queue/self/vertical/new')
  }
}

const resetSelectedRoom = () => {
  selectedRoomId.value = null
}

const generateQRCode = () => {
  if (!form.value.room) {
    alert('请选择洽谈室')
    return
  }
  
  const ticketNumber = generateTicketNumber()
  const ticket = {
    number: ticketNumber,
    room: form.value.room,
    createTime: new Date().toLocaleString()
  }
  
  // 使用 QRServer API 生成二维码
  const qrData = JSON.stringify(ticket)
  const encodedData = encodeURIComponent(qrData)
  qrcodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&margin=2`
  
  console.log('生成排号二维码:', ticket)
  console.log('二维码URL:', qrcodeUrl.value)
}

const goBack = () => {
  // 返回到上一页
  console.log('点击返回按钮')
  // 尝试使用 window.location.replace 跳转到首页
  window.location.replace('/') 
}



const printTicket = () => {
  if (!form.value.room) {
    alert('请选择洽谈室')
    return
  }
  
  const ticketNumber = generateTicketNumber()
  const ticket = {
    number: ticketNumber,
    room: form.value.room,
    createTime: new Date().toLocaleString()
  }
  
  console.log('打印排号票:', ticket)
  alert(`排号成功！\n排号号码: ${ticketNumber}\n洽谈室: ${form.value.room}`)
  
  // 重置表单
  form.value = {
    room: ''
  }
  showNumKeyboard.value = false
  showHwKeyboard.value = false
}

const generateTicketNumber = () => {
  const prefix = 'A'
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${randomNum}`
}
</script>

<style scoped>
/* 键盘样式 */
#num-keyboard, #hw-keyboard {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.keyboard-key {
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.keyboard-key:hover {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .card {
    padding: 0.75rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  .badge {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
  }
  
  .text-sm {
    font-size: 0.875rem;
  }
  
  .text-xs {
    font-size: 0.75rem;
  }
}
/* 选中状态的洽谈室卡片样式 */
.selected-room {
  border: 2px solid #3b82f6 !important;
  background: #dbeafe !important;
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3) !important;
  transform: scale(1.05) !important;
  transition: all 0.3s ease !important;
  z-index: 10 !important;
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