<template>
  <div class="flex flex-col min-h-screen">
    <Header :breadcrumb-text="breadcrumbText" @logout="handleLogout" />

    <div class="flex pt-16" style="min-height: calc(100vh - 0px);">
      <Sidebar ref="sidebarRef" />

      <main class="main-content flex-1 flex flex-col transition-all duration-300" :style="contentStyle">
        <div class="tabs-container border-b border-surface-200 bg-white">
          <div class="tabs-wrapper flex overflow-x-auto">
            <div
              v-for="tab in tabs"
              :key="tab.path"
              class="tab-item flex items-center gap-2 px-4 py-3 border-b-2 cursor-pointer transition-all"
              :class="{ active: activeTab === tab.path }"
              @click="switchTab(tab.path)"
            >
              <span class="tab-title">{{ tab.title }}</span>
              <button
                class="tab-close p-1 rounded-full hover:bg-surface-100 transition-colors"
                @click.stop="closeTab(tab.path)"
                v-if="tab.path !== '/'"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="content-container flex-1 p-6 bg-white">
          <component :is="currentComponent" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import HomePage from '../../pages/Home.vue'
import HomeMenuPage from '../../pages/HomeMenu.vue'
import MiniAppHomeConfigPage from '../../pages/MiniAppHomeConfig.vue'
import MiniAppUserCenterPage from '../../pages/MiniAppUserCenter.vue'
import CustomerPage from '../../pages/Customer.vue'
import MeetingPage from '../../pages/Meeting.vue'
import BusinessPublicPage from '../../pages/BusinessPublic.vue'
import BusinessAppointPage from '../../pages/BusinessAppoint.vue'
import QueueSelfPage from '../../pages/QueueSelf.vue'
import QueueDisplayPage from '../../pages/QueueDisplay.vue'
import SystemRolePage from '../../pages/SystemRole.vue'
import SystemUserPage from '../../pages/SystemUser.vue'

const route = useRoute()
const router = useRouter()
const sidebarRef = ref(null)
const isSidebarCollapsed = ref(false)

const tabs = ref([
  {
    path: '/',
    title: '首页'
  }
])
const activeTab = ref('/')

const pageTitles = {
  '/': '首页',
  '/home/menu': '首页(菜单版)',
  '/mini-app/home-config': '小程序首页配置',
  '/mini-app/user-center': '小程序用户中心',
  '/customer': '客户资料',
  '/meeting': '洽谈室管理',
  '/business/public': '公开见客业务',
  '/business/appoint': '专点见客预约',
  '/queue/self': '内部排号管理',
  '/queue/display': '排号显示大屏',
  '/system/role': '角色管理',
  '/system/user': '用户管理'
}

watch(() => sidebarRef.value?.isCollapsed, (newValue) => {
  if (newValue !== undefined) {
    isSidebarCollapsed.value = newValue
  }
})

watch(() => route.path, (newPath) => {
  activeTab.value = newPath

  const existingTab = tabs.value.find(tab => tab.path === newPath)
  if (!existingTab) {
    tabs.value.push({
      path: newPath,
      title: pageTitles[newPath] || '未知页面'
    })
  }
})

const currentComponent = computed(() => {
  const pathMap = {
    '/': HomePage,
    '/home/menu': HomeMenuPage,
    '/mini-app/home-config': MiniAppHomeConfigPage,
    '/mini-app/user-center': MiniAppUserCenterPage,
    '/customer': CustomerPage,
    '/meeting': MeetingPage,
    '/business/public': BusinessPublicPage,
    '/business/appoint': BusinessAppointPage,
    '/queue/self': QueueSelfPage,
    '/queue/display': QueueDisplayPage,
    '/system/role': SystemRolePage,
    '/system/user': SystemUserPage
  }
  return pathMap[route.path] || HomePage
})

const breadcrumbText = computed(() => {
  return pageTitles[route.path] || '首页'
})

const contentStyle = computed(() => {
  const sidebarWidth = isSidebarCollapsed.value ? 90 : 260
  return {
    marginLeft: `${sidebarWidth}px`,
    width: `calc(100% - ${sidebarWidth}px)`
  }
})

const switchTab = (path) => {
  router.push(path)
}

const closeTab = (path) => {
  if (path === '/') return

  const tabIndex = tabs.value.findIndex(tab => tab.path === path)
  if (tabIndex === -1) return

  tabs.value.splice(tabIndex, 1)

  if (path === activeTab.value) {
    const newActiveTab = tabs.value[tabs.value.length - 1] || tabs.value[0]
    router.push(newActiveTab.path)
  }
}

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

onMounted(() => {
  const currentPath = route.path
  if (!tabs.value.find(tab => tab.path === currentPath)) {
    tabs.value.push({
      path: currentPath,
      title: pageTitles[currentPath] || '未知页面'
    })
  }
  activeTab.value = currentPath
})
</script>

<style scoped>
.tabs-container {
  position: relative;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabs-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 #f8fafc;
}

.tabs-wrapper::-webkit-scrollbar {
  height: 4px;
}

.tabs-wrapper::-webkit-scrollbar-track {
  background: #f8fafc;
}

.tabs-wrapper::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.tabs-wrapper::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.tab-item {
  white-space: nowrap;
  border-bottom-color: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;
  margin-right: 2px;
}

.tab-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.tab-item.active {
  background: #ffffff;
  color: #1d4ed8;
  border-bottom-color: #1d4ed8;
  font-weight: 600;
}

.tab-title {
  margin-right: 4px;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #ef4444;
  background: #f1f5f9;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-left: 8px;
  font-weight: 600;
}

.tab-close:hover {
  color: #ef4444;
  background: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  border: 1px solid #ef4444;
}

.content-container {
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
</style>