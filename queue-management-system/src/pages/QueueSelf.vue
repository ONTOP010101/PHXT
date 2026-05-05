<template>
  <div id="page-queue-self" class="slide-in">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-surface-900">自助排号管理</h2>
        <p class="text-sm text-surface-400 mt-1">客户自助排号操作与队列实时管理</p>
      </div>
    </div>
    
    <div class="mb-6">
      <h3 class="font-semibold text-surface-800 mb-3">已开启洽谈室</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="room in publicRooms" :key="room.id" class="card w-full p-6 sm:p-8 md:p-10 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] cursor-pointer transition-all duration-200 hover:shadow-lg relative" :class="{ 'border-2 border-primary-600 shadow-md': form.room === room.name }" @click="selectRoom(room.name)" :style="{ backgroundColor: form.room === room.name ? '#dbeafe' : 'white' }">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h4 class="font-semibold text-surface-800 text-lg sm:text-xl md:text-2xl">{{ room.name }}</h4>
            <div class="flex gap-2">
              <span class="badge badge-blue text-sm sm:text-base py-1 sm:py-2 px-3 sm:px-4">公开</span>
              <span class="badge badge-green text-sm sm:text-base py-1 sm:py-2 px-3 sm:px-4">启用</span>
            </div>
          </div>
          <div class="text-base sm:text-lg md:text-xl text-surface-600 space-y-2 sm:space-y-3 md:space-y-4">
            <div v-if="room.companyName"><span class="text-surface-400">公司名称：</span>{{ room.companyName }}</div>
            <div v-if="room.visitRequirement && room.visitRequirement.trim()"><span class="text-surface-400">见客要求：</span>{{ room.visitRequirement }}</div>
          </div>
        </div>
        
        <div v-if="privateRooms.length > 0" class="card w-full p-6 sm:p-8 md:p-10 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] cursor-pointer transition-all duration-200 hover:shadow-lg relative" :class="{ 'border-2 border-primary-600 shadow-md': form.room === 'other' }" @click="selectRoom('other')" :style="{ backgroundColor: form.room === 'other' ? '#dbeafe' : '#fef3c7' }">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h4 class="font-semibold text-surface-800 text-lg sm:text-xl md:text-2xl">其他</h4>
            <div class="flex gap-2">
              <span class="badge badge-yellow text-sm sm:text-base py-1 sm:py-2 px-3 sm:px-4">专点</span>
              <span class="badge badge-green text-sm sm:text-base py-1 sm:py-2 px-3 sm:px-4">启用</span>
            </div>
          </div>
          <div class="text-base sm:text-lg md:text-xl text-surface-400 space-y-2 sm:space-y-3 md:space-y-4">
            <div>专点排号洽谈室</div>
            <div class="text-sm text-surface-500 mt-2">
              <span v-for="(room, index) in privateRooms" :key="room.id">
                {{ room.name }}<span v-if="index < privateRooms.length - 1">、</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-5">
      <div class="col-span-1">
        <div class="card w-full p-4 sm:p-6">
          <h3 class="font-semibold text-surface-800 mb-4 sm:mb-5 flex items-center gap-2">
            <i data-lucide="ticket" class="w-4 sm:w-5 h-4 sm:h-5 text-primary-600"></i> 排号登记
          </h3>
          <div class="space-y-3 sm:space-y-4">
            <div>
              <label class="form-label">选择洽谈室</label>
              <select id="self-room" class="form-input form-select" v-model="form.room">
                <option value="">请选择洽谈室</option>
                <option v-for="room in publicRooms" :key="room.id" :value="room.name">{{ room.name }}</option>
                <option v-if="privateRooms.length > 0" value="other">其他 (专点)</option>
              </select>
            </div>
            <div>
              <label class="form-label">厂商手机号</label>
              <input id="self-phone" type="text" placeholder="请输入手机号" class="form-input" v-model="form.phone" />
            </div>
            <div>
              <label class="form-label">厂商名称</label>
              <input id="self-company" type="text" placeholder="请输入厂商名称" class="form-input" v-model="form.company" />
            </div>
            <button id="print-ticket-btn" class="btn btn-primary w-full justify-center py-2 sm:py-3" @click.stop="printTicket">
              <i data-lucide="printer" class="w-4 sm:w-5 h-4 sm:h-5"></i> 排号打印
            </button>
            
            <div class="pt-3 border-t border-surface-200">
              <div class="text-xs text-surface-400 mb-2">调试工具</div>
              <div class="grid grid-cols-2 gap-2">
                <button class="btn btn-outline justify-center py-2" @click.stop="quickTestPrintPublic">
                  <i data-lucide="zap" class="w-4 h-4"></i> 公开见客预览
                </button>
                <button class="btn btn-outline justify-center py-2" @click.stop="quickTestPrintPrivate">
                  <i data-lucide="zap" class="w-4 h-4"></i> 专点见客预览
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { getMeetingList } from '../api/meeting'
import { getQueueList, updateQueue, addQueue, requeue } from '../api/queue'
import { getCompanyList, addCompany } from '../api/company'
import { printTicket as sendPrintRequest } from '../api/print'

const form = ref({
  room: '',
  phone: '',
  company: ''
})

const showNumKeyboard = ref(false)
const showHwKeyboard = ref(false)
const selectedRoomId = ref('')

const showMessage = ref(false)
const message = ref('')

const meetingRooms = ref([])
const queueList = ref([])
const companyList = ref([])

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const loadMeetingRooms = async () => {
  try {
    const res = await getMeetingList()
    if (res.code === 200 && res.data) {
      meetingRooms.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载洽谈室失败:', error)
  }
}

const loadQueueList = async () => {
  try {
    const res = await getQueueList({ pageSize: 1000 })
    if (res.code === 200 && res.data) {
      queueList.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载排号列表失败:', error)
  }
}

const loadCompanyList = async () => {
  try {
    const res = await getCompanyList({ pageSize: 1000 })
    if (res.code === 200 && res.data) {
      companyList.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载厂商列表失败:', error)
  }
}

const publicRooms = computed(() => {
  return meetingRooms.value.filter(room => room.status === 'occupied' && room.type !== 'private')
})

const privateRooms = computed(() => {
  return meetingRooms.value.filter(room => room.status === 'occupied' && room.type === 'private')
})

const activeRooms = computed(() => {
  return meetingRooms.value.filter(room => room.status === 'occupied')
})

const isValidPhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

const printTicket = async () => {
  if (!form.value.room) {
    showCustomMessage('请选择洽谈室')
    return
  }

  if (!form.value.company || !form.value.phone) {
    showCustomMessage('请填写厂商名称和手机号')
    return
  }

  const phone = form.value.phone.trim()
  if (!isValidPhone(phone)) {
    showCustomMessage('请输入正确的11位手机号')
    return
  }

  const companyName = form.value.company.trim()
  const isPublicRoom = form.value.room !== 'other'

  try {
    if (isPublicRoom) {
      const selectedRoom = activeRooms.value.find(room => room.name === form.value.room)
      if (!selectedRoom) {
        showCustomMessage('未找到对应的洽谈室')
        return
      }

      const matchedCompany = companyList.value.find(c =>
        c.companyName.trim() === companyName && c.phone.trim() === phone
      )

      let companyId = matchedCompany ? matchedCompany.id : null

      if (!matchedCompany) {
        const companyRes = await addCompany({ companyName, phone })
        if (companyRes.code === 200 && companyRes.data) {
          companyId = companyRes.data.id
        } else {
          showCustomMessage('创建厂商信息失败')
          return
        }
      }

      const existingQueue = queueList.value.find(q =>
        q.companyId === companyId &&
        q.roomId === selectedRoom.id &&
        !q.completed &&
        q.status !== 'cancelled'
      )

      if (existingQueue) {
        if (existingQueue.queueNumber && existingQueue.status !== 'called' && existingQueue.status !== 'completed') {
          const itemNumber = matchedCompany ? (matchedCompany.itemNumber || '') : ''
          showCustomMessage(`您已排号 ${existingQueue.queueNumber}，无需再次排号`)
          printQueueTicket(selectedRoom.name, existingQueue.queueNumber, companyName, false, itemNumber)
          form.value = { room: '', phone: '', company: '' }
          return
        }

        if (existingQueue.status === 'called') {
          const requeueRes = await requeue(existingQueue.id)

          if (requeueRes.code === 200 && requeueRes.data) {
            const newQueueNumber = requeueRes.data.queueNumber
            const itemNumber = matchedCompany ? (matchedCompany.itemNumber || '') : ''
            showCustomMessage(`过号重排成功！\n排号：${newQueueNumber}\n厂商：${companyName}`)
            printQueueTicket(selectedRoom.name, newQueueNumber, companyName, false, itemNumber)
          } else {
            showCustomMessage(requeueRes.message || '过号重排失败')
          }
          await loadQueueList()
          form.value = { room: '', phone: '', company: '' }
          return
        }

        if (!existingQueue.queueNumber) {
          const queueRes = await addQueue({
            companyId,
            roomId: selectedRoom.id
          })
          if (queueRes.code === 200 && queueRes.data) {
            const newQueueNumber = queueRes.data.queueNumber
            const itemNumber = matchedCompany ? (matchedCompany.itemNumber || '') : ''
            showCustomMessage(`排号成功！\n排号：${newQueueNumber}\n厂商：${companyName}`)
            printQueueTicket(selectedRoom.name, newQueueNumber, companyName, false, itemNumber)
          } else {
            showCustomMessage(queueRes.message || '排号失败')
          }
          await loadQueueList()
          form.value = { room: '', phone: '', company: '' }
          return
        }
      }

      const queueRes = await addQueue({
        companyId,
        roomId: selectedRoom.id
      })

      if (queueRes.code === 200 && queueRes.data) {
        const newQueueNumber = queueRes.data.queueNumber
        const itemNumber = matchedCompany ? (matchedCompany.itemNumber || '') : ''
        showCustomMessage(`排号成功！\n排号：${newQueueNumber}\n厂商：${companyName}`)
        printQueueTicket(selectedRoom.name, newQueueNumber, companyName, false, itemNumber)
      } else {
        showCustomMessage(queueRes.message || '排号失败')
      }

      await loadQueueList()
      await loadCompanyList()

    } else {
      const privateRoomIds = privateRooms.value.map(room => room.id)

      const matchedCompany = companyList.value.find(c =>
        c.companyName.trim() === companyName && c.phone.trim() === phone
      )

      if (!matchedCompany) {
        showCustomMessage('未找到该厂商，请先在专点管理预约添加')
        return
      }

      const matchedQueues = queueList.value.filter(q =>
        q.companyId === matchedCompany.id &&
        privateRoomIds.includes(q.roomId)
      )

      if (matchedQueues.length === 0) {
        showCustomMessage('未找到该厂商的排号记录，专点见客需先在管理端添加')
        return
      }

      const successResults = []
      const failResults = []

      for (const matchedQueue of matchedQueues) {
        const actualRoom = meetingRooms.value.find(r => r.id === matchedQueue.roomId)
        const actualRoomName = actualRoom ? actualRoom.name : `洽谈室${matchedQueue.roomId}`

        if (matchedQueue.completed) {
          failResults.push(`${actualRoomName}：已完成洽谈`)
          continue
        }

        if (matchedQueue.queueNumber && matchedQueue.status !== 'called' && matchedQueue.status !== 'completed') {
          failResults.push(`${actualRoomName}：您已排号完成，无需再次排号`)
          continue
        }

        try {
          const requeueRes = await requeue(matchedQueue.id)
          if (requeueRes.code === 200 && requeueRes.data) {
            successResults.push({ roomName: actualRoomName, queueNumber: requeueRes.data.queueNumber })
          } else {
            failResults.push(`${actualRoomName}：${requeueRes.message || '重排失败'}`)
          }
        } catch (error) {
          failResults.push(`${actualRoomName}：重排失败`)
        }
      }

      let msg = `排号完成！\n厂商：${companyName}\n`
      if (successResults.length > 0) {
        msg += `成功排号：\n${successResults.map(r => `${r.roomName}：${r.queueNumber}`).join('\n')}\n`
      }
      if (failResults.length > 0) {
        msg += `未排号：\n${failResults.join('\n')}`
      }
      showCustomMessage(msg)

      if (successResults.length > 0) {
        const itemNumber = matchedCompany.itemNumber || ''
        for (const result of successResults) {
          printQueueTicket(result.roomName, result.queueNumber, companyName, true, itemNumber)
        }
      }

      await loadQueueList()
    }
  } catch (error) {
    console.error('排号失败:', error)
    showCustomMessage(error.message || '排号失败')
  }

  form.value = {
    room: '',
    phone: '',
    company: ''
  }
  showNumKeyboard.value = false
  showHwKeyboard.value = false
}

const printQueueTicket = async (roomName, queueNumber, companyName, isPrivate = false, itemNumber = '') => {
  try {
    const roomNumber = parseInt(roomName.replace(/\D/g, ''))
    const floor = roomNumber >= 1 && roomNumber <= 23 ? '3楼' : '2楼'
    const displayRoomName = `${floor}${roomNumber}号室`
    const numberPart = queueNumber.includes('_') ? queueNumber.split('_')[1] : queueNumber
    const displayNumber = `${roomNumber}_${numberPart}`
    const typeText = isPrivate ? '专点见客' : '公开见客'
    
    const room = meetingRooms.value.find(r => r.name === roomName || 
      (r.name.includes('号') && parseInt(r.name.replace(/\D/g, '')) === roomNumber))
    const roomCompanyName = room && room.companyName ? room.companyName : companyName
    const roomQuotePoints = room && room.quotePoints ? room.quotePoints : '100'
    const printer = 'GP-C80 Series'
    const scale = 1
    const paperWidth = 800
    const now = new Date()
    const printTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    console.log('准备打印:', { roomName, queueNumber, displayNumber, companyName })
    console.log('window.LODOP:', typeof window.LODOP !== 'undefined')

    if (typeof window.LODOP !== 'undefined') {
      console.log('使用C-Lodop打印')
      LODOP.PRINT_INIT('排号票打印')
      LODOP.SET_PRINTER_INDEX(printer)
      LODOP.SET_PRINT_PAGESIZE(1, paperWidth, 2100, '')
      
      LODOP.SET_PRINT_MODE('PREVIEW_IN_BROWSE', 0)
      LODOP.SET_PRINT_MODE('CATCH_PRINT_STATUS', 0)
      
      LODOP.ADD_PRINT_TEXT(20, 0, 270, 50, '新悦翔玩具展馆')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 18)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
      
      LODOP.ADD_PRINT_TEXT(80, 0, 270, 45, displayRoomName)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
      
      LODOP.ADD_PRINT_TEXT(130, 0, 270, 45, typeText)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
      
      LODOP.ADD_PRINT_TEXT(180, 20, paperWidth - 40, 30, '----------------------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 9)
      
      LODOP.ADD_PRINT_TEXT(230, 30, 130, 40, '客户名称:')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(230, 170, paperWidth - 200, 40, roomCompanyName)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(285, 30, 130, 40, '厂商名称：')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(285, 170, paperWidth - 200, 40, companyName)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
      
      LODOP.ADD_PRINT_TEXT(340, 30, 130, 40, '排号:')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(340, 170, paperWidth - 200, 40, displayNumber)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 20)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
      
      const itemNumbers = (itemNumber && itemNumber.trim() !== '') ? itemNumber.split(',').map(n => n.trim()).filter(n => n) : []
      
      if (itemNumbers.length > 0) {
        LODOP.ADD_PRINT_TEXT(395, 30, 130, 40, '货号:')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        
        itemNumbers.forEach((num, idx) => {
          LODOP.ADD_PRINT_TEXT(395 + idx * 25, 170, paperWidth - 200, 30, num)
          LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
          LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
        })
      }
      
      const itemHeight = itemNumbers.length > 0 ? itemNumbers.length * 25 : 0
      const baseY = 395 + (itemNumbers.length > 0 ? 30 + itemHeight : 0)
      const sepY = baseY + 15
      const tipY = sepY + 40
      const tip1Y = tipY + 40
      const tip2Y = tip1Y + 45
      const orderY = tip2Y + 40
      const timeY = orderY + 20
      
      LODOP.ADD_PRINT_TEXT(sepY, 20, paperWidth - 40, 30, '----------------------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 9)
      
      LODOP.ADD_PRINT_TEXT(tipY, 30, paperWidth - 60, 30, '温馨提示:')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(tip1Y, 10, paperWidth - 60, 30, '1. 过号重排(过号排序于当前洽谈号的三个正排号后)')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
      LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
      
      LODOP.ADD_PRINT_TEXT(tip2Y, 10, paperWidth - 60, 30, '2. 洽谈如需留样，若不能留样请告知公司')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
      LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
      
      const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const orderInfo = `${datePart}-${displayNumber}-${roomQuotePoints}`
      LODOP.ADD_PRINT_TEXT(orderY, 60, paperWidth - 120, 30, orderInfo)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(timeY, 60, paperWidth, 40, printTime)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Align', 2)
      
      console.log('发送打印命令')
      LODOP.PRINT()
      console.log('C-Lodop 打印成功')
    } else {
      console.error('C-Lodop 未加载！请确保C-Lodop已安装并运行在 localhost:8000')
      showCustomMessage('请先安装C-Lodop打印控件！请检查 http://localhost:8000 是否可访问')
    }
  } catch (e) {
    console.error('打印请求失败:', e)
    showCustomMessage('打印请求失败: ' + e.message)
  }
}

const quickTestPrintPublic = () => {
  previewQueueTicket('1号洽谈室', '001', '测试客户', false)
}

const quickTestPrintPrivate = () => {
  previewQueueTicket('1号洽谈室', '001', '测试客户', true, 'ABC123')
}

const previewQueueTicket = (roomName, queueNumber, companyName, isPrivate = false, itemNumber = '') => {
  try {
    const roomNumber = parseInt(roomName.replace(/\D/g, ''))
    const floor = roomNumber >= 1 && roomNumber <= 23 ? '3楼' : '2楼'
    const displayRoomName = `${floor}${roomNumber}号室`
    const numberPart = queueNumber.includes('_') ? queueNumber.split('_')[1] : queueNumber
    const displayNumber = `${roomNumber}_${numberPart}`
    const typeText = isPrivate ? '专点见客' : '公开见客'
    
    const room = meetingRooms.value.find(r => r.name === roomName || 
      (r.name.includes('号') && parseInt(r.name.replace(/\D/g, '')) === roomNumber))
    const roomCompanyName = room && room.companyName ? room.companyName : companyName
    const roomQuotePoints = room && room.quotePoints ? room.quotePoints : '100'
    const printer = 'GP-C80 Series'
    const scale = 1
    const paperWidth = 800
    const now = new Date()
    const printTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    console.log('准备预览:', { roomName, queueNumber, displayNumber, companyName })
    console.log('window.LODOP:', typeof window.LODOP !== 'undefined')

    if (typeof window.LODOP !== 'undefined') {
      console.log('使用C-Lodop预览')
      LODOP.PRINT_INIT('排号票打印预览')
      LODOP.SET_PRINTER_INDEX(printer)
      LODOP.SET_PRINT_PAGESIZE(1, paperWidth, 2100, '')
      
      LODOP.SET_PRINT_MODE('PREVIEW_IN_BROWSE', 0)
      LODOP.SET_PRINT_MODE('CATCH_PRINT_STATUS', 0)
      
      LODOP.ADD_PRINT_TEXT(20, 0, 270, 50, '新悦翔玩具展馆')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 18)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
      
      LODOP.ADD_PRINT_TEXT(80, 0, 270, 45, displayRoomName)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
      
      LODOP.ADD_PRINT_TEXT(130, 0, 270, 45, typeText)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 16)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
      
      LODOP.ADD_PRINT_TEXT(180, 20, paperWidth - 40, 30, '----------------------------------------')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 9)
      
      LODOP.ADD_PRINT_TEXT(230, 30, 130, 40, '客户名称:')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(230, 170, paperWidth - 200, 40, roomCompanyName)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(285, 30, 130, 40, '厂商名称：')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(285, 170, paperWidth - 200, 40, companyName)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
      
      LODOP.ADD_PRINT_TEXT(340, 30, 130, 40, '排号:')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      
      LODOP.ADD_PRINT_TEXT(340, 170, paperWidth - 200, 40, displayNumber)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 20)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
      
      if (itemNumber && itemNumber.trim() !== '') {
        LODOP.ADD_PRINT_TEXT(395, 30, 130, 40, '货号:')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        
        LODOP.ADD_PRINT_TEXT(395, 170, paperWidth - 200, 40, itemNumber)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 13)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
        
        LODOP.ADD_PRINT_TEXT(490, 20, paperWidth - 40, 30, '----------------------------------------')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 9)
        
        LODOP.ADD_PRINT_TEXT(530, 30, paperWidth - 60, 30, '温馨提示:')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        
        LODOP.ADD_PRINT_TEXT(570, 10, paperWidth - 60, 30, '1. 过号重排(过号排序于当前洽谈号的三个正排号后)')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
        LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
        
        LODOP.ADD_PRINT_TEXT(615, 10, paperWidth - 60, 30, '2. 洽谈如需留样，若不能留样请告知公司')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
        LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
        
        const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const orderInfo = `${datePart}-${displayNumber}-${roomQuotePoints}`
        LODOP.ADD_PRINT_TEXT(655, 60, paperWidth - 120, 30, orderInfo)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        
        LODOP.ADD_PRINT_TEXT(675, 60, paperWidth, 40, printTime)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        LODOP.SET_PRINT_STYLEA(0, 'Align', 2)
      } else {
        LODOP.ADD_PRINT_TEXT(450, 20, paperWidth - 40, 30, '----------------------------------------')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 9)
        
        LODOP.ADD_PRINT_TEXT(490, 30, paperWidth - 60, 30, '温馨提示:')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        
        LODOP.ADD_PRINT_TEXT(530, 10, paperWidth - 60, 30, '1. 过号重排(过号排序于当前洽谈号的三个正排号后)')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
        LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
        
        LODOP.ADD_PRINT_TEXT(575, 10, paperWidth - 60, 30, '2. 洽谈如需留样，若不能留样请告知公司')
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 0.5)
        LODOP.SET_PRINT_STYLEA(0, 'Color', '#000000')
        
        const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const orderInfo = `${datePart}-${displayNumber}-${roomQuotePoints}`
        LODOP.ADD_PRINT_TEXT(615, 60, paperWidth - 120, 30, orderInfo)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        
        LODOP.ADD_PRINT_TEXT(635, 60, paperWidth, 40, printTime)
        LODOP.SET_PRINT_STYLEA(0, 'FontSize', 12)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        LODOP.SET_PRINT_STYLEA(0, 'Align', 2)
      }
      
      console.log('打开预览窗口')
      LODOP.PREVIEW()
      console.log('C-Lodop 预览打开成功')
    } else {
      console.error('C-Lodop 未加载！请确保C-Lodop已安装并运行在 localhost:8000')
      showCustomMessage('请先安装C-Lodop打印控件！请检查 http://localhost:8000 是否可访问')
    }
  } catch (e) {
    console.error('预览失败:', e)
    showCustomMessage('预览失败: ' + e.message)
  }
}

const quickTestPreview = () => {
  previewQueueTicket('1号洽谈室', '001', '测试客户')
}

const selectRoom = (roomName) => {
  form.value.room = roomName
  if (roomName === 'other') {
    return
  }
  const selectedRoom = activeRooms.value.find(room => room.name === roomName)
  if (selectedRoom) {
    selectedRoomId.value = selectedRoom.id
  }
}

let refreshInterval = null

onMounted(async () => {
  await loadMeetingRooms()
  await loadQueueList()
  await loadCompanyList()
  
  refreshInterval = setInterval(async () => {
    await loadMeetingRooms()
    await loadQueueList()
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
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
  white-space: pre-wrap;
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

<style>
.vertical-layout-active .sidebar {
  display: none !important;
}

.vertical-layout-active header {
  display: none !important;
}

.vertical-layout-active .tabs,
.vertical-layout-active .tab,
.vertical-layout-active .nav-tabs,
.vertical-layout-active .breadcrumb,
.vertical-layout-active .tabs-container,
.vertical-layout-active .tabs-wrapper,
.vertical-layout-active .tab-item {
  display: none !important;
}

.vertical-layout-active main {
  width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  background: linear-gradient(to bottom, #eff6ff, #ffffff) !important;
  display: block !important;
}

.vertical-layout-active #page-queue-self.vertical-layout {
  max-width: calc(100vw - 50px) !important;
  min-height: 100vh;
  width: calc(100vw - 50px) !important;
  height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  box-shadow: none;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #eff6ff, #ffffff) !important;
}

.vertical-layout-active {
  overflow-x: hidden !important;
  width: 100vw !important;
  max-width: 100vw !important;
  background: linear-gradient(to bottom, #eff6ff, #ffffff) !important;
}

.vertical-layout-active html,
.vertical-layout-active body {
  overflow-x: hidden !important;
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  background: linear-gradient(to bottom, #eff6ff, #ffffff) !important;
}

.vertical-layout-active * {
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.vertical-layout-active main {
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  background: linear-gradient(to bottom, #eff6ff, #ffffff) !important;
}

.vertical-layout-active #page-queue-self {
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  background: linear-gradient(to bottom, #eff6ff, #ffffff) !important;
}

.vertical-layout-active .vertical-layout .grid {
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 16px !important;
}

.vertical-layout-active .vertical-layout .card {
  margin-bottom: 16px !important;
  padding: 16px !important;
  box-sizing: border-box;
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  transition: all 0.3s ease !important;
}

.vertical-layout-active .vertical-layout .form-input {
  width: 100% !important;
  box-sizing: border-box;
  padding: 14px 16px !important;
  font-size: 16px !important;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  transition: all 0.2s ease !important;
}

.vertical-layout-active .vertical-layout .form-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  outline: none !important;
}

.vertical-layout-active .vertical-layout .btn {
  width: 100% !important;
  box-sizing: border-box;
  font-size: 16px !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  padding: 14px 20px !important;
}

.vertical-layout-active .vertical-layout .btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
}

.vertical-layout-active .vertical-layout .btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4) !important;
  transform: translateY(-2px) !important;
}

.vertical-layout-active .vertical-layout h2 {
  font-size: 24px !important;
  font-weight: bold !important;
  color: #1e40af !important;
}

.vertical-layout-active .vertical-layout h3 {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
}

.vertical-layout-active .vertical-layout h4 {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
}

.vertical-layout-active .vertical-layout .badge {
  border-radius: 100px !important;
  padding: 4px 12px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
}

.vertical-layout-active .vertical-layout .badge-green {
  background: #dcfce7 !important;
  color: #16a34a !important;
}

.vertical-layout-active .vertical-layout .badge-orange {
  background: #ffedd5 !important;
  color: #ea580c !important;
}

.vertical-layout-active .vertical-layout .badge-blue {
  background: #dbeafe !important;
  color: #2563eb !important;
}

.vertical-layout-active .vertical-layout .card.selected-room {
  border: 2px solid #3b82f6 !important;
  background: #dbeafe !important;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2) !important;
  transform: scale(1.02) !important;
  transition: all 0.3s ease !important;
}
</style>

<style scoped>
.vertical-layout {
  max-width: 1080px;
  min-height: 1920px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.vertical-layout .grid {
  grid-template-columns: 1fr !important;
}

.vertical-layout .card {
  margin-bottom: 20px;
}
</style>
