<template>
  <div id="page-business-public" class="slide-in h-screen flex flex-col overflow-hidden">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    <div class="card p-4 mx-4 mb-4 flex-shrink-0" style="height: 200px;">
      <div class="text-sm text-surface-400 mb-2">已开启洽谈室:</div>
      <div class="flex flex-wrap gap-2 h-[calc(100%-24px)] overflow-y-auto">
        <div
          v-for="room in publicRooms"
          :key="room.id"
          class="rounded-lg m-[5px] cursor-pointer transition-all h-[calc(100%-10px)] flex-1 min-w-[200px] max-w-[300px] relative"
          :class="selectedRoom === room.name ? 'bg-primary-600 text-white' : 'bg-primary-50 hover:bg-primary-100'"
          @click="selectRoom(room.name)"
        >
          <div class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium" :class="selectedRoom === room.name ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'">
            公开
          </div>
          <div class="h-full flex flex-col items-center justify-center px-3 py-2 text-center">
            <div class="font-bold text-base md:text-lg" :class="selectedRoom === room.name ? 'text-white' : 'text-surface-800'">{{ room.name }}</div>
            <div v-if="room.companyName" class="text-xs md:text-sm mt-1.5 truncate max-w-full" :class="selectedRoom === room.name ? 'text-white/90' : 'text-surface-600'">{{ room.companyName }}</div>
            <div class="text-xs md:text-sm mt-1.5" :class="selectedRoom === room.name ? 'text-white/80' : 'text-surface-500'">
              当前叫号: {{ getRoomCallInfo(room.name).current || '-' }}
            </div>
          </div>
        </div>
        <div v-if="publicRooms.length === 0" class="col-span-3 text-center text-surface-400 py-8">
          暂无已开启的公开见客洽谈室
        </div>
      </div>
    </div>

    <div class="card p-4 mx-4 mb-4 flex-shrink-0">
      <div class="flex flex-row items-center gap-3 flex-nowrap" style="flex-wrap: nowrap;">
        <input type="text" v-model="searchKeyword" placeholder="搜索厂商名称..." class="form-input" style="width: 150px; flex-shrink: 0;" />
        <button class="btn btn-danger text-sm" style="white-space: nowrap;" @click="handleDelete">删除</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #f97316; color: #ea580c;" @click="handleRequeue">重排</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #3b82f6; color: #2563eb;" @click="checkQueuedNotCompleted">勾选已排号未完成</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #10b981; color: #059669;" @click="checkNotQueued">勾选未排号</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #8b5cf6; color: #7c3aed;" @click="exportTable">导出表格</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #ef4444; color: #dc2626;" @click="clearSelection">清除勾选</button>
        <span class="text-sm text-surface-600" style="white-space: nowrap;">已勾选: {{ selectedIds.size }} 条</span>
        <input type="text" v-model="locateKeyword" placeholder="定位序号/厂商..." class="form-input" style="width: 120px; flex-shrink: 0;" @keyup.enter="locateRow" />
        <button class="btn btn-success text-sm" style="white-space: nowrap;" @click="callNext">开始/下一个</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #f97316; color: #ea580c;" @click="batchCallSelected">多号并叫</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #f59e0b; color: #d97706;" @click="remindCurrent">重新提醒</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap;" @click="handlePause">暂停洽谈</button>
        <button class="btn btn-danger text-sm" style="white-space: nowrap;" @click="handleClose">关闭洽谈</button>
      </div>
    </div>

    <div class="card overflow-hidden mx-4 mb-4 flex flex-col flex-1 min-h-0" style="max-height: calc(100vh - 520px);">
      <div class="flex-1 overflow-y-auto table-scroll-container">
        <table class="w-full" style="text-align: center; border-collapse: collapse;">
          <thead class="sticky top-0 bg-gray-50 z-10">
            <tr style="border-bottom: 2px solid #e5e7eb; background-color: #f9fafb;">
              <th style="border-right: 1px solid #e5e7eb; padding: 12px; width: 50px;">
                <input type="checkbox" class="checkbox" :checked="isAllSelected" @change="toggleAllSelect" />
              </th>
              <th style="border-right: 1px solid #e5e7eb; padding: 12px; width: 70px;">序号</th>
              <th style="border-right: 1px solid #e5e7eb; padding: 12px; cursor: pointer;" @click="sortTable('roomNumber')">
                洽谈室号
                <span v-if="sortField === 'roomNumber'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                <span v-else>↕</span>
              </th>
              <th style="border-right: 1px solid #e5e7eb; padding: 12px; cursor: pointer;" @click="sortTable('queueNumber')">
                排号
                <span v-if="sortField === 'queueNumber'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                <span v-else>↕</span>
              </th>
              <th style="border-right: 1px solid #e5e7eb; padding: 12px; cursor: pointer;" @click="sortTable('companyName')">
                厂商名称
                <span v-if="sortField === 'companyName'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                <span v-else>↕</span>
              </th>
              <th style="border-right: 1px solid #e5e7eb; padding: 12px; cursor: pointer;" @click="sortTable('phone')">
                手机号
                <span v-if="sortField === 'phone'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                <span v-else>↕</span>
              </th>
              <th style="padding: 12px; cursor: pointer;" @click="sortTable('completed')">
                是否完成洽谈
                <span v-if="sortField === 'completed'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                <span v-else>↕</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedTableData" :key="item.id" :data-row-index="index" style="border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background-color 0.2s;" :style="getRowStyle(item, index)" @click="selectedRow = index">
              <td style="border-right: 1px solid #e5e7eb; padding: 12px;">
                <input type="checkbox" class="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" />
              </td>
              <td style="border-right: 1px solid #e5e7eb; padding: 12px;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td style="border-right: 1px solid #e5e7eb; padding: 12px;">{{ item.roomNumber }}</td>
              <td style="border-right: 1px solid #e5e7eb; padding: 12px;">{{ item.queueNumber }}</td>
              <td style="border-right: 1px solid #e5e7eb; padding: 12px;">{{ item.companyName }}</td>
              <td style="border-right: 1px solid #e5e7eb; padding: 12px;">{{ item.phone }}</td>
              <td style="padding: 12px;">
                <div class="flex items-center justify-center gap-2">
                  <input type="checkbox" :checked="item.completed" @change="toggleCompleted(index)" style="width: 20px; height: 20px; cursor: pointer;" />
                  <span :class="item.completed ? 'text-red-600' : 'text-orange-500'" style="font-size: 14px;">{{ item.completed ? '已完成' : '未完成' }}</span>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTableData.length === 0">
              <td colspan="7" style="padding: 40px; text-align: center; color: #9ca3af;">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card p-2 mx-4 mb-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="text-sm text-surface-400">
          共 {{ filteredTableData.length }} 条数据
          <span v-if="selectedRoom" class="text-primary-600 ml-2">({{ selectedRoom }})</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="btn btn-outline text-sm"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            上一页
          </button>
          <span class="text-sm px-3">{{ currentPage }} / {{ totalPages }}</span>
          <button
            class="btn btn-outline text-sm"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAddModal = false">
      <div class="bg-white rounded-lg p-6 w-[400px] shadow-xl">
        <h3 class="text-lg font-bold mb-4 text-surface-800">排号</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-600 mb-1">厂商名称</label>
            <input type="text" v-model="newCompany.companyName" placeholder="请输入厂商名称" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-600 mb-1">手机号</label>
            <input type="text" v-model="newCompany.phone" placeholder="请输入手机号" class="form-input w-full" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button class="btn btn-outline text-sm" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary text-sm" @click="addCustomer">确定</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showDeleteConfirmModal = false">
      <div class="bg-white rounded-lg p-6 w-[400px] shadow-xl">
        <h3 class="text-lg font-bold mb-4 text-surface-800">确认删除</h3>
        <p class="text-sm text-surface-600 mb-2">确定要删除选中的 <span class="text-red-600 font-bold">{{ selectedIds.size }}</span> 条数据吗？</p>
        <p class="text-xs text-surface-400 mb-6">删除后数据将无法恢复，请谨慎操作</p>
        <div class="flex justify-end gap-3">
          <button class="btn btn-outline text-sm" :disabled="deleting" @click="showDeleteConfirmModal = false">取消</button>
          <button class="btn btn-danger text-sm" :disabled="deleting" @click="confirmDelete">{{ deleting ? '删除中...' : '确认删除' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 h-screen" @click="closePasswordModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-xl border border-surface-200" @click.stop>
        <h3 class="text-lg font-semibold mb-4">请输入密码</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">密码</label>
            <input type="password" v-model="passwordInput" class="form-input w-full" placeholder="请输入密码" @keyup.enter="confirmPassword" />
          </div>
        </div>
        <div class="flex gap-3 justify-end mt-6">
          <button class="px-4 py-2 border border-surface-200 rounded-lg text-surface-700 hover:bg-surface-50" @click="closePasswordModal">取消</button>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700" @click="confirmPassword">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMeetingList, pauseMeeting, closeMeeting } from '../api/meeting'
import { addCompany as createCompany } from '../api/company'
import { getQueueList, addQueue, callNextQueue, completeQueue, cancelQueue, requeue, batchCallQueue } from '../api/queue'

const meetingRooms = ref([])
const selectedRoomObj = ref(null)
const selectedRoom = ref('')

const showAddModal = ref(false)
const newCompany = ref({
  companyName: '',
  phone: ''
})

const tableData = ref([])
const selectedRow = ref(-1)
const sortField = ref('roomNumber')
const sortOrder = ref('asc')
const currentPage = ref(1)
const pageSize = ref(1000)
const searchKeyword = ref('')
const locateKeyword = ref('')
const calledNumbers = ref(new Set())
const selectedIds = ref(new Set())

const showMessage = ref(false)
const message = ref('')

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const showPasswordModal = ref(false)
const passwordInput = ref('')
const passwordAction = ref('')

const showDeleteConfirmModal = ref(false)
const deleting = ref(false)

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordInput.value = ''
  passwordAction.value = ''
}

const publicRooms = computed(() => {
  return meetingRooms.value.filter(room => room.type === 'public' && room.status === 'occupied')
})

const isAllSelected = computed(() => {
  return filteredTableData.value.length > 0 &&
         filteredTableData.value.every(item => selectedIds.value.has(item.id))
})

const toggleSelect = (id) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

const toggleAllSelect = (event) => {
  const checked = event.target.checked
  if (checked) {
    filteredTableData.value.forEach(item => {
      selectedIds.value.add(item.id)
    })
  } else {
    selectedIds.value.clear()
  }
  selectedIds.value = new Set(selectedIds.value)
}

const clearSelection = () => {
  selectedIds.value.clear()
  selectedIds.value = new Set(selectedIds.value)
}

const handleDelete = () => {
  if (selectedIds.value.size === 0) {
    showCustomMessage('请先勾选要删除的数据')
    return
  }
  showDeleteConfirmModal.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  let successCount = 0
  let failCount = 0

  const ids = [...selectedIds.value]
  for (const id of ids) {
    try {
      await cancelQueue(id)
      successCount++
    } catch (error) {
      console.error('删除失败:', id, error)
      failCount++
    }
  }

  deleting.value = false
  showDeleteConfirmModal.value = false
  selectedIds.value.clear()
  selectedIds.value = new Set(selectedIds.value)

  let msg = `成功删除${successCount}条数据`
  if (failCount > 0) {
    msg += `，${failCount}条删除失败`
  }
  showCustomMessage(msg)
  await loadTableData()
}

const previewQueueTicket = (roomName, queueNumber, companyName) => {
  try {
    const roomNumber = parseInt(roomName.replace(/\D/g, ''))
    const floor = roomNumber >= 1 && roomNumber <= 23 ? '3楼' : '2楼'
    const displayRoomName = `${floor}${roomNumber}号室`
    const numberPart = queueNumber.includes('_') ? queueNumber.split('_')[1] : queueNumber
    const displayNumber = `${roomNumber}_${numberPart}`
    const typeText = '公开见客'

    const room = meetingRooms.value.find(r => r.name === roomName ||
      (r.name.includes('号') && parseInt(r.name.replace(/\D/g, '')) === roomNumber))
    const roomCompanyName = room && room.companyName ? room.companyName : companyName
    const roomQuotePoints = room && room.quotePoints ? room.quotePoints : '100'
    const printer = 'GP-C80 Series'
    const paperWidth = 800
    const now = new Date()
    const printTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    if (typeof window.LODOP !== 'undefined') {
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

      LODOP.PREVIEW()
    } else {
      showCustomMessage('请先安装C-Lodop打印控件！请检查 http://localhost:8000 是否可访问')
    }
  } catch (e) {
    console.error('预览失败:', e)
    showCustomMessage('预览失败: ' + e.message)
  }
}

const handleRequeue = async () => {
  if (selectedIds.value.size === 0) {
    showCustomMessage('请先勾选要重排的厂商')
    return
  }
  if (selectedIds.value.size > 1) {
    showCustomMessage('每次只能重排一个厂商，请只勾选一条数据')
    return
  }

  const selectedId = [...selectedIds.value][0]
  const item = tableData.value.find(row => row.id === selectedId)
  if (!item) {
    showCustomMessage('未找到选中的数据')
    return
  }

  if (item.completed) {
    showCustomMessage('已完成的厂商无法重排')
    return
  }

  try {
    const res = await requeue(item.id)

    selectedIds.value.clear()
    selectedIds.value = new Set(selectedIds.value)

    showCustomMessage('重排成功')
    await loadTableData()

    const newItem = tableData.value.find(row => row.id === item.id)
    if (newItem && newItem.queueNumber) {
      previewQueueTicket(newItem.roomNumber, newItem.queueNumber, newItem.companyName)
    }
  } catch (error) {
    console.error('重排失败:', error)
    showCustomMessage(error.message || '重排失败')
  }
}

const selectRoom = (roomName) => {
  unlockAudio()
  selectedRoom.value = selectedRoom.value === roomName ? '' : roomName
  if (selectedRoom.value) {
    selectedRoomObj.value = meetingRooms.value.find(room => room.name === roomName)
  } else {
    selectedRoomObj.value = null
  }
  selectedIds.value.clear()
  selectedIds.value = new Set(selectedIds.value)
  currentPage.value = 1
  selectedRow.value = -1

  if (selectedRoom.value) {
    setTimeout(() => {
      scrollToCurrentCalledRow()
    }, 100)
  }
}

const getRoomCallInfo = (roomName) => {
  const roomNum = roomName.replace('号洽谈室', '').replace(/[A-Za-z\s]/g, '')
  const targetRoomNumber = `${roomNum}号洽谈室`

  const roomData = tableData.value.filter(item => item.roomNumber === targetRoomNumber && !item.completed).sort((a, b) => {
    if (!a.queueNumber) return 1
    if (!b.queueNumber) return -1
    const partsA = a.queueNumber.split('_')[1].split('-')
    const partsB = b.queueNumber.split('_')[1].split('-')
    const numA = parseInt(partsA[0])
    const numB = parseInt(partsB[0])
    if (numA !== numB) return numA - numB
    const suffixA = partsA.length > 1 ? parseInt(partsA[1]) : 0
    const suffixB = partsB.length > 1 ? parseInt(partsB[1]) : 0
    return suffixA - suffixB
  })

  const calledIds = new Set(calledNumbers.value)
  const calledList = roomData.filter(item => calledIds.has(item.id))
  const unCalledList = roomData.filter(item => !calledIds.has(item.id))

  let current = '-'
  let next = '-'
  let waitTime = '-'

  if (calledList.length > 0) {
    current = calledList[calledList.length - 1].queueNumber
  }
  if (unCalledList.length > 0) {
    next = unCalledList[0].queueNumber
    const waitingCount = unCalledList.length
    const avgTimePerPerson = 5
    waitTime = `${waitingCount * avgTimePerPerson}分钟`
  } else if (roomData.length > 0) {
    waitTime = '已完成'
  }

  return { current, next, waitTime }
}

const currentCalledNumbers = computed(() => {
  const roomNames = [...new Set(tableData.value.map(item => item.roomNumber))]
  const numbers = new Set()

  roomNames.forEach(roomName => {
    const roomNum = roomName.replace('号洽谈室', '').replace(/[A-Za-z\s]/g, '')
    const targetRoomNumber = `${roomNum}号洽谈室`

    const roomData = tableData.value.filter(item => item.roomNumber === targetRoomNumber && !item.completed).sort((a, b) => {
      if (!a.queueNumber) return 1
      if (!b.queueNumber) return -1
      const partsA = a.queueNumber.split('_')[1].split('-')
      const partsB = b.queueNumber.split('_')[1].split('-')
      const numA = parseInt(partsA[0])
      const numB = parseInt(partsB[0])
      if (numA !== numB) return numA - numB
      const suffixA = partsA.length > 1 ? parseInt(partsA[1]) : 0
      const suffixB = partsB.length > 1 ? parseInt(partsB[1]) : 0
      return suffixA - suffixB
    })

    const calledIds = new Set(calledNumbers.value)
    const calledList = roomData.filter(item => calledIds.has(item.id))

    if (calledList.length > 0) {
      numbers.add(calledList[calledList.length - 1].queueNumber)
    }
  })

  return numbers
})

const getRowStyle = (item, index) => {
  const isCalled = calledNumbers.value.has(item.id)
  const isCurrentCalled = currentCalledNumbers.value.has(item.queueNumber)
  const isSelected = selectedRow.value === index

  let backgroundColor = '#ffffff'
  let color = '#2563eb'

  if (isSelected) {
    backgroundColor = '#dcfce7'
    color = '#000000'
  } else if (item.completed) {
    backgroundColor = '#f3f4f6'
    color = '#dc2626'
  } else if (isCurrentCalled) {
    backgroundColor = '#dbeafe'
    color = '#000000'
  } else if (isCalled) {
    backgroundColor = '#f3f4f6'
    color = '#9ca3af'
  }

  return { backgroundColor, color }
}

const loadRooms = async () => {
  try {
    const res = await getMeetingList()
    if (res.data && res.data.list) {
      meetingRooms.value = res.data.list
    }
  } catch (error) {
    console.error('加载洽谈室失败:', error)
    showCustomMessage('加载洽谈室失败')
  }
}

const loadTableData = async () => {
  try {
    const res = await getQueueList({ pageSize: 1000 })
    if (res.data && res.data.list) {
      const activeList = res.data.list.filter(item => item.status !== 'cancelled')
      tableData.value = activeList.map(item => ({
        id: item.id,
        roomId: item.roomId,
        companyId: item.companyId,
        customerId: item.customerId,
        roomNumber: item.meetingRoom?.name || `${item.roomId}号洽谈室`,
        companyName: item.company?.companyName || item.customer?.companyName || '',
        queueNumber: item.queueNumber,
        phone: item.company?.phone || item.customer?.phone || '',
        completed: item.completed
      }))

      calledNumbers.value = new Set()
      activeList.forEach(item => {
        if (item.status === 'called' || item.status === 'completed') {
          calledNumbers.value.add(item.id)
        }
      })
    }
  } catch (error) {
    console.error('加载排号数据失败:', error)
    showCustomMessage('加载排号数据失败')
  }
}

const addCustomer = async () => {
  if (!newCompany.value.companyName || !newCompany.value.phone) {
    showCustomMessage('请填写完整信息')
    return
  }

  if (!selectedRoom.value || !selectedRoomObj.value) {
    showCustomMessage('请先选择洽谈室')
    return
  }

  try {
    const companyRes = await createCompany({
      companyName: newCompany.value.companyName,
      phone: newCompany.value.phone
    })

    if (companyRes.data) {
      await addQueue({
        companyId: companyRes.data.id,
        roomId: selectedRoomObj.value.id
      })

      showCustomMessage('排号成功')
      await loadTableData()
    }

    newCompany.value = {
      companyName: '',
      phone: ''
    }

    showAddModal.value = false
  } catch (error) {
    console.error('排号失败:', error)
    showCustomMessage(error.message || '排号失败')
  }
}

const sortTable = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const scrollToCurrentCalledRow = () => {
  const roomNum = selectedRoom.value.replace('号洽谈室', '').replace(/[A-Za-z\s]/g, '')
  const targetRoomNumber = `${roomNum}号洽谈室`

  const roomData = tableData.value.filter(item =>
    item.roomNumber === targetRoomNumber &&
    !item.completed &&
    calledNumbers.value.has(item.id)
  ).sort((a, b) => {
    if (!a.queueNumber) return 1
    if (!b.queueNumber) return -1
    const numA = parseInt(a.queueNumber.split('_')[1])
    const numB = parseInt(b.queueNumber.split('_')[1])
    return numA - numB
  })

  if (roomData.length === 0) {
    return
  }

  const currentItem = roomData[roomData.length - 1]
  const currentIndex = filteredTableData.value.findIndex(item => item.id === currentItem.id)

  if (currentIndex === -1) {
    return
  }

  const tableContainer = document.querySelector('.table-scroll-container')
  const row = document.querySelector(`tr[data-row-index="${currentIndex}"]`)
  if (tableContainer && row) {
    const rowTop = row.offsetTop
    const containerHeight = tableContainer.offsetHeight
    const rowHeight = row.offsetHeight
    tableContainer.scrollTop = rowTop - containerHeight / 2 + rowHeight / 2
  }
}

const callNext = async () => {
  selectedRow.value = -1
  unlockAudio()
  const data = [...filteredTableData.value].sort((a, b) => {
    if (!a.queueNumber) return 1
    if (!b.queueNumber) return -1
    const partsA = a.queueNumber.split('_')[1].split('-')
    const partsB = b.queueNumber.split('_')[1].split('-')
    const numA = parseInt(partsA[0])
    const numB = parseInt(partsB[0])
    if (numA !== numB) return numA - numB
    const suffixA = partsA.length > 1 ? parseInt(partsA[1]) : 0
    const suffixB = partsB.length > 1 ? parseInt(partsB[1]) : 0
    return suffixA - suffixB
  })

  if (data.length === 0) {
    showCustomMessage('暂时没有厂商排号')
    return
  }

  const unCalledData = data.filter(item => !item.completed && !calledNumbers.value.has(item.id) && item.queueNumber)

  if (unCalledData.length === 0) {
    showCustomMessage('暂时没有厂商排号')
    return
  }

  const nextItem = unCalledData[0]
  const nextIndex = filteredTableData.value.findIndex(item => item.id === nextItem.id)

  if (nextItem) {
    try {
      await callNextQueue(nextItem.id)
      showCustomMessage('叫号成功')
      await loadTableData()

      setTimeout(() => {
        const tableContainer = document.querySelector('.table-scroll-container')
        const row = document.querySelector(`tr[data-row-index="${nextIndex}"]`)
        if (tableContainer && row) {
          const rowTop = row.offsetTop
          const containerHeight = tableContainer.offsetHeight
          const rowHeight = row.offsetHeight
          tableContainer.scrollTop = rowTop - containerHeight / 2 + rowHeight / 2
        }
      }, 50)
    } catch (error) {
      console.error('叫号失败:', error)
      showCustomMessage(error.message || '叫号失败')
    }
  }
}

const batchCallSelected = async () => {
  if (!selectedRoom.value || !selectedRoomObj.value) {
    showCustomMessage('请先选择洽谈室')
    return
  }

  unlockAudio()
  try {
    const res = await batchCallQueue(selectedRoomObj.value.id, 10)
    if (res.code === 200) {
      const data = res.data
      showCustomMessage(`多号并叫成功：${data.firstNumber}号到${data.lastNumber}号，共${data.callCount}个`)
      await loadTableData()
    } else {
      showCustomMessage(res.message || '多号并叫失败')
    }
  } catch (error) {
    console.error('多号并叫失败:', error)
    showCustomMessage(error.message || '多号并叫失败')
  }
}

const remindCurrent = () => {
  if (!selectedRoom.value) {
    showCustomMessage('请先选择洽谈室')
    return
  }

  const roomData = tableData.value.filter(item =>
    item.roomNumber === selectedRoom.value &&
    !item.completed &&
    calledNumbers.value.has(item.id)
  ).sort((a, b) => {
    if (!a.queueNumber) return 1
    if (!b.queueNumber) return -1
    const numA = parseInt(a.queueNumber.split('_')[1])
    const numB = parseInt(b.queueNumber.split('_')[1])
    return numA - numB
  })

  if (roomData.length === 0) {
    showCustomMessage('当前没有已叫号的厂商')
    return
  }

  const currentItem = roomData[roomData.length - 1]
  showCustomMessage(`当前叫号: ${currentItem.queueNumber} - ${currentItem.companyName}`)

  const tableContainer = document.querySelector('.table-scroll-container')
  const row = document.querySelector(`tr[data-row-index="${filteredTableData.value.findIndex(item => item.id === currentItem.id)}"]`)
  if (tableContainer && row) {
    const rowTop = row.offsetTop
    const containerHeight = tableContainer.offsetHeight
    const rowHeight = row.offsetHeight
    tableContainer.scrollTop = rowTop - containerHeight / 2 + rowHeight / 2
  }
}

const locateRow = () => {
  const keyword = locateKeyword.value.trim()
  if (!keyword) return

  const data = filteredTableData.value
  let targetIndex = -1

  const cleanKeyword = keyword.replace(/\s/g, '')
  const num = parseInt(cleanKeyword)

  if (!isNaN(num)) {
    if (cleanKeyword.length >= 7 && cleanKeyword.length <= 11) {
      targetIndex = data.findIndex(item => item.phone.includes(cleanKeyword))
    } else if (cleanKeyword.length < 7) {
      targetIndex = num - 1
      if (targetIndex < 0 || targetIndex >= data.length) {
        targetIndex = -1
      }
    }
  }

  if (targetIndex === -1) {
    const lowerKeyword = keyword.toLowerCase()
    targetIndex = data.findIndex(item =>
      item.companyName.toLowerCase().includes(lowerKeyword) ||
      item.roomNumber.toLowerCase().includes(lowerKeyword) ||
      item.phone.includes(keyword)
    )
  }

  if (targetIndex !== -1) {
    selectedRow.value = targetIndex
    setTimeout(() => {
      const tableContainer = document.querySelector('.table-scroll-container')
      const row = document.querySelector(`tr[data-row-index="${targetIndex}"]`)
      if (tableContainer && row) {
        const rowTop = row.offsetTop
        const containerHeight = tableContainer.offsetHeight
        const rowHeight = row.offsetHeight
        tableContainer.scrollTop = rowTop - containerHeight / 2 + rowHeight / 2
      }
    }, 50)
  }
}

const toggleCompleted = async (index) => {
  const paginatedData = paginatedTableData.value
  const item = paginatedData[index]

  if (!calledNumbers.value.has(item.id)) {
    showCustomMessage('该厂商还未被叫号，无法标记为已完成洽谈')
    return
  }

  try {
    await completeQueue(item.id)
    showCustomMessage('操作成功')
    await loadTableData()
  } catch (error) {
    console.error('标记完成失败:', error)
    showCustomMessage(error.message || '操作失败')
  }
}

const handlePause = () => {
  if (!selectedRoom.value || !selectedRoomObj.value) {
    showCustomMessage('请先选择洽谈室')
    return
  }

  passwordAction.value = 'pause'
  showPasswordModal.value = true
}

const executePause = async () => {
  try {
    await pauseMeeting(selectedRoomObj.value.id)
    showCustomMessage(`已经暂停${selectedRoom.value}洽谈室`)
    await loadRooms()
  } catch (error) {
    console.error('暂停洽谈室失败:', error)
    showCustomMessage(error.message || '暂停失败')
  }
}

const handleClose = () => {
  if (!selectedRoom.value || !selectedRoomObj.value) {
    showCustomMessage('请先选择洽谈室')
    return
  }

  passwordAction.value = 'close'
  showPasswordModal.value = true
}

const executeClose = async () => {
  try {
    await closeMeeting(selectedRoomObj.value.id)

    const closedRoom = selectedRoom.value
    selectedRoom.value = ''
    selectedRoomObj.value = null
    selectedIds.value.clear()
    selectedIds.value = new Set(selectedIds.value)

    showCustomMessage(`已经关闭${closedRoom}洽谈室`)
    await loadRooms()
    await loadTableData()
  } catch (error) {
    console.error('关闭洽谈室失败:', error)
    showCustomMessage(error.message || '关闭失败')
  }
}

const confirmPassword = () => {
  if (passwordInput.value === '121118') {
    const action = passwordAction.value
    closePasswordModal()
    if (action === 'pause') {
      executePause()
    } else if (action === 'close') {
      executeClose()
    }
  } else {
    showCustomMessage('密码错误')
  }
}

const sortedTableData = computed(() => {
  const data = [...tableData.value]

  const naturalCompare = (a, b) => {
    const chunksA = a.match(/(\d+|[^\d]+)/g) || [a]
    const chunksB = b.match(/(\d+|[^\d]+)/g) || [b]

    const minLength = Math.min(chunksA.length, chunksB.length)

    for (let i = 0; i < minLength; i++) {
      const chunkA = chunksA[i]
      const chunkB = chunksB[i]

      const numA = parseInt(chunkA)
      const numB = parseInt(chunkB)

      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) {
          return numA - numB
        }
      } else {
        const result = chunkA.localeCompare(chunkB, 'zh-CN')
        if (result !== 0) {
          return result
        }
      }
    }

    return chunksA.length - chunksB.length
  }

  data.sort((a, b) => {
    let valueA = a[sortField.value]
    let valueB = b[sortField.value]

    if (sortField.value === 'queueNumber') {
      if (!valueA && !valueB) return 0
      if (!valueA) return 1
      if (!valueB) return -1
      const result = naturalCompare(valueA, valueB)
      return sortOrder.value === 'asc' ? result : -result
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      const result = naturalCompare(valueA, valueB)
      return sortOrder.value === 'asc' ? result : -result
    }

    if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
      return sortOrder.value === 'asc' ? (valueA ? 1 : 0) - (valueB ? 1 : 0) : (valueB ? 1 : 0) - (valueA ? 1 : 0)
    }

    return 0
  })
  return data
})

const filteredTableData = computed(() => {
  if (!selectedRoom.value) {
    return []
  }

  const publicRoomNames = new Set(publicRooms.value.map(room => room.name))

  let data = sortedTableData.value.filter(item => publicRoomNames.has(item.roomNumber))

  data = data.filter(item => item.roomNumber === selectedRoom.value)

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    data = data.filter(item =>
      item.companyName.toLowerCase().includes(keyword) ||
      item.roomNumber.toLowerCase().includes(keyword) ||
      item.phone.includes(keyword)
    )
  }

  return data
})

const totalPages = computed(() => {
  return Math.ceil(filteredTableData.value.length / pageSize.value)
})

const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTableData.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    selectedRow.value = -1
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    selectedRow.value = -1
  }
}

const checkQueuedNotCompleted = () => {
  filteredTableData.value.forEach(item => {
    if (item.queueNumber && !item.completed) {
      selectedIds.value.add(item.id)
    }
  })
  selectedIds.value = new Set(selectedIds.value)
}

const checkNotQueued = () => {
  filteredTableData.value.forEach(item => {
    if (!item.queueNumber) {
      selectedIds.value.add(item.id)
    }
  })
  selectedIds.value = new Set(selectedIds.value)
}

const exportTable = () => {
  const exportData = filteredTableData.value.filter(item => selectedIds.value.has(item.id))

  if (exportData.length === 0) {
    showCustomMessage('请先勾选要导出的数据')
    return
  }

  const data = exportData.map(item => ({
    '序号': item.id,
    '洽谈室号': item.roomNumber,
    '排号': item.queueNumber || '-',
    '厂商名称': item.companyName,
    '手机号': `="${item.phone}"`,
    '是否完成洽谈': item.completed ? '已完成' : '未完成'
  }))

  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `公开见客排号_${new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const unlockAudio = () => {
  if ('speechSynthesis' in window && window.__audioUnlocked !== true) {
    const dummyUtterance = new SpeechSynthesisUtterance('')
    dummyUtterance.volume = 0
    window.speechSynthesis.speak(dummyUtterance)
    window.__audioUnlocked = true
  }
}

let updateInterval = null

onMounted(async () => {
  await loadTableData()
  await loadRooms()
  updateInterval = setInterval(async () => {
    await loadRooms()
    await loadTableData()
  }, 2000)

  document.addEventListener('click', unlockAudio)
  document.addEventListener('touchstart', unlockAudio)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  document.removeEventListener('click', unlockAudio)
  document.removeEventListener('touchstart', unlockAudio)
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
