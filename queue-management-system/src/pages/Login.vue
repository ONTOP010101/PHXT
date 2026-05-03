<template>
  <div id="login-page" class="min-h-screen flex">
    <!-- 左侧品牌区 -->
    <div class="login-bg w-1/2 flex flex-col items-center justify-center p-16 relative overflow-hidden">
      <!-- 装饰元素 + 品牌文案 -->
      <div class="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-white opacity-5"></div>
      <div class="absolute bottom-[-100px] right-[-60px] w-96 h-96 rounded-full bg-white opacity-5"></div>
      <div class="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white opacity-5"></div>

      <div class="relative z-10 text-center text-white">
        <div class="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white border-opacity-30">
          <i data-lucide="layers" class="w-10 h-10 text-white"></i>
        </div>
        <h1 class="text-4xl font-800 mb-3 tracking-tight">排号管理系统</h1>
        <p class="text-blue-200 text-lg mb-12">Queue Management System</p>

        <div class="space-y-5 text-left max-w-xs mx-auto">
          <div class="flex items-center gap-4 bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
              <i data-lucide="zap" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <div class="font-600 text-sm">实时叫号</div>
              <div class="text-blue-200 text-xs">毫秒级响应，零延迟同步</div>
            </div>
          </div>
          <div class="flex items-center gap-4 bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
              <i data-lucide="bar-chart-2" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <div class="font-600 text-sm">数据统计</div>
              <div class="text-blue-200 text-xs">多维度业务数据可视化</div>
            </div>
          </div>
          <div class="flex items-center gap-4 bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
              <i data-lucide="shield-check" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <div class="font-600 text-sm">权限管理</div>
              <div class="text-blue-200 text-xs">多角色分级权限管控</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="w-1/2 flex items-center justify-center bg-white p-16">
      <div class="w-full max-w-md">
        <div class="mb-10">
          <h2 class="text-3xl font-bold text-surface-900 mb-2">欢迎回来</h2>
          <p class="text-surface-400 text-sm">请输入您的账号和密码登录系统</p>
        </div>

        <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div class="flex items-center gap-3">
            <i data-lucide="alert-circle" class="w-5 h-5 text-red-500 flex-shrink-0"></i>
            <span class="text-red-600 text-sm">{{ errorMessage }}</span>
          </div>
        </div>

        <Teleport to="body">
          <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <div class="text-center">
                <i data-lucide="exclamation-circle" class="w-16 h-16 text-red-500 mx-auto mb-4"></i>
                <h3 class="text-lg font-bold text-surface-900 mb-3">账号已在其他设备登录</h3>
                <p class="text-surface-500 text-sm mb-2">您的账号已在另一台设备登录，当前登录已失效。</p>
                <p class="text-surface-400 text-xs mb-6">时间：{{ logoutTime }}</p>
                <button @click="handleConfirmLogout" class="btn btn-primary w-full justify-center bg-red-500 hover:bg-red-600 border-none">
                  确认
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <div class="space-y-5">
          <div>
            <label class="form-label">账号</label>
            <div class="relative">
              <i data-lucide="user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"></i>
              <input v-model="form.username" type="text" placeholder="请输入登录账号" class="form-input pl-10" />
            </div>
          </div>
          <div>
            <label class="form-label">密码</label>
            <div class="relative">
              <i data-lucide="lock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"></i>
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="请输入登录密码" class="form-input pl-10" />
              <button @click="showPwd = !showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                <i :data-lucide="showPwd ? 'eye-off' : 'eye'" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm text-surface-500 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded text-primary-600" v-model="form.remember" />
              记住我
            </label>
            <a href="#" class="text-sm text-primary-600 hover:text-primary-700">忘记密码？</a>
          </div>
          <button @click="handleLogin" class="btn btn-primary w-full justify-center py-3 text-base">
            <i data-lucide="log-in" class="w-4 h-4"></i> 登录系统
          </button>
        </div>

        <div class="mt-8 pt-6 border-t border-surface-100 text-center text-xs text-surface-400">
          © 2026 排号管理系统
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: 'admin',
  password: '123456',
  remember: true
})

const showPwd = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showConfirmDialog = ref(false)
const logoutTime = ref('')

onMounted(() => {
  const forcedLogout = localStorage.getItem('forcedLogout')
  const loginError = localStorage.getItem('loginError')
  
  if (forcedLogout === 'true' && loginError === '账号已在其他设备登录') {
    const now = new Date()
    logoutTime.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    showConfirmDialog.value = true
  } else if (loginError) {
    errorMessage.value = loginError
    localStorage.removeItem('loginError')
  }
  
  localStorage.removeItem('forcedLogout')
})

const handleConfirmLogout = () => {
  showConfirmDialog.value = false
  localStorage.removeItem('loginError')
}

const handleLogin = async () => {
  errorMessage.value = ''
  
  if (!form.value.username || !form.value.password) {
    errorMessage.value = '请输入账号和密码'
    return
  }
  
  loading.value = true
  try {
    await userStore.login({
      username: form.value.username,
      password: form.value.password
    })
    router.push('/')
  } catch (error) {
    errorMessage.value = error?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%);
}
</style>