<template>
  <aside class="sidebar bg-white border-r border-surface-200 fixed left-0 top-16 bottom-0 overflow-y-auto z-50" :class="{ collapsed: isCollapsed }">
    <div class="flex justify-between items-center px-3 py-2 border-b border-surface-100">
      <div v-if="!isCollapsed" class="text-sm font-semibold">菜单导航</div>
      <button @click="toggleCollapse" class="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
        <ChevronLeft class="w-4 h-4" v-if="!isCollapsed" />
        <ChevronRight class="w-4 h-4" v-else />
      </button>
    </div>
    <nav class="py-4 px-3">
      <router-link 
        v-if="hasPermission('home', 'enable')"
        to="/" 
        class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer"
        :class="{ active: currentRoute === '/' }"
      >
        <LayoutDashboard class="w-4.5 h-4.5 flex-shrink-0" />
        <span class="text-sm" v-if="!isCollapsed">首页</span>
      </router-link>

      <div v-if="hasPermission('customer', 'enable') || hasPermission('meeting', 'enable')" class="menu-group">
        <div 
          class="menu-group-title flex items-center justify-between px-3 py-2 mb-1 cursor-pointer"
          @click="toggleMenu('data')"
        >
          <div class="flex items-center gap-3">
            <Folder class="w-4.5 h-4.5 flex-shrink-0" />
            <span class="text-sm font-medium" v-if="!isCollapsed">资料管理</span>
          </div>
          <ChevronDown 
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': openMenus.data }"
            v-if="!isCollapsed"
          />
        </div>
        <div class="menu-group-content pl-7" v-show="openMenus.data || isCollapsed">
          <router-link 
            v-if="hasPermission('customer', 'enable')"
            to="/customer" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer"
            :class="{ active: currentRoute === '/customer' }"
          >
            <Users class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">客户资料</span>
          </router-link>
          <router-link 
            v-if="hasPermission('meeting', 'enable')"
            to="/meeting" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer"
            :class="{ active: currentRoute === '/meeting' }"
          >
            <DoorOpen class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">洽谈室管理</span>
          </router-link>
        </div>
      </div>

      <div v-if="hasPermission('publicBusiness', 'enable') || hasPermission('appointBusiness', 'enable')" class="menu-group">
        <div 
          class="menu-group-title flex items-center justify-between px-3 py-2 mb-1 cursor-pointer"
          @click="toggleMenu('business')"
        >
          <div class="flex items-center gap-3">
            <Briefcase class="w-4.5 h-4.5 flex-shrink-0" />
            <span class="text-sm font-medium" v-if="!isCollapsed">业务管理</span>
          </div>
          <ChevronDown 
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': openMenus.business }"
            v-if="!isCollapsed"
          />
        </div>
        <div class="menu-group-content pl-7" v-show="openMenus.business || isCollapsed">
          <router-link 
            v-if="hasPermission('publicBusiness', 'enable')"
            to="/business/public" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer"
            :class="{ active: currentRoute === '/business/public' }"
          >
            <UserCheck class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">公开见客业务</span>
          </router-link>
          <router-link 
            v-if="hasPermission('appointBusiness', 'enable')"
            to="/business/appoint" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer"
            :class="{ active: currentRoute === '/business/appoint' }"
          >
            <CalendarCheck class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">专点见客预约</span>
          </router-link>
        </div>
      </div>

      <div v-if="hasPermission('selfQueue', 'enable') || hasPermission('display', 'enable')" class="menu-group">
        <div 
          class="menu-group-title flex items-center justify-between px-3 py-2 mb-1 cursor-pointer"
          @click="toggleMenu('queue')"
        >
          <div class="flex items-center gap-3">
            <Ticket class="w-4.5 h-4.5 flex-shrink-0" />
            <span class="text-sm font-medium" v-if="!isCollapsed">排号系统</span>
          </div>
          <ChevronDown 
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': openMenus.queue }"
            v-if="!isCollapsed"
          />
        </div>
        <div class="menu-group-content pl-7" v-show="openMenus.queue || isCollapsed">
          <router-link 
            v-if="hasPermission('selfQueue', 'enable')"
            to="/queue/self" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer"
            :class="{ active: currentRoute === '/queue/self' }"
          >
            <Ticket class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">内部排号管理</span>
          </router-link>
          <router-link 
            to="/queue/self/vertical" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer"
            :class="{ active: currentRoute === '/queue/self/vertical' }"
          >
            <Ticket class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">厂商自助排号</span>
          </router-link>
          <router-link 
            v-if="hasPermission('display', 'enable')"
            to="/queue/display" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer"
            :class="{ active: currentRoute === '/queue/display' }"
          >
            <Monitor class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">排号显示大屏</span>
          </router-link>
        </div>
      </div>

      <div v-if="hasPermission('miniApp', 'enable')" class="menu-group">
        <div 
          class="menu-group-title flex items-center justify-between px-3 py-2 mb-1 cursor-pointer"
          @click="toggleMenu('page')"
        >
          <div class="flex items-center gap-3">
            <Layout class="w-4.5 h-4.5 flex-shrink-0" />
            <span class="text-sm font-medium" v-if="!isCollapsed">页面管理</span>
          </div>
          <ChevronDown 
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': openMenus.page }"
            v-if="!isCollapsed"
          />
        </div>
        <div class="menu-group-content pl-7" v-show="openMenus.page || isCollapsed">
          <div class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer">
            <Smartphone class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">小程序首页配置</span>
          </div>
          <div class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer">
            <Sliders class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">小程序排号页配置</span>
          </div>
        </div>
      </div>

      <div v-if="hasPermission('role', 'enable') || hasPermission('user', 'enable')" class="menu-group">
        <div 
          class="menu-group-title flex items-center justify-between px-3 py-2 mb-1 cursor-pointer"
          @click="toggleMenu('system')"
        >
          <div class="flex items-center gap-3">
            <Settings class="w-4.5 h-4.5 flex-shrink-0" />
            <span class="text-sm font-medium" v-if="!isCollapsed">系统管理</span>
          </div>
          <ChevronDown 
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': openMenus.system }"
            v-if="!isCollapsed"
          />
        </div>
        <div class="menu-group-content pl-7" v-show="openMenus.system || isCollapsed">
          <router-link 
            v-if="hasPermission('role', 'enable')"
            to="/system/role" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer"
            :class="{ active: currentRoute === '/system/role' }"
          >
            <Shield class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">角色管理</span>
          </router-link>
          <router-link 
            v-if="hasPermission('user', 'enable')"
            to="/system/user" 
            class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer"
            :class="{ active: currentRoute === '/system/user' }"
          >
            <UserCog class="flex-shrink-0" />
            <span class="text-sm" v-if="!isCollapsed">用户管理</span>
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { computed, ref, defineExpose } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight, LayoutDashboard, Folder, Users, DoorOpen, Briefcase, UserCheck, CalendarCheck, Ticket, Monitor, Layout, Smartphone, Sliders, Settings, ChevronDown, Shield, UserCog } from 'lucide-vue-next'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const userStore = useUserStore()
const isCollapsed = ref(false)
const openMenus = ref({
  data: true,
  business: false,
  queue: false,
  page: false,
  system: false
})

const currentRoute = computed(() => {
  return route.path
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleMenu = (menuKey) => {
  openMenus.value[menuKey] = !openMenus.value[menuKey]
}

const hasPermission = (module, permission) => {
  const permissions = userStore.userInfo.permissions || {}
  const modulePermissions = permissions[module] || {}
  return modulePermissions[permission] === true
}

defineExpose({
  isCollapsed
})
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  transition: all 0.3s ease;
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.sidebar.collapsed {
  width: 90px;
  min-width: 90px;
}

.sidebar-item {
  transition: all 0.2s ease;
  font-size: 15px;
  padding: 12px 16px !important;
  margin-bottom: 6px !important;
  border-radius: 12px !important;
}

.sidebar-item:hover {
  background: #f0f7ff;
  color: #1d4ed8;
  transform: translateX(4px);
}

.sidebar-item.active {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #1d4ed8;
  border-right: 4px solid #1d4ed8;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.1);
}

.menu-group {
  margin-bottom: 16px;
}

.menu-group-title {
  transition: all 0.2s ease;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 16px !important;
  margin-bottom: 8px !important;
  color: #1e293b;
}

.menu-group-title:hover {
  background: #f0f7ff;
  color: #1d4ed8;
  transform: translateX(4px);
}

.menu-group-content {
  transition: all 0.3s ease;
  padding-left: 12px !important;
}

.sidebar.collapsed .menu-group-content {
  position: absolute;
  left: 90px;
  top: 0;
  width: 180px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 100;
  padding: 12px 0 !important;
  margin-top: 8px !important;
}

.sidebar.collapsed .menu-group:hover .menu-group-content {
  display: block !important;
}

.sidebar i {
  font-size: 18px !important;
  width: 20px !important;
  height: 20px !important;
  flex-shrink: 0;
}

.sidebar > div:first-child {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.sidebar > div:first-child div {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.sidebar > nav {
  padding: 20px 16px;
}
</style>