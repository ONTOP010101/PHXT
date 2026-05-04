<template>
  <div id="page-mini-app-user-center" class="slide-in" style="padding-bottom: 100px;">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>

    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-surface-900">小程序用户中心</h2>
        <p class="text-sm text-surface-400 mt-1">管理小程序端注册的厂商用户信息</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div class="card p-5 flex items-center gap-4">
        <div class="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
          <Users class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div class="text-2xl font-bold text-surface-900">{{ total }}</div>
          <div class="text-xs text-surface-400">总用户数</div>
        </div>
      </div>
      <div class="card p-5 flex items-center gap-4">
        <div class="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
          <UserCheck class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <div class="text-2xl font-bold text-surface-900">{{ todayCount }}</div>
          <div class="text-xs text-surface-400">今日新增</div>
        </div>
      </div>
      <div class="card p-5 flex items-center gap-4">
        <div class="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
          <Building2 class="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <div class="text-2xl font-bold text-surface-900">{{ companyCount }}</div>
          <div class="text-xs text-surface-400">绑定厂商数</div>
        </div>
      </div>
    </div>

    <div class="card p-4 mb-4 flex gap-3 items-center">
      <div class="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="搜索厂商名称、手机号、微信ID..."
          class="form-input"
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
      <button class="btn btn-primary" @click="loadUsers"><Search class="w-4 h-4" /> 查询</button>
      <button class="btn btn-outline" @click="resetSearch"><RotateCcw class="w-4 h-4" /> 重置</button>
    </div>

    <div class="card overflow-hidden">
      <div style="max-height: calc(100vh - 490px); overflow-y: auto;">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th class="text-center">ID</th>
              <th class="text-center">厂商名称</th>
              <th class="text-center">手机号</th>
              <th class="text-center">微信ID</th>
              <th class="text-center">注册时间</th>
              <th class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-12 text-surface-400">
                <div class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  加载中...
                </div>
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="text-center py-12 text-surface-400">
                暂无用户数据
              </td>
            </tr>
            <tr
              v-else
              v-for="user in users"
              :key="user.id"
              :class="{ 'selected-row': selectedRow === user.id }"
              style="cursor: pointer;"
              @click="selectedRow = user.id"
            >
              <td class="text-center">{{ user.id }}</td>
              <td class="text-center">
                <span class="font-medium text-surface-800">{{ user.companyName || '-' }}</span>
              </td>
              <td class="text-center text-surface-600">{{ user.phone || '-' }}</td>
              <td class="text-center">
                <span v-if="user.wxid" class="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {{ user.wxid }}
                </span>
                <span v-else class="text-surface-300 text-xs">未绑定</span>
              </td>
              <td class="text-center text-surface-400 text-xs">{{ formatDate(user.createdAt) }}</td>
              <td class="text-center">
                <div class="flex justify-center items-center gap-2">
                  <button class="btn-icon p-2 rounded-full hover:bg-blue-50 transition-colors" @click.stop="viewUser(user)">
                    <Eye class="w-4 h-4 text-blue-600" />
                  </button>
                  <button class="btn-icon p-2 rounded-full hover:bg-amber-50 transition-colors" @click.stop="editUser(user)">
                    <Edit class="w-4 h-4 text-amber-600" />
                  </button>
                  <button class="btn-icon p-2 rounded-full hover:bg-red-50 transition-colors" @click.stop="confirmDelete(user)">
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-4 border-t border-surface-100 flex items-center justify-between text-sm text-surface-400">
        <span>共 <strong class="text-surface-700">{{ total }}</strong> 条记录</span>
        <div class="flex gap-1 items-center">
          <button
            class="btn-icon w-7 h-7"
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <template v-for="(page, index) in paginationPages" :key="index">
            <span
              v-if="page === '...'"
              class="w-7 h-7 flex items-center justify-center text-xs text-surface-400"
            >
              ...
            </span>
            <button
              v-else
              class="w-7 h-7 flex items-center justify-center text-xs rounded-lg"
              :class="currentPage === page ? 'bg-primary-600 text-white' : 'text-surface-500 hover:bg-surface-100'"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>
          </template>
          <button
            class="btn-icon w-7 h-7"
            :disabled="currentPage === totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>用户详情</h3>
            <button class="modal-close" @click="closeViewModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="user-profile-card">
              <div class="user-profile-info">
                <div class="user-profile-name">{{ currentUser.companyName || '-' }}</div>
                <div class="user-profile-wxid" v-if="currentUser.wxid">{{ currentUser.wxid }}</div>
              </div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">厂商名称</div>
                <div class="info-value">{{ currentUser.companyName || '-' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">手机号</div>
                <div class="info-value">{{ currentUser.phone || '-' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">微信ID</div>
                <div class="info-value">
                  <span v-if="currentUser.wxid" class="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {{ currentUser.wxid }}
                  </span>
                  <span v-else class="text-surface-300">未绑定</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">注册时间</div>
                <div class="info-value">{{ formatDate(currentUser.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="closeViewModal">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>编辑用户信息</h3>
            <button class="modal-close" @click="closeEditModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>厂商名称</label>
              <input type="text" v-model="editData.companyName" class="form-input" placeholder="请输入厂商名称" />
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input type="text" v-model="editData.phone" class="form-input" placeholder="请输入手机号" maxlength="11" />
            </div>
            <div class="form-group">
              <label>微信ID</label>
              <input type="text" v-model="editData.wxid" class="form-input" placeholder="未绑定微信ID" readonly />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="closeEditModal">取消</button>
            <button class="btn btn-primary" @click="saveEdit">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>确认删除</h3>
            <button class="modal-close" @click="closeDeleteModal">&times;</button>
          </div>
          <div class="modal-body">
            <p>确定要删除用户 <strong>{{ deleteData.companyName }}</strong> 吗？此操作无法撤销。</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="closeDeleteModal">取消</button>
            <button class="btn btn-danger" @click="doDelete">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, UserCheck, Building2, Search, RotateCcw, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getMiniAppUsers, getMiniAppUserDetail, updateMiniAppUser, deleteMiniAppUser } from '@/api/miniapp'

const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const todayCount = ref(0)
const companyCount = ref(0)
const selectedRow = ref(null)

const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showMessage = ref(false)
const message = ref('')

const currentUser = ref({})
const editData = ref({})
const deleteData = ref({})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const paginationPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('...')
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - 2) {
      pages.push('...')
    }
    pages.push(total)
  }
  
  return pages
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const resetSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadUsers()
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getMiniAppUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value
    })
    if (res.code === 200) {
      users.value = res.data.list || []
      total.value = res.data.total || 0
      companyCount.value = res.data.total || 0
      let todayNew = 0
      const today = new Date().toDateString()
      users.value.forEach(u => {
        if (new Date(u.createdAt).toDateString() === today) todayNew++
      })
      todayCount.value = todayNew
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    showCustomMessage('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const viewUser = async (user) => {
  try {
    const res = await getMiniAppUserDetail(user.id)
    if (res.code === 200) {
      currentUser.value = res.data
      showViewModal.value = true
    }
  } catch (error) {
    currentUser.value = { ...user }
    showViewModal.value = true
  }
}

const closeViewModal = () => {
  showViewModal.value = false
}

const editUser = (user) => {
  editData.value = {
    id: user.id,
    companyName: user.companyName || '',
    phone: user.phone || '',
    wxid: user.wxid || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveEdit = async () => {
  if (!editData.value.companyName) {
    showCustomMessage('请填写厂商名称')
    return
  }
  if (!editData.value.phone) {
    showCustomMessage('请填写手机号')
    return
  }
  try {
    const res = await updateMiniAppUser(editData.value)
    if (res.code === 200) {
      closeEditModal()
      showCustomMessage('用户信息更新成功')
      loadUsers()
    } else {
      showCustomMessage(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    showCustomMessage('更新失败，请稍后重试')
  }
}

const confirmDelete = (user) => {
  deleteData.value = { ...user }
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const doDelete = async () => {
  try {
    const res = await deleteMiniAppUser(deleteData.value.id)
    if (res.code === 200) {
      closeDeleteModal()
      showCustomMessage('用户删除成功')
      loadUsers()
    } else {
      showCustomMessage(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    showCustomMessage('删除失败，请稍后重试')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 520px;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
}

.modal-close:hover {
  color: #64748b;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f8fafc;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.custom-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 24px;
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
  font-size: 15px;
  color: #374151;
  text-align: center;
  margin: 0;
}

.message-close {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  align-self: center;
}

.message-close:hover {
  background-color: #1d4ed8;
}

.selected-row {
  background-color: #eff6ff !important;
  transition: background-color 0.2s ease;
}

.user-profile-card {
  padding: 16px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
}

.user-profile-info {
  width: 100%;
}

.user-profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.user-profile-wxid {
  font-size: 12px;
  color: #94a3b8;
}

.data-table thead th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.info-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}
</style>
