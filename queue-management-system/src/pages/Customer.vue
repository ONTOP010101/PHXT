<template>
  <div id="page-customer" class="slide-in">
    <!-- 自定义提示框 -->
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-surface-900">客户资料</h2>
        <p class="text-sm text-surface-400 mt-1">管理客户基础信息与历史记录</p>
      </div>
      <button v-if="hasPermission('customer', 'add')" id="add-customer-btn" class="btn btn-primary" @click="openAddCustomerModal">
        <UserPlus class="w-4 h-4" /> 新增客户
      </button>
    </div>
    <!-- Filter Bar -->
    <div class="card p-4 mb-4 flex gap-3 items-center">
      <div class="flex-1 max-w-xs">
        <input 
          type="text" 
          placeholder="搜索客户编号、公司名称、联系人或电话..." 
          class="form-input" 
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
      <button class="btn btn-primary"><Search class="w-4 h-4" /> 查询</button>
      <button class="btn btn-outline" @click="resetSearch"><RotateCcw class="w-4 h-4" /> 重置</button>
    </div>
    <!-- Table -->
    <div class="card overflow-hidden" style="height: calc(100vh - 300px);">
      <div style="height: calc(100% - 60px); overflow-y: auto;">
        <table class="data-table w-full">
        <thead><tr>
          <th class="text-center"><input type="checkbox" class="w-4 h-4" v-model="selectAll" @change="handleSelectAll" /></th>
          <th class="text-center">客户编号</th>
          <th class="text-center">公司名称</th>
          <th class="text-center">联系人</th>
          <th class="text-center">联系电话</th>
          <th class="text-center">操作</th>
        </tr></thead>
        <tbody id="customer-table-body">
          <tr 
            v-for="customer in pagedCustomers" 
            :key="customer.id"
            @click="handleRowClick(customer)"
            :class="{ 'selected-row': selectedRow === customer.id }"
            style="cursor: pointer;"
          >
            <td class="text-center"><input type="checkbox" class="w-4 h-4" v-model="selectedCustomers" :value="customer.id" @click.stop="updateSelectAll" /></td>
            <td class="text-center">{{ customer.id }}</td>
            <td class="text-center">{{ customer.companyName }}</td>
            <td class="text-center">{{ customer.contactPerson || '-' }}</td>
            <td class="text-center">{{ customer.phone }}</td>
            <td class="text-center">
              <div class="flex justify-center items-center gap-2">
                <button v-if="hasPermission('customer', 'view')" class="btn-icon p-2 rounded-full hover:bg-gray-100 transition-colors" @click.stop="viewCustomer(customer)">
                  <Eye class="w-4 h-4 text-gray-600" />
                </button>
                <button v-if="hasPermission('customer', 'edit')" class="btn-icon p-2 rounded-full hover:bg-gray-100 transition-colors" @click.stop="editCustomer(customer)">
                  <Edit class="w-4 h-4 text-gray-600" />
                </button>
                <button v-if="hasPermission('customer', 'delete')" class="btn-icon p-2 rounded-full hover:bg-gray-100 transition-colors" @click.stop="deleteCustomer(customer)">
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
          <button 
            v-for="page in totalPages" 
            :key="page"
            class="w-7 h-7 flex items-center justify-center text-xs rounded-lg"
            :class="currentPage === page ? 'bg-primary-600 text-white' : 'text-surface-500 hover:bg-surface-100'"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
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

    <!-- 新增客户模态框 -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>新增客户</h3>
            <button class="modal-close" @click="closeAddModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>客户编号</label>
              <input type="text" v-model="newCustomer.id" class="form-input" placeholder="自动生成" readonly />
            </div>
            <div class="form-group">
              <label>公司名称</label>
              <input type="text" v-model="newCustomer.companyName" class="form-input" placeholder="请输入公司名称" />
            </div>
            <div class="form-group">
              <label>联系人</label>
              <input type="text" v-model="newCustomer.contactPerson" class="form-input" placeholder="请输入联系人姓名" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="text" v-model="newCustomer.phone" class="form-input" placeholder="请输入联系电话" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="closeAddModal">取消</button>
            <button class="btn btn-primary" @click="saveCustomer">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 查看客户模态框 -->
    <Teleport to="body">
      <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>客户详情</h3>
            <button class="modal-close" @click="closeViewModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>客户编号</label>
              <input type="text" v-model="currentCustomer.id" class="form-input" readonly />
            </div>
            <div class="form-group">
              <label>公司名称</label>
              <input type="text" v-model="currentCustomer.companyName" class="form-input" readonly />
            </div>
            <div class="form-group">
              <label>联系人</label>
              <input type="text" v-model="currentCustomer.contactPerson" class="form-input" readonly />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="text" v-model="currentCustomer.phone" class="form-input" readonly />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="closeViewModal">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 编辑客户模态框 -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>编辑客户</h3>
            <button class="modal-close" @click="closeEditModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>客户编号</label>
              <input type="text" v-model="editCustomerData.id" class="form-input" readonly />
            </div>
            <div class="form-group">
              <label>公司名称</label>
              <input type="text" v-model="editCustomerData.companyName" class="form-input" placeholder="请输入公司名称" />
            </div>
            <div class="form-group">
              <label>联系人</label>
              <input type="text" v-model="editCustomerData.contactPerson" class="form-input" placeholder="请输入联系人姓名" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="text" v-model="editCustomerData.phone" class="form-input" placeholder="请输入联系电话" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="closeEditModal">取消</button>
            <button class="btn btn-primary" @click="updateCustomer">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 删除确认模态框 -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>确认删除</h3>
            <button class="modal-close" @click="closeDeleteModal">&times;</button>
          </div>
          <div class="modal-body">
            <p>确定要删除客户 <strong>{{ deleteCustomerData.companyName }}</strong> 吗？</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" @click="closeDeleteModal">取消</button>
            <button class="btn btn-danger" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { UserPlus, Search, RotateCcw, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useUserStore } from '@/store/modules/user'
import { getCustomerList, addCustomer, updateCustomer as updateCustomerApi, deleteCustomer as deleteCustomerApi } from '../api/customer'
import { addLog } from '../api/log'

const userStore = useUserStore()

const hasPermission = (module, permission) => {
  const permissions = userStore.userInfo.permissions || {}
  const modulePermissions = permissions[module] || {}
  return modulePermissions[permission] === true
}

const customers = ref([])
const searchQuery = ref('')
const showAddModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showMessage = ref(false)
const message = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 选中行
const selectedRow = ref(null)

// 全选相关
const selectAll = ref(false)
const selectedCustomers = ref([])

const newCustomer = ref({
  id: '',
  companyName: '',
  contactPerson: '',
  phone: ''
})

const currentCustomer = ref({})
const editCustomerData = ref({})
const deleteCustomerData = ref({})

// 分页处理 - 直接使用后端返回的数据
const pagedCustomers = computed(() => {
  return customers.value
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const handleSearch = () => {
  loadCustomers()
}

const resetSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadCustomers()
}

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const originalCustomerData = ref({})

const recordCustomerLog = async (action, customer, status = 1, extraDetail = '') => {
  try {
    let detail = ''
    if (customer) {
      const parts = [`客户编号: ${customer.id || '-'}`]
      if (customer.companyName) parts.push(`公司名称: ${customer.companyName}`)
      if (customer.contactPerson) parts.push(`联系人: ${customer.contactPerson}`)
      if (customer.phone) parts.push(`联系电话: ${customer.phone}`)
      detail = parts.join(', ')
    }
    if (extraDetail) {
      detail = detail ? detail + ' | ' + extraDetail : extraDetail
    }
    await addLog({
      module: '客户资料',
      action: action,
      targetId: customer?.id?.toString() || '',
      detail: detail,
      status: status
    })
  } catch (error) {
    console.error('记录日志失败:', error)
  }
}

const buildChangeDetail = (original, updated) => {
  const changes = []
  const fieldNames = { companyName: '公司名称', contactPerson: '联系人', phone: '联系电话' }
  for (const key of Object.keys(fieldNames)) {
    const oldVal = original[key] || '-'
    const newVal = updated[key] || '-'
    if (oldVal !== newVal) {
      changes.push(`${fieldNames[key]}: ${oldVal} → ${newVal}`)
    }
  }
  return changes.length > 0 ? '变更内容: ' + changes.join(', ') : '无字段变更'
}

// 分页方法
const handlePageChange = (page) => {
  currentPage.value = page
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 处理行点击
const handleRowClick = (customer) => {
  selectedRow.value = customer.id
}

// 全选功能
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedCustomers.value = customers.value.map(c => c.id)
  } else {
    selectedCustomers.value = []
  }
}

// 更新全选状态
const updateSelectAll = () => {
  selectAll.value = customers.value.length > 0 && 
    customers.value.every(c => selectedCustomers.value.includes(c.id))
}

const loadCustomers = async () => {
  try {
    const response = await getCustomerList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value
    })
    if (response.code === 200) {
      customers.value = response.data.list || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('Load customers error:', error)
    showCustomMessage('加载客户列表失败')
  }
}

// 新增客户相关方法
const openAddCustomerModal = () => {
  newCustomer.value = {
    id: '',
    companyName: '',
    contactPerson: '',
    phone: ''
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const saveCustomer = async () => {
  if (!newCustomer.value.companyName) {
    showCustomMessage('请填写公司名称')
    return
  }
  
  try {
    const response = await addCustomer({
      companyName: newCustomer.value.companyName,
      contactPerson: newCustomer.value.contactPerson,
      phone: newCustomer.value.phone
    })
    if (response.code === 200) {
      const newCustomerData = { ...newCustomer.value, id: response.data?.id || '' }
      await recordCustomerLog('新增客户', newCustomerData, 1)
      closeAddModal()
      showCustomMessage('客户添加成功')
      loadCustomers()
    } else {
      await recordCustomerLog('新增客户', newCustomer.value, 0)
      showCustomMessage(response.message || '添加失败')
    }
  } catch (error) {
    await recordCustomerLog('新增客户', newCustomer.value, 0)
    console.error('Save customer error:', error)
    showCustomMessage('添加失败，请稍后重试')
  }
}

// 查看客户相关方法
const viewCustomer = (customer) => {
  currentCustomer.value = { ...customer }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
}

// 编辑客户相关方法
const editCustomer = (customer) => {
  originalCustomerData.value = { ...customer }
  editCustomerData.value = { ...customer }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const updateCustomer = async () => {
  if (!editCustomerData.value.companyName) {
    showCustomMessage('请填写公司名称')
    return
  }
  
  try {
    const response = await updateCustomerApi({
      id: editCustomerData.value.id,
      companyName: editCustomerData.value.companyName,
      contactPerson: editCustomerData.value.contactPerson,
      phone: editCustomerData.value.phone
    })
    if (response.code === 200) {
      const changeDetail = buildChangeDetail(originalCustomerData.value, editCustomerData.value)
      await recordCustomerLog('修改客户', editCustomerData.value, 1, changeDetail)
      closeEditModal()
      showCustomMessage('客户信息更新成功')
      loadCustomers()
    } else {
      await recordCustomerLog('修改客户', editCustomerData.value, 0)
      showCustomMessage(response.message || '更新失败')
    }
  } catch (error) {
    await recordCustomerLog('修改客户', editCustomerData.value, 0)
    console.error('Update customer error:', error)
    showCustomMessage('更新失败，请稍后重试')
  }
}

// 删除客户相关方法
const deleteCustomer = (customer) => {
  deleteCustomerData.value = { ...customer }
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  try {
    const response = await deleteCustomerApi(deleteCustomerData.value.id)
    if (response.code === 200) {
      await recordCustomerLog('删除客户', deleteCustomerData.value, 1)
      closeDeleteModal()
      showCustomMessage('客户删除成功')
      loadCustomers()
    } else {
      await recordCustomerLog('删除客户', deleteCustomerData.value, 0)
      showCustomMessage(response.message || '删除失败')
    }
  } catch (error) {
    await recordCustomerLog('删除客户', deleteCustomerData.value, 0)
    console.error('Delete customer error:', error)
    showCustomMessage('删除失败，请稍后重试')
  }
}

onMounted(() => {
  loadCustomers()
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
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}

/* 自定义提示框样式 */
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
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  align-self: center;
}

.message-close:hover {
  background-color: #1e3a8a;
}

/* 选中行样式 */
.selected-row {
  background-color: #e0f2fe !important;
  transition: background-color 0.2s ease;
}
</style>