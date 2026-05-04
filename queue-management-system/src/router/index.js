import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../store/modules/user'
import LoginPage from '../pages/Login.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import HomePage from '../pages/Home.vue'
import HomeMenuPage from '../pages/HomeMenu.vue'
import MiniAppHomeConfigPage from '../pages/MiniAppHomeConfig.vue'
import MiniAppUserCenterPage from '../pages/MiniAppUserCenter.vue'
import CustomerPage from '../pages/Customer.vue'
import MeetingPage from '../pages/Meeting.vue'
import BusinessPublicPage from '../pages/BusinessPublic.vue'
import BusinessAppointPage from '../pages/BusinessAppoint.vue'
import QueueSelfPage from '../pages/QueueSelf.vue'
import QueueSelfVerticalPage from '../pages/QueueSelfVertical.vue'
import QueueDisplayPage from '../pages/QueueDisplay.vue'
import QueueDisplayPreviewPage from '../pages/QueueDisplayPreview.vue'
import SystemRolePage from '../pages/SystemRole.vue'
import SystemUserPage from '../pages/SystemUser.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/queue/self/vertical',
    name: 'QueueSelfVertical',
    component: QueueSelfVerticalPage
  },
  {
    path: '/queue/self/vertical/new',
    name: 'QueueSelfVerticalNew',
    component: QueueSelfVerticalPage
  },
  {
    path: '/queue/display/preview',
    name: 'QueueDisplayPreview',
    component: QueueDisplayPreviewPage
  },
  {
    path: '/',
    name: 'Main',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomePage
      },
      {
        path: 'home/menu',
        name: 'HomeMenu',
        component: HomeMenuPage
      },
      {
        path: 'mini-app/home-config',
        name: 'MiniAppHomeConfig',
        component: MiniAppHomeConfigPage
      },
      {
        path: 'mini-app/user-center',
        name: 'MiniAppUserCenter',
        component: MiniAppUserCenterPage
      },
      {
        path: 'customer',
        name: 'Customer',
        component: CustomerPage
      },
      {
        path: 'meeting',
        name: 'Meeting',
        component: MeetingPage
      },
      {
        path: 'business/public',
        name: 'BusinessPublic',
        component: BusinessPublicPage
      },
      {
        path: 'business/appoint',
        name: 'BusinessAppoint',
        component: BusinessAppointPage
      },
      {
        path: 'queue/self',
        name: 'QueueSelf',
        component: QueueSelfPage
      },
      {
        path: 'queue/display',
        name: 'QueueDisplay',
        component: QueueDisplayPage
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: SystemRolePage
      },
      {
        path: 'system/user',
        name: 'SystemUser',
        component: SystemUserPage
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const token = localStorage.getItem('token')

  if (to.name !== 'Login' && !isLoggedIn) {
    return { name: 'Login' }
  } else if (to.name === 'Login' && isLoggedIn) {
    return { name: 'Home' }
  }

  if (to.name !== 'Login' && isLoggedIn && token) {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.code !== 200) {
        localStorage.removeItem('token')
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('userInfo')
        if (data.message === '账号已在其他设备登录') {
          localStorage.setItem('loginError', data.message)
          localStorage.setItem('forcedLogout', 'true')
        }
        return { name: 'Login' }
      }

      if (data.data && data.data.user) {
        const userStore = useUserStore()
        userStore.userInfo = data.data.user
        localStorage.setItem('userInfo', JSON.stringify(data.data.user))
      }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userInfo')
      return { name: 'Login' }
    }
  }
})

export default router