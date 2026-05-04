<template>
  <header class="h-16 bg-white border-b border-surface-200 flex items-center px-6 gap-4 fixed top-0 left-0 right-0 z-100">
    <div class="flex items-center gap-3 w-60">
      <div class="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
        <Layers class="w-4 h-4 text-white" />
      </div>
      <span class="font-bold text-surface-900 text-base">个人排号测试</span>
    </div>

    <!-- Breadcrumb -->
    <div class="flex-1 flex items-center gap-2 text-sm text-surface-400">
      <Home class="w-3.5 h-3.5" />
      <span>/</span>
      <span id="breadcrumb-text" class="text-surface-600 font-medium">{{ breadcrumbText }}</span>
    </div>

    <!-- Right area -->
    <div class="flex items-center gap-3">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input type="text" placeholder="搜索功能..." class="bg-surface-100 border border-surface-200 rounded-lg pl-9 pr-4 py-2 text-sm w-48 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>


      <!-- Avatar -->
      <div class="flex items-center gap-2 pl-2 border-l border-surface-200">
        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">{{ avatarInitial }}</div>
        <div>
          <div class="text-sm font-medium text-surface-700">{{ userName }}</div>
          <div class="text-xs text-surface-400">{{ roleName }}</div>
        </div>
        <button id="logout-btn" class="ml-1 btn-icon" @click="handleLogout">
          <LogOut class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Notifications Panel -->
    <div id="notif-panel" class="notif-panel" :class="{ open: showNotifications }">
      <div class="p-4 border-b border-surface-100 flex items-center justify-between">
        <span class="font-semibold text-surface-800">通知消息</span>
        <span class="badge badge-blue">4 条未读</span>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <div class="p-4 border-b border-surface-50 hover:bg-surface-50 cursor-pointer">
          <div class="flex gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BellRing class="w-4 h-4 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-surface-800">新排号提醒</div>
              <div class="text-xs text-surface-400 mt-0.5">客户张三已完成排号，号码 A-021</div>
              <div class="text-xs text-surface-300 mt-1">2分钟前</div>
            </div>
          </div>
        </div>
        <div class="p-4 border-b border-surface-50 hover:bg-surface-50 cursor-pointer">
          <div class="flex gap-3">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle class="w-4 h-4 text-orange-500" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-surface-800">洽谈室占用提醒</div>
              <div class="text-xs text-surface-400 mt-0.5">A3洽谈室已超时使用30分钟</div>
              <div class="text-xs text-surface-300 mt-1">15分钟前</div>
            </div>
          </div>
        </div>
        <div class="p-4 border-b border-surface-50 hover:bg-surface-50 cursor-pointer">
          <div class="flex gap-3">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle class="w-4 h-4 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-surface-800">业务完成通知</div>
              <div class="text-xs text-surface-400 mt-0.5">B-015号客户业务已完成办理</div>
              <div class="text-xs text-surface-300 mt-1">28分钟前</div>
            </div>
          </div>
        </div>
        <div class="p-4 hover:bg-surface-50 cursor-pointer">
          <div class="flex gap-3">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar class="w-4 h-4 text-purple-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-surface-800">预约提醒</div>
              <div class="text-xs text-surface-400 mt-0.5">明日上午有3个专点预约待处理</div>
              <div class="text-xs text-surface-300 mt-1">1小时前</div>
            </div>
          </div>
        </div>
      </div>
      <div class="p-3 border-t border-surface-100 text-center">
        <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">查看全部通知</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { Layers, Home, Search, Bell, LogOut, BellRing, AlertCircle, CheckCircle, Calendar } from 'lucide-vue-next'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
  breadcrumbText: {
    type: String,
    default: '首页'
  }
})

const emit = defineEmits(['logout'])

const showNotifications = ref(false)

const userStore = useUserStore()

const userName = computed(() => userStore.userInfo.name || '管理员')

const roleName = computed(() => {
  const roleMap = {
    admin: '超级管理员',
    '超级管理员': '超级管理员',
    manager: '管理员',
    '管理员': '管理员',
    salesman: '业务员',
    '业务员': '业务员',
    visitor: '访客',
    '访客': '访客'
  }
  return roleMap[userStore.userInfo.role] || userStore.userInfo.role || '用户'
})

const avatarInitial = computed(() => {
  const name = userName.value
  return name ? name.charAt(0) : '管'
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const handleLogout = () => {
  emit('logout')
}
</script>