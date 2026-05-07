<template>
  <div id="page-system-role" class="slide-in">
    <div v-if="showMessage" class="custom-message" @click="closeMessage">
      <div class="message-content">{{ message }}</div>
      <button class="message-close" @click.stop="closeMessage">确定</button>
    </div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-surface-900">角色管理</h2>
        <p class="text-sm text-surface-400 mt-1">配置系统角色与权限分级管控</p>
      </div>
      <button id="add-role-btn" class="btn btn-primary" @click="showAddRoleModal = true">
        <Plus class="w-4 h-4" /> 新增角色
      </button>
    </div>
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-4 card p-5">
        <h3 class="font-semibold text-surface-800 mb-4">角色列表</h3>
        <div class="space-y-2" id="role-list">
          <div 
            v-for="role in roles" 
            :key="role.id"
            :class="['p-3 rounded-xl cursor-pointer transition-colors', activeRoleId === role.id ? 'bg-primary-50 border border-primary-200' : 'bg-surface-50 border border-surface-200 hover:border-primary-200 hover:bg-primary-50']"
            @click="selectRole(role.id)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div :class="['w-7 h-7 rounded-lg flex items-center justify-center', getRoleIconBg(role.id)]">
                  <component :is="getRoleIcon(role.id)" class="w-3.5 h-3.5 text-white" />
                </div>
                <span :class="['text-sm font-semibold', activeRoleId === role.id ? 'text-primary-700' : 'text-surface-700']">{{ role.name }}</span>
              </div>
              <span :class="['badge', getRoleBadgeClass(role.id)]">{{ getRoleBadgeText(role.id) }}</span>
            </div>
            <div class="text-xs text-surface-400 mt-1.5 ml-9">{{ getRoleUserCount(role.name) }} 名用户</div>
          </div>
        </div>
      </div>
      <div class="col-span-8 card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-surface-800">权限配置 — <span class="text-primary-600">{{ currentRoleName }}</span></h3>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4" :checked="allPermissionsChecked" @change="toggleAllPermissions" />
              <span class="text-sm text-surface-600">全选</span>
            </label>
            <button class="text-sm text-primary-600 hover:text-primary-700 cursor-pointer" @click="clearAllPermissions">全不选</button>
          </div>
        </div>
        <div class="space-y-3" id="perm-tree">
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.home?.enable" @change="updatePermission('home', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">首页</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.home?.view" @change="updatePermission('home', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看数据</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.home?.export" @change="updatePermission('home', 'export', $event.target.checked)" />
                  <span class="text-sm text-surface-600">导出数据</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.customer?.enable" @change="updatePermission('customer', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">客户资料</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.customer?.view" @change="updatePermission('customer', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.customer?.add" @change="updatePermission('customer', 'add', $event.target.checked)" />
                  <span class="text-sm text-surface-600">新增</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.customer?.edit" @change="updatePermission('customer', 'edit', $event.target.checked)" />
                  <span class="text-sm text-surface-600">编辑</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.customer?.delete" @change="updatePermission('customer', 'delete', $event.target.checked)" />
                  <span class="text-sm text-surface-600">删除</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.enable" @change="updatePermission('meeting', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">洽谈室管理</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.view" @change="updatePermission('meeting', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.add" @change="updatePermission('meeting', 'add', $event.target.checked)" />
                  <span class="text-sm text-surface-600">新增</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.edit" @change="updatePermission('meeting', 'edit', $event.target.checked)" />
                  <span class="text-sm text-surface-600">编辑</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.delete" @change="updatePermission('meeting', 'delete', $event.target.checked)" />
                  <span class="text-sm text-surface-600">删除</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.enable" @change="updatePermission('meeting', 'meetingEnable', $event.target.checked)" />
                  <span class="text-sm text-surface-600">启用</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.close" @change="updatePermission('meeting', 'close', $event.target.checked)" />
                  <span class="text-sm text-surface-600">关闭</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.meeting?.pause" @change="updatePermission('meeting', 'pause', $event.target.checked)" />
                  <span class="text-sm text-surface-600">暂停</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.publicBusiness?.enable" @change="updatePermission('publicBusiness', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">公开见客业务</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.publicBusiness?.view" @change="updatePermission('publicBusiness', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.publicBusiness?.call" @change="updatePermission('publicBusiness', 'call', $event.target.checked)" />
                  <span class="text-sm text-surface-600">叫号</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.publicBusiness?.register" @change="updatePermission('publicBusiness', 'register', $event.target.checked)" />
                  <span class="text-sm text-surface-600">登记</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.publicBusiness?.cancel" @change="updatePermission('publicBusiness', 'cancel', $event.target.checked)" />
                  <span class="text-sm text-surface-600">作废</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.appointBusiness?.enable" @change="updatePermission('appointBusiness', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">专点见客预约</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.appointBusiness?.view" @change="updatePermission('appointBusiness', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.appointBusiness?.add" @change="updatePermission('appointBusiness', 'add', $event.target.checked)" />
                  <span class="text-sm text-surface-600">新增</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.appointBusiness?.call" @change="updatePermission('appointBusiness', 'call', $event.target.checked)" />
                  <span class="text-sm text-surface-600">叫号</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.appointBusiness?.complete" @change="updatePermission('appointBusiness', 'complete', $event.target.checked)" />
                  <span class="text-sm text-surface-600">完成</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.selfQueue?.enable" @change="updatePermission('selfQueue', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">自助排号管理</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.selfQueue?.view" @change="updatePermission('selfQueue', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.selfQueue?.queue" @change="updatePermission('selfQueue', 'queue', $event.target.checked)" />
                  <span class="text-sm text-surface-600">排号</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.selfQueue?.dispatch" @change="updatePermission('selfQueue', 'dispatch', $event.target.checked)" />
                  <span class="text-sm text-surface-600">调度</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.display?.enable" @change="updatePermission('display', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">排号显示大屏</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.display?.view" @change="updatePermission('display', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.display?.config" @change="updatePermission('display', 'config', $event.target.checked)" />
                  <span class="text-sm text-surface-600">配置</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.display?.control" @change="updatePermission('display', 'control', $event.target.checked)" />
                  <span class="text-sm text-surface-600">控制</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.miniApp?.enable" @change="updatePermission('miniApp', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">小程序配置</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.miniApp?.view" @change="updatePermission('miniApp', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.miniApp?.config" @change="updatePermission('miniApp', 'config', $event.target.checked)" />
                  <span class="text-sm text-surface-600">配置</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.role?.enable" @change="updatePermission('role', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">角色管理</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.role?.view" @change="updatePermission('role', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.role?.add" @change="updatePermission('role', 'add', $event.target.checked)" />
                  <span class="text-sm text-surface-600">新增</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.role?.edit" @change="updatePermission('role', 'edit', $event.target.checked)" />
                  <span class="text-sm text-surface-600">编辑</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.role?.delete" @change="updatePermission('role', 'delete', $event.target.checked)" />
                  <span class="text-sm text-surface-600">删除</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.role?.permission" @change="updatePermission('role', 'permission', $event.target.checked)" />
                  <span class="text-sm text-surface-600">权限</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.user?.enable" @change="updatePermission('user', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">用户管理</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.user?.view" @change="updatePermission('user', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.user?.add" @change="updatePermission('user', 'add', $event.target.checked)" />
                  <span class="text-sm text-surface-600">新增</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.user?.edit" @change="updatePermission('user', 'edit', $event.target.checked)" />
                  <span class="text-sm text-surface-600">编辑</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.user?.delete" @change="updatePermission('user', 'delete', $event.target.checked)" />
                  <span class="text-sm text-surface-600">删除</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.user?.resetPwd" @change="updatePermission('user', 'resetPwd', $event.target.checked)" />
                  <span class="text-sm text-surface-600">重置密码</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.systemLog?.enable" @change="updatePermission('systemLog', 'enable', $event.target.checked)" />
                <span class="font-medium text-surface-700">系统日志</span>
              </div>
              <div class="ml-6 flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.systemLog?.view" @change="updatePermission('systemLog', 'view', $event.target.checked)" />
                  <span class="text-sm text-surface-600">查看</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="w-4 h-4" :checked="currentRolePermissions.systemLog?.clear" @change="updatePermission('systemLog', 'clear', $event.target.checked)" />
                  <span class="text-sm text-surface-600">清除</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button class="btn btn-primary" @click="savePermissions">
              <Save class="w-4 h-4" /> 保存权限
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddRoleModal" class="modal-overlay" @click="closeAddRoleModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ editingRole ? '编辑角色' : '新增角色' }}</h3>
            <button class="modal-close" @click="closeAddRoleModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>角色名称</label>
              <input v-model="newRoleName" type="text" class="form-input" placeholder="请输入角色名称" />
            </div>
            <div class="form-group">
              <label>角色描述</label>
              <textarea v-model="newRoleDescription" class="form-input" placeholder="请输入角色描述" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeAddRoleModal">取消</button>
            <button class="btn btn-primary" @click="saveRole">{{ editingRole ? '保存修改' : '确认添加' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { Crown, UserCheck, Eye, Plus, Save, Shield, User } from 'lucide-vue-next'
import { getRoleList, updateRole, addRole } from '../api/role'
import { getUserList } from '../api/user'

const activeRoleId = ref(1)
const showMessage = ref(false)
const message = ref('')
const roles = ref([])
const users = ref([])
const showAddRoleModal = ref(false)
const newRoleName = ref('')
const newRoleDescription = ref('')
const editingRole = ref(null)

const defaultPermissions = {
  home: { enable: false, view: false, export: false },
  customer: { enable: false, view: false, add: false, edit: false, delete: false },
  meeting: { enable: false, view: false, add: false, edit: false, delete: false, meetingEnable: false, close: false, pause: false },
  publicBusiness: { enable: false, view: false, call: false, register: false, cancel: false },
  appointBusiness: { enable: false, view: false, add: false, call: false, complete: false },
  selfQueue: { enable: false, view: false, queue: false, dispatch: false },
  display: { enable: false, view: false, config: false, control: false },
  miniApp: { enable: false, view: false, config: false },
  role: { enable: false, view: false, add: false, edit: false, delete: false, permission: false },
  user: { enable: false, view: false, add: false, edit: false, delete: false, resetPwd: false },
  systemLog: { enable: false, view: false, clear: false }
}

const originalRolePermissions = ref({})
const tempRolePermissions = ref({})

const showCustomMessage = (msg) => {
  message.value = msg
  showMessage.value = true
}

const closeMessage = () => {
  showMessage.value = false
}

const getRoleIcon = (roleId) => {
  const icons = [Crown, Shield, UserCheck, Eye]
  const index = (roleId - 1) % icons.length
  return markRaw(icons[index]) || User
}

const getRoleIconBg = (roleId) => {
  const colors = ['bg-primary-600', 'bg-blue-500', 'bg-accent-500', 'bg-warn-500']
  const index = (roleId - 1) % colors.length
  return colors[index]
}

const getRoleBadgeClass = (roleId) => {
  const classes = ['badge-blue', 'badge-blue', 'badge-green', 'badge-orange']
  const index = (roleId - 1) % classes.length
  return classes[index]
}

const getRoleBadgeText = (roleId) => {
  const texts = ['全部权限', '管理权限', '部分权限', '只读权限']
  const index = (roleId - 1) % texts.length
  return texts[index]
}

const getRoleUserCount = (roleName) => {
  return users.value.filter(user => user.role === roleName).length
}

const currentRoleName = computed(() => {
  const role = roles.value.find(r => r.id === activeRoleId.value)
  return role ? role.name : '超级管理员'
})

const currentRolePermissions = computed(() => {
  return tempRolePermissions.value[activeRoleId.value] || defaultPermissions
})

const allPermissionsChecked = computed(() => {
  const rolePerms = tempRolePermissions.value[activeRoleId.value]
  if (!rolePerms) return false
  return Object.values(rolePerms).every(module => module.enable)
})

const mergeWithDefaults = (permissions) => {
  const merged = JSON.parse(JSON.stringify(defaultPermissions))
  if (permissions) {
    Object.keys(permissions).forEach(module => {
      if (merged[module]) {
        Object.keys(permissions[module]).forEach(perm => {
          merged[module][perm] = permissions[module][perm]
        })
      } else {
        merged[module] = { ...permissions[module] }
      }
    })
  }
  return merged
}

const updatePermission = (module, permission, value) => {
  if (!tempRolePermissions.value[activeRoleId.value]) {
    tempRolePermissions.value[activeRoleId.value] = JSON.parse(JSON.stringify(defaultPermissions))
  }
  if (!tempRolePermissions.value[activeRoleId.value][module]) {
    tempRolePermissions.value[activeRoleId.value][module] = { ...defaultPermissions[module] }
  }
  tempRolePermissions.value[activeRoleId.value][module][permission] = value
}

const toggleAllPermissions = (event) => {
  const checked = event.target.checked
  const rolePerms = tempRolePermissions.value[activeRoleId.value]
  if (!rolePerms) {
    tempRolePermissions.value[activeRoleId.value] = JSON.parse(JSON.stringify(defaultPermissions))
  }
  Object.keys(tempRolePermissions.value[activeRoleId.value]).forEach(module => {
    Object.keys(tempRolePermissions.value[activeRoleId.value][module]).forEach(perm => {
      tempRolePermissions.value[activeRoleId.value][module][perm] = checked
    })
  })
}

const clearAllPermissions = () => {
  if (!tempRolePermissions.value[activeRoleId.value]) {
    tempRolePermissions.value[activeRoleId.value] = JSON.parse(JSON.stringify(defaultPermissions))
  }
  Object.keys(tempRolePermissions.value[activeRoleId.value]).forEach(module => {
    Object.keys(tempRolePermissions.value[activeRoleId.value][module]).forEach(perm => {
      tempRolePermissions.value[activeRoleId.value][module][perm] = false
    })
  })
}

const savePermissions = async () => {
  try {
    const permissions = tempRolePermissions.value[activeRoleId.value]
    const response = await updateRole({
      id: activeRoleId.value,
      permissions
    })
    if (response.code === 200) {
      originalRolePermissions.value[activeRoleId.value] = JSON.parse(JSON.stringify(permissions))
      showCustomMessage('权限保存成功')
    } else {
      showCustomMessage(response.message || '保存失败')
    }
  } catch (error) {
    console.error('Save permissions error:', error)
    showCustomMessage('保存失败，请稍后重试')
  }
}

const selectRole = (roleId) => {
  activeRoleId.value = roleId
  if (!tempRolePermissions.value[roleId]) {
    const merged = mergeWithDefaults(originalRolePermissions.value[roleId])
    tempRolePermissions.value[roleId] = merged
  }
}

const loadRoles = async () => {
  try {
    const response = await getRoleList()
    if (response.code === 200) {
      roles.value = response.data
      if (roles.value.length > 0) {
        activeRoleId.value = roles.value[0].id
        roles.value.forEach(role => {
          const merged = mergeWithDefaults(role.permissions)
          originalRolePermissions.value[role.id] = merged
          tempRolePermissions.value[role.id] = JSON.parse(JSON.stringify(merged))
        })
      }
    }
  } catch (error) {
    console.error('Load roles error:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await getUserList({ page: 1, pageSize: 100 })
    if (response.code === 200) {
      users.value = response.data.list || []
    }
  } catch (error) {
    console.error('Load users error:', error)
  }
}

const closeAddRoleModal = () => {
  showAddRoleModal.value = false
  newRoleName.value = ''
  newRoleDescription.value = ''
  editingRole.value = null
}

const saveRole = async () => {
  if (!newRoleName.value.trim()) {
    showCustomMessage('请输入角色名称')
    return
  }
  try {
    if (editingRole.value) {
      const response = await updateRole({
        id: editingRole.value.id,
        name: newRoleName.value,
        description: newRoleDescription.value
      })
      if (response.code === 200) {
        showCustomMessage('角色修改成功')
        closeAddRoleModal()
        loadRoles()
      } else {
        showCustomMessage(response.message || '修改失败')
      }
    } else {
      const response = await addRole({
        name: newRoleName.value,
        description: newRoleDescription.value,
        permissions: JSON.parse(JSON.stringify(defaultPermissions))
      })
      if (response.code === 200) {
        showCustomMessage('角色添加成功')
        closeAddRoleModal()
        loadRoles()
      } else {
        showCustomMessage(response.message || '添加失败')
      }
    }
  } catch (error) {
    console.error('Save role error:', error)
    showCustomMessage('操作失败，请稍后重试')
  }
}

onMounted(() => {
  loadRoles()
  loadUsers()
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  line-height: 1;
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
  border-top: 1px solid #e2e8f0;
}
</style>