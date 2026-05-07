<template>
  <div id="page-business-appoint" class="slide-in h-screen flex flex-col overflow-hidden">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content" v-html="sanitizedMessage"></div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    <div class="card p-4 mx-4 mb-4 flex-shrink-0" style="height: 200px;">
      <div class="text-sm text-surface-400 mb-2">已开启洽谈室:</div>
      <div class="flex flex-wrap gap-2 h-[calc(100%-24px)] overflow-y-auto">
        <div
          v-for="room in privateRooms"
          :key="room.id"
          class="rounded-lg m-[5px] cursor-pointer transition-all h-[calc(100%-10px)] flex-1 min-w-[200px] max-w-[300px] relative"
          :class="selectedRoom === room.name ? 'bg-primary-600 text-white' : 'bg-primary-50 hover:bg-primary-100'"
          @click="selectRoom(room.name)"
        >
          <div class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium" :class="selectedRoom === room.name ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'">
            {{ room.type === 'private' ? '专点' : '公开' }}
          </div>
          <div class="h-full flex flex-col items-center justify-center px-3 py-2 text-center">
            <div class="font-bold text-base md:text-lg" :class="selectedRoom === room.name ? 'text-white' : 'text-surface-800'">{{ room.name }}</div>
            <div v-if="room.companyName" class="text-xs md:text-sm mt-1.5 truncate max-w-full" :class="selectedRoom === room.name ? 'text-white/90' : 'text-surface-600'">{{ room.companyName }}</div>
            <div class="text-xs md:text-sm mt-1.5" :class="selectedRoom === room.name ? 'text-white/80' : 'text-surface-500'">
              当前叫号: {{ getRoomCallInfo(room.name).current || '-' }}
            </div>
          </div>
        </div>
        <div v-if="privateRooms.length === 0" class="col-span-3 text-center text-surface-400 py-8">
          暂无已开启的专点见客洽谈室
        </div>
      </div>
    </div>

    <div class="card p-4 mx-4 mb-4 flex-shrink-0">
      <div class="flex flex-row items-center gap-3 flex-nowrap" style="flex-wrap: nowrap;">
        <input type="text" v-model="searchKeyword" placeholder="搜索厂商名称..." class="form-input" style="width: 150px; flex-shrink: 0;" />
        <button class="btn btn-primary text-sm" style="white-space: nowrap;" @click="showAddModal = true">添加厂商</button>
        <button class="btn btn-primary text-sm" style="white-space: nowrap; background-color: #8b5cf6; border-color: #8b5cf6;" @click="showBatchImportModal = true">批量导入厂商</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #06b6d4; color: #0891b2;" @click="handleSetNewQueueNumber">设置新排号</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #f97316; color: #ea580c;" @click="handleRequeue">重排</button>
        <button class="btn btn-danger text-sm" style="white-space: nowrap;" @click="handleDelete">删除</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #3b82f6; color: #2563eb;" @click="checkQueuedNotCompleted">勾选已排号未完成</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #10b981; color: #059669;" @click="checkNotQueued">勾选未排号</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #8b5cf6; color: #7c3aed;" @click="exportTable">导出表格</button>
        <button class="btn btn-outline text-sm" style="white-space: nowrap; border-color: #ef4444; color: #dc2626;" @click="clearSelection">清除勾选</button>
        <span class="text-sm text-surface-600" style="white-space: nowrap;">已勾选: {{ selectedIds.size }} 条</span>
        <input type="text" v-model="locateKeyword" placeholder="定位序号/厂商..." class="form-input" style="width: 120px; flex-shrink: 0;" @keyup.enter="locateRow" />
        <button class="btn btn-success text-sm" style="white-space: nowrap;" @click="callNext">开始/下一个</button>
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
              <th style="border-right: 1px solid #e5e7eb; padding: 12px; cursor: pointer;" @click="sortTable('itemNumber')">
                货号
                <span v-if="sortField === 'itemNumber'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
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
              <td style="border-right: 1px solid #e5e7eb; padding: 12px;">
                <template v-if="item.itemNumber">
                  <div v-for="(num, idx) in item.itemNumber.split(',').filter(n => n.trim())" :key="idx">{{ num.trim() }}</div>
                </template>
              </td>
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
        <h3 class="text-lg font-bold mb-4 text-surface-800">添加厂商</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-600 mb-1">厂商名称</label>
            <input type="text" v-model="newCompany.companyName" placeholder="请输入厂商名称" class="form-input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-600 mb-1">货号</label>
            <input type="text" v-model="newCompany.itemNumber" placeholder="多个货号用逗号分隔（选填）" class="form-input w-full" />
            <p class="text-xs text-surface-400 mt-1">多个货号请用英文逗号分隔，如：HH001,HH002</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-600 mb-1">手机号</label>
            <input type="text" v-model="newCompany.phone" placeholder="请输入手机号" class="form-input w-full" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button class="btn btn-outline text-sm" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary text-sm" @click="addCompany">确定</button>
        </div>
      </div>
    </div>

    <div v-if="showBatchImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showBatchImportModal = false">
      <div class="bg-white rounded-lg p-6 w-[600px] shadow-xl max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-bold mb-4 text-surface-800">批量导入厂商</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-600 mb-1">导入方式</label>
            <div class="flex gap-3">
              <button class="btn text-sm" :class="batchImportMode === 'text' ? 'btn-primary' : 'btn-outline'" @click="batchImportMode = 'text'">文本粘贴</button>
              <button class="btn text-sm" :class="batchImportMode === 'file' ? 'btn-primary' : 'btn-outline'" @click="batchImportMode = 'file'">文件上传</button>
            </div>
          </div>
          <div v-if="batchImportMode === 'text'">
            <label class="block text-sm font-medium text-surface-600 mb-1">厂商数据（每行一条，格式：厂商名称,手机号,货号）</label>
            <textarea v-model="batchImportText" placeholder="厂商A,13800138001,HH001&#10;厂商B,13900139002,HH002,HH003&#10;厂商C,13700137003" class="form-input w-full" style="height: 200px; resize: vertical;" @input="parseBatchImportText"></textarea>
            <p class="text-xs text-surface-400 mt-1">货号支持多个，用英文逗号分隔（如：HH001,HH002）</p>
          </div>
          <div v-if="batchImportMode === 'file'">
            <div class="flex items-center gap-3 mb-2">
              <label class="text-sm font-medium text-surface-600">选择文件（支持Excel、CSV、TXT）</label>
              <button class="btn text-sm btn-outline" style="border-color: #10b981; color: #059669;" @click="exportImportTemplate">
                导出模版
              </button>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv,.txt" class="form-input w-full" @change="handleBatchFileUpload" />
            <p class="text-xs text-surface-400 mt-1">支持Excel(.xlsx/.xls)、CSV、TXT文件，自动识别"厂商名称"、"手机号"和"货号"列</p>
          </div>
          <div v-if="batchImportPreview.length > 0">
            <label class="block text-sm font-medium text-surface-600 mb-1">预览（共{{ batchImportPreview.length }}条）</label>
            <div class="border rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-3 py-2 text-left">序号</th>
                    <th class="px-3 py-2 text-left">厂商名称</th>
                    <th class="px-3 py-2 text-left">手机号</th>
                    <th class="px-3 py-2 text-left">货号</th>
                    <th class="px-3 py-2 text-left">状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in batchImportPreview" :key="index" class="border-t">
                    <td class="px-3 py-2">{{ index + 1 }}</td>
                    <td class="px-3 py-2">{{ item.companyName }}</td>
                    <td class="px-3 py-2">{{ item.phone }}</td>
                    <td class="px-3 py-2">
                      <template v-if="item.itemNumber">
                        <div v-for="(num, idx) in item.itemNumber.split(',').filter(n => n.trim())" :key="idx">{{ num.trim() }}</div>
                      </template>
                    </td>
                    <td class="px-3 py-2">
                      <span v-if="item.valid" class="text-green-600">有效</span>
                      <span v-else class="text-red-600">{{ item.error }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button class="btn btn-outline text-sm" style="border-color: #ef4444; color: #dc2626;" @click="clearBatchImport">清空</button>
          <button class="btn btn-outline text-sm" @click="showBatchImportModal = false">取消</button>
          <button class="btn btn-primary text-sm" style="background-color: #8b5cf6; border-color: #8b5cf6;" :disabled="batchImportPreview.filter(i => i.valid).length === 0 || batchImporting" @click="doBatchImport">
            {{ batchImporting ? '导入中...' : '确认导入' }}
          </button>
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

    <!-- 密码验证弹窗 -->
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
import { addCompany as createCompany, batchAddCompany } from '../api/company'
import { getQueueList, addQueue, callNextQueue, completeQueue, cancelQueue, requeue } from '../api/queue'
import { addLog } from '../api/log'
import * as XLSX from 'xlsx'

const meetingRooms = ref([])
const selectedRoomObj = ref(null)

const showAddModal = ref(false)
const newCompany = ref({
  companyName: '',
  phone: '',
  itemNumber: ''
})

const showBatchImportModal = ref(false)
const batchImportMode = ref('text')
const batchImportText = ref('')
const batchImportPreview = ref([])
const batchImporting = ref(false)

const tableData = ref([])

const selectedRow = ref(-1)
const sortField = ref('roomNumber')
const sortOrder = ref('asc')
const currentPage = ref(1)
const pageSize = ref(1000)
const selectedRoom = ref('')
const searchKeyword = ref('')
const locateKeyword = ref('')
const calledNumbers = ref(new Set())

const selectedIds = ref(new Set())

const showMessage = ref(false)
const message = ref('')

const sanitizedMessage = computed(() => {
  return message.value.replace(/\n/g, '<br>')
})

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const recordAppointLog = async (action, room, tableRecords = [], status = 1, extraDetail = '') => {
  try {
    let detail = ''
    if (room) {
      const parts = [`洽谈室: ${room.name || '-'}`]
      const statusMap = { free: '空闲', occupied: '启用', disabled: '暂停' }
      if (room.status) parts.push(`状态: ${statusMap[room.status] || room.status}`)
      if (room.type) {
        const typeMap = { public: '公开见客', private: '专点见客' }
        parts.push(`类型: ${typeMap[room.type] || room.type}`)
      }
      if (room.companyName) parts.push(`公司: ${room.companyName}`)
      if (room.quotePoints) parts.push(`报价点数: ${room.quotePoints}`)
      if (room.visitRequirement) parts.push(`见客要求: ${room.visitRequirement}`)
      detail = parts.join(', ')
    }
    if (tableRecords && tableRecords.length > 0) {
      const statusLabel = { waiting: '', called: '[已叫]', completed: '[已完成]' }
      const queueParts = tableRecords.map(q => {
        const tag = statusLabel[q.status] || (q.completed ? '[已完成]' : '')
        return `${q.queueNumber || '无号'}(${q.companyName || '-'})${tag}`
      })
      detail = detail + (detail ? ' | ' : '') + '排号记录: ' + queueParts.join(', ')
      detail += ' [QUEUE_DATA]' + JSON.stringify(tableRecords) + '[/QUEUE_DATA]'
    }
    if (extraDetail) {
      detail = detail ? detail + ' | ' + extraDetail : extraDetail
    }
    await addLog({
      module: '洽谈室管理',
      action: action,
      targetId: room?.id?.toString() || '',
      detail: detail,
      status: status
    })
  } catch (error) {
    console.error('记录日志失败:', error)
  }
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

const previewQueueTicket = (roomName, queueNumber, companyName, itemNumber = '') => {
  try {
    const roomNumber = parseInt(roomName.replace(/\D/g, ''))
    const floor = roomNumber >= 1 && roomNumber <= 23 ? '3楼' : '2楼'
    const displayRoomName = `${floor}${roomNumber}号室`
    const numberPart = queueNumber.includes('_') ? queueNumber.split('_')[1] : queueNumber
    const displayNumber = `${roomNumber}_${numberPart}`
    const typeText = '专点见客'

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

      LODOP.PREVIEW()
    } else {
      showCustomMessage('请先安装C-Lodop打印控件！请检查 http://localhost:8000 是否可访问')
    }
  } catch (e) {
    console.error('预览失败:', e)
    showCustomMessage('预览失败: ' + e.message)
  }
}

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
  const deletedRecords = tableData.value.filter(item => selectedIds.value.has(item.id))
  const roomForLog = selectedRoomObj.value ? { ...selectedRoomObj.value } : null

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

  const logStatus = failCount === 0 ? 1 : 0
  await recordAppointLog('删除排号记录', roomForLog, deletedRecords, logStatus,
    `成功${successCount}条，失败${failCount}条`)

  let msg = `成功删除${successCount}条数据`
  if (failCount > 0) {
    msg += `，${failCount}条删除失败`
  }
  showCustomMessage(msg)
  await loadTableData()
}

// 加载洽谈室列表
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

// 加载排号列表
const loadTableData = async () => {
  try {
    const res = await getQueueList({ pageSize: 1000 })
    if (res.data && res.data.list) {
      const activeList = res.data.list.filter(item => item.status !== 'cancelled')
      tableData.value = activeList.map(item => ({
        id: item.id,
        roomId: item.roomId,
        companyId: item.companyId,
        roomNumber: item.meetingRoom?.name || `${item.roomId}号洽谈室`,
        companyName: item.company?.companyName || item.customer?.companyName || '',
        itemNumber: item.company?.itemNumber || '',
        queueNumber: item.queueNumber,
        phone: item.company?.phone || item.customer?.phone || '',
        completed: item.completed,
        status: item.status
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

// 添加厂商到列表（创建排号记录，但排号字段为空）
const addCompany = async () => {
  if (!newCompany.value.companyName || !newCompany.value.phone) {
    showCustomMessage('请填写完整信息')
    return
  }

  const phoneRegex = /^\d{11}$/
  if (!phoneRegex.test(newCompany.value.phone)) {
    showCustomMessage('手机号必须是11位数字')
    return
  }

  if (!selectedRoom.value || !selectedRoomObj.value) {
    showCustomMessage('请先选择洽谈室')
    return
  }

  // 检查同一洽谈室中是否已有同名同手机的厂商
  const exists = tableData.value.some(item =>
    item.roomId === selectedRoomObj.value.id &&
    item.companyName === newCompany.value.companyName &&
    item.phone === newCompany.value.phone
  )

  if (exists) {
    showCustomMessage('该洽谈室已存在同名同手机号的厂商')
    return
  }

  try {
    // 添加厂商
    const companyRes = await createCompany({
      companyName: newCompany.value.companyName,
      phone: newCompany.value.phone,
      itemNumber: newCompany.value.itemNumber
    })
    
    if (companyRes.data) {
      // 创建排号记录，但排号字段为空（由后续叫号时生成）
      await addQueue({
        companyId: companyRes.data.id,
        roomId: selectedRoomObj.value.id
      })

      await recordAppointLog('添加厂商', selectedRoomObj.value, [], 1,
        `添加厂商: ${newCompany.value.companyName}, 手机号: ${newCompany.value.phone}`)

      showCustomMessage('添加成功')
      // 刷新排号列表
      await loadTableData()
    }

    newCompany.value = {
      companyName: '',
      phone: '',
      itemNumber: ''
    }

    showAddModal.value = false
  } catch (error) {
    await recordAppointLog('添加厂商', selectedRoomObj.value, [], 0,
      `${newCompany.value.companyName || ''} - ${error.message || '添加失败'}`)
    console.error('添加厂商失败:', error)
    showCustomMessage(error.message || '添加失败')
  }
}

// 合并货号（去重）
const mergeItemNumbers = (existingStr, newStr) => {
  if (!existingStr || existingStr === '') {
    return newStr || ''
  }
  if (!newStr || newStr === '') {
    return existingStr
  }
  const existingList = existingStr.split(',').map(n => n.trim()).filter(n => n)
  const newList = newStr.split(',').map(n => n.trim()).filter(n => n)
  const mergedSet = new Set([...existingList, ...newList])
  return Array.from(mergedSet).join(',')
}

const parseBatchText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  const tempResult = []
  
  for (const line of lines) {
    const parts = line.split(/[,，\t]/).map(p => p.trim())
    if (parts.length >= 2) {
      const companyName = parts[0]
      const phone = parts[1]
      const itemNumber = parts.length >= 3 ? parts.slice(2).filter(p => p).join(',') : ''
      if (!companyName || !phone) {
        tempResult.push({ companyName: companyName || '(空)', phone: phone || '(空)', itemNumber: itemNumber || '', valid: false, error: '名称或手机号为空' })
      } else {
        tempResult.push({ companyName, phone, itemNumber, valid: true })
      }
    } else if (parts.length === 1 && parts[0]) {
      tempResult.push({ companyName: parts[0], phone: '', itemNumber: '', valid: false, error: '缺少手机号' })
    }
  }
  
  // 合并重复厂商的货号
  const mergedMap = new Map()
  const result = []
  
  for (const item of tempResult) {
    if (!item.valid) {
      result.push(item)
      continue
    }
    
    const key = `${item.companyName}-${item.phone}`
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)
      existing.itemNumber = mergeItemNumbers(existing.itemNumber, item.itemNumber)
    } else {
      mergedMap.set(key, item)
      result.push(item)
    }
  }
  
  return result
}

const parseBatchImportText = () => {
  if (!batchImportText.value.trim()) {
    batchImportPreview.value = []
    return
  }
  batchImportPreview.value = parseBatchText(batchImportText.value)
}

const exportImportTemplate = () => {
  const wb = XLSX.utils.book_new()
  const wsData = [
    ['厂商名称', '手机号', '货号'],
    ['示例厂商', '13800138000', 'HH001,HH002'],
    ['示例厂商B', '13676141011', 'h666'],
    ['示例厂商B', '13676141011', 'h777'],
    ['示例厂商B', '13676141011', 'h888'],
    ['示例厂商B', '13676141011', 'h999'],
    ['示例厂商B', '13676141011', 'h1111']
  ]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 20 }
  ]
  XLSX.utils.book_append_sheet(wb, ws, '厂商导入模版')
  XLSX.writeFile(wb, '厂商导入模版.xlsx')
}

const handleBatchFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = file.name.toLowerCase()
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

  if (isExcel) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          batchImportPreview.value = []
          return
        }

        const headers = jsonData[0].map(h => String(h || '').trim())
        const rows = jsonData.slice(1)

        const nameColIdx = findColumnIndex(headers, ['厂商名称', '厂商名', '公司名称', '公司名', '企业名称', '企业名', '名称'])
        const phoneColIdx = findColumnIndex(headers, ['手机', '手机号', '手机号码', '联系电话', '电话', '联系方式', '联系电话/手机'])
        const itemNumberColIdx = findColumnIndex(headers, ['货号', '商品货号', '编号', '产品编号', '型号'])
        const itemNumberColIdx2 = findColumnIndex(headers, ['货号2', '商品货号2', '货号2', '编号2'])
        const itemNumberColIdx3 = findColumnIndex(headers, ['货号3', '商品货号3', '编号3'])

        if (nameColIdx === -1 && phoneColIdx === -1) {
          const text = rows.map(row => row.filter(c => c != null).join(',')).join('\n')
          batchImportText.value = text
          batchImportPreview.value = parseBatchText(text)
          return
        }

        const tempResult = []
        for (const row of rows) {
          const companyName = nameColIdx !== -1 ? String(row[nameColIdx] || '').trim() : ''
          const phone = phoneColIdx !== -1 ? String(row[phoneColIdx] || '').trim() : ''
          const itemParts = []
          if (itemNumberColIdx !== -1 && String(row[itemNumberColIdx] || '').trim()) itemParts.push(String(row[itemNumberColIdx]).trim())
          if (itemNumberColIdx2 !== -1 && String(row[itemNumberColIdx2] || '').trim()) itemParts.push(String(row[itemNumberColIdx2]).trim())
          if (itemNumberColIdx3 !== -1 && String(row[itemNumberColIdx3] || '').trim()) itemParts.push(String(row[itemNumberColIdx3]).trim())
          const itemNumber = itemParts.join(',')

          if (!companyName && !phone) continue

          if (!companyName || !phone) {
            tempResult.push({ companyName: companyName || '(空)', phone: phone || '(空)', itemNumber: itemNumber || '', valid: false, error: '名称或手机号为空' })
          } else {
            tempResult.push({ companyName, phone, itemNumber, valid: true })
          }
        }

        // 合并重复厂商的货号
        const mergedMap = new Map()
        const result = []
        
        for (const item of tempResult) {
          if (!item.valid) {
            result.push(item)
            continue
          }
          
          const key = `${item.companyName}-${item.phone}`
          if (mergedMap.has(key)) {
            const existing = mergedMap.get(key)
            existing.itemNumber = mergeItemNumbers(existing.itemNumber, item.itemNumber)
          } else {
            mergedMap.set(key, item)
            result.push(item)
          }
        }
        batchImportPreview.value = result
      } catch (err) {
        console.error('解析Excel文件失败:', err)
        showCustomMessage('解析Excel文件失败，请检查文件格式')
      }
    }
    reader.readAsArrayBuffer(file)
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      batchImportText.value = text
      batchImportPreview.value = parseBatchText(text)
    }
    reader.readAsText(file, 'UTF-8')
  }
}

const findColumnIndex = (headers, keywords) => {
  for (const kw of keywords) {
    const idx = headers.findIndex(h => h.includes(kw))
    if (idx !== -1) return idx
  }
  return -1
}

const clearBatchImport = () => {
  batchImportText.value = ''
  batchImportPreview.value = []
}

const doBatchImport = async () => {
  if (!selectedRoom.value || !selectedRoomObj.value) {
    showCustomMessage('请先选择洽谈室')
    return
  }

  const validItems = batchImportPreview.value.filter(i => i.valid)
  if (validItems.length === 0) {
    showCustomMessage('没有有效的厂商数据')
    return
  }

  batchImporting.value = true
  try {
    const companies = validItems.map(item => ({
      companyName: item.companyName,
      phone: item.phone,
      itemNumber: item.itemNumber || ''
    }))

    const res = await batchAddCompany({
      companies,
      roomId: selectedRoomObj.value.id
    })

    if (res.data) {
      const { successCount, failCount, errors } = res.data
      const totalCount = validItems.length
      const statusCode = failCount === 0 ? 1 : 0
      const importDetail = `导入${totalCount}条，成功${successCount}条，失败${failCount}条`
      await recordAppointLog('批量添加厂商', selectedRoomObj.value, [], statusCode, importDetail)
      let msg = `成功导入${successCount}条厂商`
      if (failCount > 0) {
        msg += `，${failCount}条跳过`
        if (errors && errors.length > 0) {
          msg += '（' + errors.map(e => `第${e.index}行: ${e.message}`).join('；') + '）'
        }
      }
      showCustomMessage(msg)
      await loadTableData()
    }

    showBatchImportModal.value = false
    batchImportText.value = ''
    batchImportPreview.value = []
  } catch (error) {
    await recordAppointLog('批量添加厂商', selectedRoomObj.value, [], 0,
      `${validItems.length}条 - ${error.message || '批量导入失败'}`)
    console.error('批量导入失败:', error)
    showCustomMessage(error.message || '批量导入失败')
  } finally {
    batchImporting.value = false
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

const selectRoom = (roomName) => {
  unlockAudio()
  selectedRoom.value = selectedRoom.value === roomName ? '' : roomName
  // 找到选中的洽谈室对象
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
    
    if (numA !== numB) {
      return numA - numB
    }
    
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

  return {
    current,
    next,
    waitTime
  }
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
      
      if (numA !== numB) {
        return numA - numB
      }
      
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
    
    if (numA !== numB) {
      return numA - numB
    }
    
    const suffixA = partsA.length > 1 ? parseInt(partsA[1]) : 0
    const suffixB = partsB.length > 1 ? parseInt(partsB[1]) : 0
    
    return suffixA - suffixB
  })

  if (data.length === 0) {
    showCustomMessage('暂时没有厂商排号')
    return
  }

  const unCalledData = data.filter(item => !item.completed && !calledNumbers.value.has(item.id))

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
      
      // 刷新数据
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

const handleSetNewQueueNumber = async () => {
  if (selectedIds.value.size === 0) {
    showCustomMessage('请先勾选要设置排号的厂商')
    return
  }

  // 获取选中的未排号且未完成的厂商
  const selectedItems = filteredTableData.value.filter(item =>
    selectedIds.value.has(item.id) && !item.queueNumber && !item.completed
  )

  if (selectedItems.length === 0) {
    showCustomMessage('勾选的厂商都已排号，无需设置')
    return
  }

  // 检查是否有已排号或已完成的被勾选
  const skippedCount = [...selectedIds.value].filter(id => {
    const item = filteredTableData.value.find(row => row.id === id)
    return item && (item.queueNumber || item.completed)
  }).length

  if (skippedCount > 0) {
    showCustomMessage(`有 ${skippedCount} 条数据已排号或已完成，已跳过。仅对未排号且未完成的厂商设置排号。`)
  }

  let successCount = 0
  let failCount = 0
  const failMessages = []
  const successItems = []

  for (const item of selectedItems) {
    try {
      const res = await addQueue({
        companyId: item.companyId,
        roomId: item.roomId
      })
      if (res.code === 200) {
        successCount++
        successItems.push({
          companyId: item.companyId,
          roomId: item.roomId,
          companyName: item.companyName,
          itemNumber: item.itemNumber
        })
      } else {
        failCount++
        failMessages.push(`${item.companyName}: ${res.message || '排号失败'}`)
      }
    } catch (error) {
      console.error('设置排号失败:', item.id, error)
      failCount++
      failMessages.push(`${item.companyName}: ${error.message || '排号失败'}`)
    }
  }

  selectedIds.value.clear()
  selectedIds.value = new Set(selectedIds.value)

  let msg = `成功设置 ${successCount} 条排号`
  if (failCount > 0) {
    msg += `，${failCount} 条失败`
    if (failMessages.length > 0) {
      msg += `\n${failMessages.join('\n')}`
    }
  }
  showCustomMessage(msg)
  await loadTableData()

  // 为每个成功设置排号的厂商弹出打印预览
  for (const successItem of successItems) {
    const newItem = tableData.value.find(row =>
      row.companyId === successItem.companyId &&
      row.roomId === successItem.roomId &&
      row.queueNumber
    )
    if (newItem) {
      previewQueueTicket(newItem.roomNumber, newItem.queueNumber, newItem.companyName, newItem.itemNumber)
    }
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
  const item = filteredTableData.value.find(row => row.id === selectedId)
  if (!item) {
    showCustomMessage('未找到选中的数据')
    return
  }

  if (item.completed) {
    showCustomMessage('已完成的厂商无法重排')
    return
  }

  if (!item.queueNumber) {
    showCustomMessage('该厂商还未排号，无法重排')
    return
  }

  if (!calledNumbers.value.has(item.id)) {
    showCustomMessage('该厂商还未被叫号，无法重排')
    return
  }

  try {
    const res = await requeue(item.id)

    selectedIds.value.clear()
    selectedIds.value = new Set(selectedIds.value)

    showCustomMessage('重排成功')
    await loadTableData()

    const newItem = filteredTableData.value.find(row => row.id === item.id)
    if (newItem && newItem.queueNumber) {
      previewQueueTicket(newItem.roomNumber, newItem.queueNumber, newItem.companyName, newItem.itemNumber)
    }
  } catch (error) {
    console.error('重排失败:', error)
    showCustomMessage(error.message || '重排失败')
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
    // 刷新列表
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
  const roomBeforePause = selectedRoomObj.value ? { ...selectedRoomObj.value } : null
  const roomQueueData = tableData.value.filter(item => item.roomNumber === selectedRoom.value)

  try {
    const response = await pauseMeeting(selectedRoomObj.value.id)
    if (response.code === 200) {
      await recordAppointLog('暂停洽谈室', roomBeforePause, roomQueueData, 1)
      showCustomMessage(`已经暂停${selectedRoom.value}洽谈室`)
      await loadRooms()
    } else {
      await recordAppointLog('暂停洽谈室', roomBeforePause, roomQueueData, 0)
      showCustomMessage(response.message || '暂停失败')
    }
  } catch (error) {
    await recordAppointLog('暂停洽谈室', roomBeforePause, roomQueueData, 0)
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
  const roomBeforeClose = selectedRoomObj.value ? { ...selectedRoomObj.value } : null
  const roomQueueData = tableData.value.filter(item => item.roomNumber === selectedRoom.value)

  try {
    const response = await closeMeeting(selectedRoomObj.value.id)
    if (response.code === 200) {
      const restoreData = response.data?.restoreData
      let extraDetail = ''
      if (restoreData) {
        extraDetail = '[RESTORE_JSON]' + JSON.stringify(restoreData) + '[/RESTORE_JSON]'
      }
      await recordAppointLog('关闭洽谈室', roomBeforeClose, roomQueueData, 1, extraDetail)

      const closedRoom = selectedRoom.value
      selectedRoom.value = ''
      selectedRoomObj.value = null
      selectedIds.value.clear()
      selectedIds.value = new Set(selectedIds.value)

      showCustomMessage(`已经关闭${closedRoom}洽谈室`)
      await loadRooms()
      await loadTableData()
    } else {
      await recordAppointLog('关闭洽谈室', roomBeforeClose, roomQueueData, 0)
      showCustomMessage(response.message || '关闭失败')
    }
  } catch (error) {
    await recordAppointLog('关闭洽谈室', roomBeforeClose, roomQueueData, 0)
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

const privateRooms = computed(() => {
  return meetingRooms.value.filter(room => room.type === 'private' && room.status === 'occupied')
})

const filteredTableData = computed(() => {
  if (!selectedRoom.value) {
    return []
  }

  let data = sortedTableData.value

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

let updateInterval = null

const unlockAudio = () => {
  if ('speechSynthesis' in window && window.__audioUnlocked !== true) {
    const dummyUtterance = new SpeechSynthesisUtterance('')
    dummyUtterance.volume = 0
    window.speechSynthesis.speak(dummyUtterance)
    window.__audioUnlocked = true
    console.log('语音播放已解锁')
  }
}

onMounted(async () => {
  await loadTableData()
  await loadRooms()
  // 同时定时刷新洽谈室和排号数据
  updateInterval = setInterval(async () => {
    await loadRooms()
    await loadTableData()
  }, 2000)
  
  document.addEventListener('click', unlockAudio)
  document.addEventListener('touchstart', unlockAudio)
})

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
    '货号': item.itemNumber || '',
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
  link.setAttribute('download', `厂商排号_${new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

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