<template>
  <div id="page-meeting" class="slide-in">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-surface-900">洽谈室管理</h2>
        <p class="text-sm text-surface-400 mt-1">洽谈室状态全生命周期管理</p>
      </div>
      <button v-if="hasPermission('meeting', 'add')" id="add-meeting-btn" class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-start gap-2 relative" @click="openAddModal">
        <span>新增洽谈室</span>
      </button>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 h-screen" @click="closeEditModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-xl border border-surface-200" @click.stop>
        <h3 class="text-lg font-semibold mb-4">编辑洽谈室</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">名称</label>
            <div class="w-full px-4 py-2 border border-surface-200 rounded-lg bg-surface-50 text-surface-700">{{ editingRoom.name }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">类型</label>
            <select v-model="editingRoom.type" class="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="public">公开见客</option>
              <option value="private">专点见客</option>
            </select>
          </div>
          <div v-if="editingRoom.status === 'occupied'">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-surface-700 mb-1">公司名</label>
              <div class="relative" ref="editCompanyDropdown">
                <input
                  type="text"
                  v-model="editCompanySearch"
                  @focus="editCompanyDropdownOpen = true"
                  @input="editCompanyDropdownOpen = true"
                  placeholder="搜索公司名..."
                  class="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div v-if="editCompanyDropdownOpen" class="absolute z-10 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div
                    v-for="customer in filteredEditCustomers"
                    :key="customer.id"
                    @click="selectEditCompany(customer.company)"
                    class="px-4 py-2 hover:bg-surface-100 cursor-pointer"
                  >
                    {{ customer.company }}
                  </div>
                  <div v-if="filteredEditCustomers.length === 0" class="px-4 py-2 text-surface-400">
                    无匹配结果
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2 mt-2">
              <label class="block text-sm font-medium text-surface-700 mb-1">报价点数</label>
              <input type="text" v-model="editingRoom.quotePoints" class="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="请输入报价点数" />
            </div>
            <div class="space-y-2 mt-2">
              <label class="block text-sm font-medium text-surface-700 mb-1">见客要求</label>
              <textarea v-model="editingRoom.visitRequirement" class="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="flex gap-3 justify-end mt-6">
          <button class="px-4 py-2 border border-surface-200 rounded-lg text-surface-700 hover:bg-surface-50" @click="closeEditModal">取消</button>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 h-screen" @click="closePasswordModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-xl border border-surface-200" @click.stop>
        <h3 class="text-lg font-semibold mb-4">请输入密码</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">密码</label>
            <input type="password" v-model="passwordInput" class="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="请输入密码" />
          </div>
        </div>
        <div class="flex gap-3 justify-end mt-6">
          <button class="px-4 py-2 border border-surface-200 rounded-lg text-surface-700 hover:bg-surface-50" @click="closePasswordModal">取消</button>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700" @click="confirmPassword">确定</button>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 h-screen" @click="closeAddModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-xl border border-surface-200" @click.stop>
        <h3 class="text-lg font-semibold mb-4">新增洽谈室</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">名称</label>
            <input type="text" v-model="newRoom.name" class="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="例如：1号洽谈室" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">状态</label>
            <div class="w-full px-4 py-2 border border-surface-200 rounded-lg bg-surface-50 text-surface-600">空闲</div>
          </div>
        </div>
        <div class="flex gap-3 justify-end mt-6">
          <button class="px-4 py-2 border border-surface-200 rounded-lg text-surface-700 hover:bg-surface-50" @click="closeAddModal">取消</button>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700" @click="saveAdd">保存</button>
        </div>
      </div>
    </div>
    <!-- Status summary -->
    <div class="flex gap-3 mb-4">
      <div class="flex-1 p-4 rounded-lg border cursor-pointer transition-colors" :class="activeStatus === 'free' ? 'bg-accent-50 border-accent-200' : 'bg-surface-50 border-surface-200'" @click="activeStatus = 'free'">
        <div class="text-xl font-bold" :class="activeStatus === 'free' ? 'text-accent-700' : 'text-surface-500'">{{ statusSummary.free }}</div>
        <div class="text-xs text-surface-500">空闲</div>
      </div>
      <div class="flex-1 p-4 rounded-lg border cursor-pointer transition-colors" :class="activeStatus === 'occupied' ? 'bg-warn-50 border-warn-200' : 'bg-surface-50 border-surface-200'" @click="activeStatus = 'occupied'">
        <div class="text-xl font-bold" :class="activeStatus === 'occupied' ? 'text-warn-600' : 'text-surface-500'">{{ statusSummary.occupied }}</div>
        <div class="text-xs text-surface-500">启用</div>
      </div>
      <div class="flex-1 p-4 rounded-lg border cursor-pointer transition-colors" :class="activeStatus === 'disabled' ? 'bg-surface-100 border-surface-300' : 'bg-surface-50 border-surface-200'" @click="activeStatus = 'disabled'">
        <div class="text-xl font-bold" :class="activeStatus === 'disabled' ? 'text-surface-600' : 'text-surface-500'">{{ statusSummary.disabled }}</div>
        <div class="text-xs text-surface-500">暂停</div>
      </div>
    </div>
    <!-- Search Box -->
    <div class="mb-4">
      <input type="text" v-model="searchKeyword" placeholder="输入数字精准搜索..." class="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" @input="handleSearch" />
    </div>
    <!-- Meeting Room Grid -->
    <div class="grid grid-cols-4 gap-3" id="meeting-grid" style="max-height: calc(100vh - 400px); overflow-y: auto;">
      <div v-for="room in filteredRooms" :key="room.id" class="card p-4 text-center">
        <h3 class="font-semibold text-surface-800 mb-2">{{ room.name }}</h3>
        <span :class="room.status === 'free' ? 'badge badge-green' : room.status === 'occupied' ? 'badge badge-orange' : 'badge badge-gray'" class="mb-3 inline-block">
          {{ room.status === 'free' ? '空闲' : room.status === 'occupied' ? '启用' : '暂停' }}
        </span>
        <div class="space-y-2 text-sm mb-3" v-if="room.status === 'occupied'">
          <div class="flex items-start">
            <div class="flex items-start">
              <i data-lucide="building" class="w-4 h-4 text-surface-400 mr-0.5 mt-0.5"></i>
              <span class="text-surface-600 w-20 text-left mt-1 whitespace-nowrap">公司名称：</span>
            </div>
            <span class="text-surface-600 border border-surface-300 px-2 py-1 rounded flex-1 whitespace-normal word-break break-all"> {{ room.companyName }}</span>
          </div>
          <div class="flex items-start" v-if="room.quotePoints">
            <div class="flex items-start">
              <i data-lucide="trending-up" class="w-4 h-4 text-surface-400 mr-0.5 mt-0.5"></i>
              <span class="text-surface-600 w-20 text-left mt-1 whitespace-nowrap">报价点数：</span>
            </div>
            <span class="text-surface-600 border border-surface-300 px-2 py-1 rounded flex-1 whitespace-normal word-break break-all"> {{ room.quotePoints }}</span>
          </div>
          <div class="flex items-start">
            <div class="flex items-start">
              <i data-lucide="message-circle" class="w-4 h-4 text-surface-400 mr-0.5 mt-0.5"></i>
              <span class="text-surface-600 w-20 text-left mt-1 whitespace-nowrap">见客要求：</span>
            </div>
            <span class="text-surface-600 border border-surface-300 px-2 py-1 rounded flex-1 whitespace-normal word-break break-all"> {{ room.visitRequirement }}</span>
          </div>
        </div>
        <div class="text-sm text-surface-400 mb-3" v-else-if="room.status === 'free'">
          可立即使用
        </div>
        <div class="text-sm text-surface-400 mb-3" v-else>
          已暂停
        </div>
        <div class="flex gap-2 justify-center">
          <button v-if="room.status === 'occupied' && hasPermission('meeting', 'edit')" class="btn btn-outline text-xs py-1.5 px-3" @click="handleRoomAction(room.id, 'details')">
            编辑
          </button>
          <button v-if="room.status === 'occupied' && hasPermission('meeting', 'pause')" :class="['btn', 'text-xs', 'py-1.5', 'px-3', 'btn-outline']" @click="handleRoomAction(room.id, 'pause')">
            暂停
          </button>
          <button v-if="room.status !== 'occupied' && hasPermission('meeting', 'enable')" :class="['btn', 'text-xs', 'py-1.5', 'px-3', 'bg-yellow-500 hover:bg-yellow-600 text-white']" @click="handleRoomAction(room.id, 'edit')">
            启用
          </button>
          <button v-if="room.status !== 'free' && hasPermission('meeting', 'close')" class="btn btn-danger text-xs py-1.5 px-3" @click="handleRoomAction(room.id, 'delete')">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { getMeetingList, addMeeting, updateMeeting, enableMeeting, pauseMeeting, closeMeeting } from '@/api/meeting'
import { getCustomerList } from '@/api/customer'

const userStore = useUserStore()

const hasPermission = (module, permission) => {
  const permissions = userStore.userInfo.permissions || {}
  const modulePermissions = permissions[module] || {}
  return modulePermissions[permission] === true
}

const meetingRooms = ref([])
const activeStatus = ref('free')
const searchKeyword = ref('')
const showEditModal = ref(false)
const showAddModal = ref(false)
const showPasswordModal = ref(false)
const editingRoom = ref({})
const newRoom = ref({ name: '', status: 'free' })
const passwordInput = ref('')
const passwordAction = ref('')
const passwordRoomId = ref(null)

const showMessage = ref(false)
const message = ref('')

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

// 客户资料列表 - 从后端API获取
const customers = ref([])

const loadCustomers = async () => {
  try {
    const response = await getCustomerList({ page: 1, pageSize: 1000 })
    if (response.code === 200) {
      customers.value = (response.data.list || []).map(c => ({
        id: c.id,
        company: c.companyName,
        name: c.contactPerson || ''
      }))
    }
  } catch (error) {
    console.error('加载客户列表失败:', error)
  }
}

// 编辑模态框搜索相关
const editCompanySearch = ref('')
const editCompanyDropdownOpen = ref(false)
const filteredEditCustomers = computed(() => {
  if (!editCompanySearch.value) {
    return customers.value
  }
  const query = editCompanySearch.value.toLowerCase()
  return customers.value.filter(customer =>
    customer.company.toLowerCase().includes(query)
  )
})
const selectEditCompany = (company) => {
  editingRoom.value.companyName = company
  editCompanySearch.value = company
  editCompanyDropdownOpen.value = false
}

// 新增模态框搜索相关
const addCompanySearch = ref('')
const addCompanyDropdownOpen = ref(false)
const filteredAddCustomers = computed(() => {
  if (!addCompanySearch.value) {
    return customers.value
  }
  const query = addCompanySearch.value.toLowerCase()
  return customers.value.filter(customer =>
    customer.company.toLowerCase().includes(query)
  )
})
const selectAddCompany = (company) => {
  newRoom.value.companyName = company
  addCompanySearch.value = company
  addCompanyDropdownOpen.value = false
}

const statusSummary = computed(() => {
  return {
    free: meetingRooms.value.filter(room => room.status === 'free').length,
    occupied: meetingRooms.value.filter(room => room.status === 'occupied').length,
    disabled: meetingRooms.value.filter(room => room.status === 'disabled').length
  }
})

const filteredRooms = computed(() => {
  let filtered = meetingRooms.value.filter(room => room.status === activeStatus.value)

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.trim()
    filtered = filtered.filter(room => {
      const roomNumber = room.name.match(/(\d+)号洽谈室/)
      if (roomNumber) {
        return roomNumber[1] === keyword
      }
      return false
    })
  }

  return filtered
})

const loadMeetings = async () => {
  try {
    // 加载所有洽谈室数据，不在后端筛选，前端根据 activeStatus 显示
    const response = await getMeetingList()
    if (response.code === 200) {
      meetingRooms.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载洽谈室列表失败:', error)
    showCustomMessage('加载洽谈室列表失败')
  }
}

const handleSearch = () => {
  // 前端搜索由 computed 属性处理
}

const handleRoomAction = (roomId, action) => {
  if (action === 'edit') {
    const room = meetingRooms.value.find(r => r.id === roomId)
    if (room) {
      if (room.status === 'free') {
        editingRoom.value = {
          id: room.id,
          name: room.name,
          type: room.type,
          status: 'occupied',
          companyName: '',
          quotePoints: '',
          visitRequirement: ''
        }
        editCompanySearch.value = ''
        editCompanyDropdownOpen.value = false
        showEditModal.value = true
      } else if (room.status === 'disabled') {
        // 暂停状态启用，直接恢复
        enableMeeting(roomId).then(res => {
          if (res.code === 200) {
            showCustomMessage('启用成功')
            loadMeetings()
          } else {
            showCustomMessage(res.message || '启用失败')
          }
        }).catch(err => {
          console.error('启用洽谈室失败:', err)
          showCustomMessage('启用失败')
        })
      }
    }
  } else if (action === 'pause') {
    passwordAction.value = 'pause'
    passwordRoomId.value = roomId
    showPasswordModal.value = true
  } else if (action === 'delete') {
    passwordAction.value = 'close'
    passwordRoomId.value = roomId
    showPasswordModal.value = true
  } else if (action === 'details') {
    const room = meetingRooms.value.find(r => r.id === roomId)
    if (room) {
      editingRoom.value = {
        id: room.id,
        name: room.name,
        type: room.type,
        status: room.status,
        companyName: room.companyName || '',
        quotePoints: room.quotePoints != null ? room.quotePoints : '',
        visitRequirement: room.visitRequirement || ''
      }
      editCompanySearch.value = room.companyName || ''
      editCompanyDropdownOpen.value = false
      showEditModal.value = true
    }
  }
}

const openAddModal = () => {
  newRoom.value = { name: '', status: 'free' }
  addCompanySearch.value = ''
  addCompanyDropdownOpen.value = false
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  addCompanySearch.value = ''
  addCompanyDropdownOpen.value = false
}

const saveAdd = async () => {
  if (!newRoom.value.name) {
    showCustomMessage('请输入洽谈室名称')
    return
  }

  // 设置默认状态为空闲
  newRoom.value.status = 'free'

  try {
    const response = await addMeeting(newRoom.value)
    if (response.code === 200) {
      showCustomMessage('新增成功')
      closeAddModal()
      loadMeetings()
    } else {
      showCustomMessage(response.message || '新增失败')
    }
  } catch (error) {
    console.error('新增洽谈室失败:', error)
    showCustomMessage('新增失败，请稍后重试')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editCompanySearch.value = ''
  editCompanyDropdownOpen.value = false
}

const saveEdit = async () => {
  if (!editingRoom.value.name) {
    showCustomMessage('请输入洽谈室名称')
    return
  }
  if (!editingRoom.value.type) {
    showCustomMessage('请选择类型')
    return
  }
  if (editingRoom.value.status === 'occupied' && editingRoom.value.type === 'public' && (!editingRoom.value.companyName || editingRoom.value.companyName === '')) {
    showCustomMessage('公开见客时请选择公司')
    return
  }

  try {
    const response = await updateMeeting(editingRoom.value)
    if (response.code === 200) {
      showCustomMessage('更新成功')
      closeEditModal()
      loadMeetings()
    } else {
      showCustomMessage(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新洽谈室失败:', error)
    showCustomMessage('更新失败，请稍后重试')
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordInput.value = ''
  passwordAction.value = ''
  passwordRoomId.value = null
}

const confirmPassword = async () => {
  if (passwordInput.value === '121118') {
    if (passwordAction.value === 'pause') {
      try {
        const response = await pauseMeeting(passwordRoomId.value)
        if (response.code === 200) {
          showCustomMessage('暂停成功')
          closePasswordModal()
          loadMeetings()
        } else {
          showCustomMessage(response.message || '暂停失败')
        }
      } catch (error) {
        console.error('暂停洽谈室失败:', error)
        showCustomMessage('暂停失败')
      }
    } else if (passwordAction.value === 'close') {
      try {
        const response = await closeMeeting(passwordRoomId.value)
        if (response.code === 200) {
          showCustomMessage('关闭成功')
          closePasswordModal()
          loadMeetings()
        } else {
          showCustomMessage(response.message || '关闭失败')
        }
      } catch (error) {
        console.error('关闭洽谈室失败:', error)
        showCustomMessage('关闭失败')
      }
    }
  } else {
    showCustomMessage('密码错误')
  }
}

onMounted(() => {
  loadMeetings()
  loadCustomers()
})
</script>

<style scoped>
button#add-meeting-btn > span {
  position: static;
  display: grid;
  flex-direction: column;
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