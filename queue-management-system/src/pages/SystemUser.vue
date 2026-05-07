<template>
  <div id="page-system-user" class="slide-in flex flex-col" style="height: calc(100vh - 150px);">
    <div class="flex items-center justify-between mb-6 flex-shrink-0">
      <div>
        <h2 class="text-xl font-bold text-surface-900">用户管理</h2>
        <p class="text-sm text-surface-400 mt-1">管理系统用户与角色分配</p>
      </div>
      <button class="btn btn-primary" @click="handleAddUser">
        新增用户
      </button>
    </div>
    
    <!-- 新增用户模态框 -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>新增用户</h3>
            <button class="modal-close" @click="showAddModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="newUser.username" class="form-input" placeholder="请输入用户名" @input="validateUsername(newUser)" />
            </div>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" v-model="newUser.name" class="form-input" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="newUser.role" class="form-input">
                <option value="超级管理员">超级管理员</option>
                <option value="管理员">管理员</option>
                <option value="业务员">业务员</option>
                <option value="访客">访客</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="showAddModal = false">取消</button>
            <button class="btn btn-primary" @click="submitAddUser">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Filter Bar -->
    <div class="card p-4 mb-4 flex-shrink-0">
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
        <div style="flex: 1; min-width: 180px;">
          <div style="position: relative;">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" v-model="searchQuery" placeholder="搜索用户名/姓名..." style="width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; height: 36px;" @input="handleSearch" />
          </div>
        </div>
        <div style="display: flex; gap: 4px;">
          <select v-model="filterRole" style="width: 120px; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.75rem; height: 36px;">
            <option>全部角色</option><option>超级管理员</option><option>管理员</option><option>业务员</option><option>访客</option>
          </select>
          <select v-model="filterStatus" style="width: 100px; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.75rem; height: 36px;">
            <option>全部状态</option><option>启用</option><option>禁用</option>
          </select>
        </div>
        <button class="btn btn-primary" style="height: 36px; padding: 0 1rem;" @click="handleSearch">查询</button>
        <button class="btn btn-outline" style="height: 36px; padding: 0 1rem;" @click="resetSearch">重置</button>
      </div>
    </div>
    <!-- Table -->
    <div class="card overflow-hidden flex-1 flex flex-col">
      <div class="overflow-y-auto flex-1">
        <table class="data-table w-full">
          <thead class="sticky top-0 bg-white z-10"><tr>
            <th><input type="checkbox" class="w-4 h-4" /></th>
            <th>用户名</th><th>姓名</th><th>角色</th><th>最后登录</th><th>状态</th><th>操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="user in pagedUsers" :key="user.id">
              <td><input type="checkbox" class="w-4 h-4" /></td>
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.lastLogin }}</td>
              <td>
                <span :class="user.status === 'active' ? 'badge badge-green' : 'badge badge-gray'">
                  {{ user.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td>
                <div class="flex justify-center items-center gap-2">
                  <button class="btn-icon p-2 rounded-full hover:bg-gray-100 transition-colors" @click="handleUserAction(user.id, 'edit')">
                    <Edit class="w-4 h-4 text-gray-600" />
                  </button>
                  <button class="btn-icon p-2 rounded-full hover:bg-gray-100 transition-colors" @click="handleUserAction(user.id, 'reset')">
                    <RefreshCw class="w-4 h-4 text-gray-600" />
                  </button>
                  <button class="btn-icon p-2 rounded-full hover:bg-gray-100 transition-colors" :disabled="user.role === '超级管理员'" @click="handleUserAction(user.id, 'delete')">
                    <Trash2 class="w-4 h-4" :class="user.role === '超级管理员' ? 'text-gray-300' : 'text-red-500'" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-4 border-t border-surface-100 flex items-center justify-between text-sm text-surface-400 flex-shrink-0">
        <span>共 <strong class="text-surface-700">{{ total }}</strong> 个用户</span>
        <div class="flex gap-1">
          <button class="btn-icon w-7 h-7" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)"><ChevronLeft class="w-3.5 h-3.5" /></button>
          <button v-for="page in totalPages" :key="page" class="w-7 h-7 flex items-center justify-center text-xs rounded-lg" :class="currentPage === page ? 'bg-primary-600 text-white' : 'text-surface-500 hover:bg-surface-100'" @click="handlePageChange(page)">{{ page }}</button>
          <button class="btn-icon w-7 h-7" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)"><ChevronRight class="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>

    <!-- 编辑用户模态框 -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>编辑用户</h3>
            <button class="modal-close" @click="showEditModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="editUser.username" class="form-input" placeholder="请输入用户名" @input="validateUsername(editUser)" />
            </div>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" v-model="editUser.name" class="form-input" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="editUser.role" class="form-input">
                <option value="超级管理员">超级管理员</option>
                <option value="管理员">管理员</option>
                <option value="业务员">业务员</option>
                <option value="访客">访客</option>
              </select>
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" v-model="editUser.password" class="form-input" placeholder="请输入新密码（不填则不修改）" />
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="editUser.status" class="form-input">
                <option value="active">启用</option>
                <option value="disabled">禁用</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="showEditModal = false">取消</button>
            <button class="btn btn-primary" @click="submitEditUser">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 重置密码模态框 -->
    <Teleport to="body">
      <div v-if="showResetModal" class="modal-overlay" @click="showResetModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>重置密码</h3>
            <button class="modal-close" @click="showResetModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>确定要重置用户的密码吗？</p>
            <p class="text-sm text-surface-400">重置后密码将变为默认密码：123456</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="showResetModal = false">取消</button>
            <button class="btn btn-primary" @click="confirmResetPassword">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 删除用户模态框 -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>删除用户</h3>
            <button class="modal-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>确定要删除该用户吗？</p>
            <p class="text-sm text-surface-400">此操作不可恢复</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="showDeleteModal = false">取消</button>
            <button class="btn btn-danger" @click="confirmDeleteUser">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- 消息提示框 -->
    <Teleport to="body">
      <div v-if="showMessage" class="custom-message" @click="closeMessage">
        <div class="message-content" v-html="sanitizedMessage"></div>
        <button class="message-close" @click.stop="closeMessage">确定</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { UserPlus, Search, RotateCcw, Edit, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getUserList, addUser, updateUser, deleteUser, resetPassword } from '@/api/user'

const users = ref([])
const total = ref(0)
const loading = ref(false)

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showResetModal = ref(false)

const showMessage = ref(false)
const message = ref('')
const sanitizedMessage = computed(() => {
  return message.value.replace(/\n/g, '<br>')
})

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const validateUsername = (user) => {
  user.username = user.username.replace(/[^a-zA-Z0-9]/g, '')
}

const closeMessage = () => {
  showMessage.value = false
}

const newUser = ref({
  username: '',
  name: '',
  role: '管理员'
})

const editUser = ref({
  id: '',
  username: '',
  name: '',
  role: '',
  password: '',
  status: ''
})

const deleteUserId = ref(null)
const resetUserId = ref(null)
const searchQuery = ref('')
const filterRole = ref('全部角色')
const filterStatus = ref('全部状态')

const currentPage = ref(1)
const pageSize = ref(200)

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value,
      role: filterRole.value,
      status: filterStatus.value
    })
    users.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取用户列表失败', error)
    showCustomMessage('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

const resetSearch = () => {
  searchQuery.value = ''
  filterRole.value = '全部角色'
  filterStatus.value = '全部状态'
  currentPage.value = 1
  fetchUserList()
}

const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchUserList()
}

const handleUserAction = (userId, action) => {
  const user = users.value.find(u => u.id === userId)
  if (!user) return
  
  switch (action) {
    case 'edit':
      editUser.value = { ...user, password: '' }
      showEditModal.value = true
      break
    case 'reset':
      resetUserId.value = userId
      showResetModal.value = true
      break
    case 'delete':
      deleteUserId.value = userId
      showDeleteModal.value = true
      break
  }
}

const handleAddUser = () => {
  newUser.value = {
    username: '',
    name: '',
    role: '管理员'
  }
  showAddModal.value = true
}

const submitAddUser = async () => {
  if (!newUser.value.username || !newUser.value.name) {
    showCustomMessage('请填写完整信息')
    return
  }
  
  try {
    await addUser(newUser.value)
    showAddModal.value = false
    showCustomMessage('添加成功')
    fetchUserList()
    newUser.value = {
      username: '',
      name: '',
      role: '管理员'
    }
  } catch (error) {
    showCustomMessage(error?.message || '添加失败')
  }
}

const submitEditUser = async () => {
  if (!editUser.value.username || !editUser.value.name) {
    showCustomMessage('请填写完整信息')
    return
  }
  
  try {
    await updateUser(editUser.value)
    showEditModal.value = false
    showCustomMessage('更新成功')
    fetchUserList()
  } catch (error) {
    showCustomMessage(error?.message || '更新失败')
  }
}

const confirmResetPassword = async () => {
  try {
    const res = await resetPassword(resetUserId.value)
    showResetModal.value = false
    showCustomMessage(res.message)
  } catch (error) {
    showCustomMessage(error?.message || '重置失败')
  }
}

const confirmDeleteUser = async () => {
  try {
    await deleteUser(deleteUserId.value)
    showDeleteModal.value = false
    showCustomMessage('删除成功')
    fetchUserList()
  } catch (error) {
    showCustomMessage(error?.message || '删除失败')
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
#page-system-user .card:nth-child(2) select {
  width: 80px !important;
  max-width: 80px !important;
  min-width: 80px !important;
  flex-shrink: 0 !important;
  font-size: 12px !important;
  padding: 0.25rem 0.5rem !important;
  height: 32px !important;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.data-table th, .data-table td {
  text-align: center;
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
  max-width: 500px;
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
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background-color: #f9fafb;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
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
