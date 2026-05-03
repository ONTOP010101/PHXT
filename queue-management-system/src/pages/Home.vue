<template>
  <div id="page-home" class="slide-in">
    <!-- Stats Row -->
    <div class="grid grid-cols-4 gap-5 mb-6">
      <div class="stat-card card" style="background: linear-gradient(135deg,#eff6ff,#dbeafe);">
        <div class="flex items-center justify-between mb-4">
          <div class="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
            <i data-lucide="ticket" class="w-5 h-5 text-white"></i>
          </div>
          <span class="badge badge-blue">今日</span>
        </div>
        <div class="text-3xl font-bold text-primary-700 mb-1" id="stat-total">{{ stats.total }}</div>
        <div class="text-sm text-surface-500">今日排号总数</div>
        <div class="mt-3 flex items-center gap-1 text-xs text-accent-600">
          <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
          <span>较昨日 +12%</span>
        </div>
      </div>
      <div class="stat-card card" style="background: linear-gradient(135deg,#f0fdf4,#dcfce7);">
        <div class="flex items-center justify-between mb-4">
          <div class="w-11 h-11 bg-accent-500 rounded-xl flex items-center justify-center shadow-md">
            <i data-lucide="check-circle-2" class="w-5 h-5 text-white"></i>
          </div>
          <span class="badge badge-green">完成</span>
        </div>
        <div class="text-3xl font-bold text-accent-700 mb-1" id="stat-done">{{ stats.done }}</div>
        <div class="text-sm text-surface-500">叫号完成数</div>
        <div class="mt-3 flex items-center gap-1 text-xs text-accent-600">
          <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
          <span>完成率 75.8%</span>
        </div>
      </div>
      <div class="stat-card card" style="background: linear-gradient(135deg,#fff7ed,#ffedd5);">
        <div class="flex items-center justify-between mb-4">
          <div class="w-11 h-11 bg-warn-500 rounded-xl flex items-center justify-center shadow-md">
            <i data-lucide="users" class="w-5 h-5 text-white"></i>
          </div>
          <span class="badge badge-orange">等待</span>
        </div>
        <div class="text-3xl font-bold text-warn-600 mb-1" id="stat-waiting">{{ stats.waiting }}</div>
        <div class="text-sm text-surface-500">当前等待人数</div>
        <div class="mt-3 flex items-center gap-1 text-xs text-warn-600">
          <i data-lucide="clock" class="w-3.5 h-3.5"></i>
          <span>平均等待 18分钟</span>
        </div>
      </div>
      <div class="stat-card card" style="background: linear-gradient(135deg,#fdf4ff,#f3e8ff);">
        <div class="flex items-center justify-between mb-4">
          <div class="w-11 h-11 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <i data-lucide="percent" class="w-5 h-5 text-white"></i>
          </div>
          <span class="badge badge-purple">转化</span>
        </div>
        <div class="text-3xl font-bold text-purple-700 mb-1">84.2%</div>
        <div class="text-sm text-surface-500">业务转化率</div>
        <div class="mt-3 flex items-center gap-1 text-xs text-purple-600">
          <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
          <span>较上周 +3.1%</span>
        </div>
      </div>
    </div>

    <!-- Middle row: Chart + Quick Actions + Real-time notifications -->
    <div class="grid grid-cols-12 gap-5 mb-6">
      <!-- Chart -->
      <div class="col-span-5 card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-surface-800">今日叫号趋势</h3>
            <p class="text-xs text-surface-400 mt-0.5">按小时统计排号量</p>
          </div>
          <select class="form-input form-select w-28 text-xs py-1.5">
            <option>今日</option><option>本周</option><option>本月</option>
          </select>
        </div>
        <div class="chart-wrap" style="height:200px;">
          <canvas id="chart-trend"></canvas>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-span-4 card p-5">
        <h3 class="font-semibold text-surface-800 mb-4">快捷操作</h3>
        <div class="grid grid-cols-2 gap-3">
          <button class="quick-action-btn flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer border border-primary-100" @click="handleQuickAction('queue-self')">
            <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <i data-lucide="plus-circle" class="w-5 h-5 text-white"></i>
            </div>
            <span class="text-xs font-medium text-primary-700">立即排号</span>
          </button>
          <button class="quick-action-btn flex flex-col items-center gap-2 p-4 rounded-xl bg-accent-50 hover:bg-accent-100 transition-colors cursor-pointer border border-accent-100" @click="handleQuickAction('business-public')">
            <div class="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
              <i data-lucide="phone-call" class="w-5 h-5 text-white"></i>
            </div>
            <span class="text-xs font-medium text-accent-700">立即叫号</span>
          </button>
          <button class="quick-action-btn flex flex-col items-center gap-2 p-4 rounded-xl bg-warn-50 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-100" @click="handleQuickAction('business-appoint')">
            <div class="w-10 h-10 bg-warn-500 rounded-xl flex items-center justify-center">
              <i data-lucide="calendar-plus" class="w-5 h-5 text-white"></i>
            </div>
            <span class="text-xs font-medium text-warn-600">预约登记</span>
          </button>
          <button class="quick-action-btn flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer border border-purple-100" @click="handleQuickAction('queue-display')">
            <div class="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <i data-lucide="monitor" class="w-5 h-5 text-white"></i>
            </div>
            <span class="text-xs font-medium text-purple-700">显示大屏</span>
          </button>
        </div>
      </div>

      <!-- Real-time alerts -->
      <div class="col-span-3 card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-surface-800">实时提醒</h3>
          <span class="flex items-center gap-1 text-xs text-accent-600">
            <span class="pulse-dot w-2 h-2 bg-accent-500 rounded-full inline-block"></span>实时
          </span>
        </div>
        <div class="space-y-3" id="realtime-list">
          <div class="flex gap-2.5 items-start" v-for="(item, index) in realtimeAlerts" :key="index">
            <div class="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-lucide="bell" class="w-3.5 h-3.5 text-blue-600"></i>
            </div>
            <div>
              <div class="text-xs font-medium text-surface-700">{{ item.title }}</div>
              <div class="text-xs text-surface-400">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row: Meeting room status + Queue list -->
    <div class="grid grid-cols-12 gap-5">
      <!-- Meeting rooms -->
      <div class="col-span-4 card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-surface-800">洽谈室状态</h3>
          <button class="quick-action-btn text-xs text-primary-600 hover:underline" @click="handleQuickAction('meeting')">查看全部</button>
        </div>
        <div class="grid grid-cols-2 gap-3" id="home-meeting-grid">
          <div v-for="room in meetingRooms" :key="room.id" class="card p-3 border-l-4" :class="room.status === 'free' ? 'border-accent-500' : room.status === 'occupied' ? 'border-warn-500' : 'border-surface-300'">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-sm">{{ room.name }}</span>
              <span :class="room.status === 'free' ? 'badge badge-green' : room.status === 'occupied' ? 'badge badge-orange' : 'badge badge-gray'">
                {{ room.status === 'free' ? '空闲' : room.status === 'occupied' ? '占用中' : '停用' }}
              </span>
            </div>
            <div class="text-xs text-surface-400" v-if="room.status === 'occupied'">
              {{ room.occupiedBy }} · {{ room.occupiedTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Today queue -->
      <div class="col-span-8 card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-surface-800">今日排号队列</h3>
            <p class="text-xs text-surface-400 mt-0.5">实时更新中</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline text-xs py-1.5 px-3">导出</button>
            <button class="quick-action-btn btn btn-primary text-xs py-1.5 px-3" @click="handleQuickAction('business-public')">叫下一号</button>
          </div>
        </div>
        <table class="data-table w-full">
          <thead><tr>
            <th>号码</th><th>客户姓名</th><th>业务类型</th><th>等待时间</th><th>状态</th><th>操作</th>
          </tr></thead>
          <tbody id="home-queue-body">
            <tr v-for="queue in queueList" :key="queue.id">
              <td>{{ queue.number }}</td>
              <td>{{ queue.customerName }}</td>
              <td>{{ queue.businessType }}</td>
              <td>{{ queue.waitingTime }}</td>
              <td>
                <span :class="queue.status === 'waiting' ? 'badge badge-orange' : queue.status === 'processing' ? 'badge badge-blue' : 'badge badge-green'">
                  {{ queue.status === 'waiting' ? '等待中' : queue.status === 'processing' ? '叫号中' : '已完成' }}
                </span>
              </td>
              <td>
                <button class="btn-icon" @click="handleQueueAction(queue.id)">
                  <i data-lucide="play-circle" class="w-4 h-4"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQueueStore } from '@/store/modules/queue'

const router = useRouter()

const stats = ref({
  total: 128,
  done: 97,
  waiting: 23
})

const realtimeAlerts = ref([
  { title: 'A-021 已排号', description: '张三 · 刚刚' },
  { title: 'B-015 业务完成', description: '李四 · 5分钟前' },
  { title: 'A3洽谈室超时', description: '15分钟前' },
  { title: '新预约：王五', description: '20分钟前' }
])

const meetingRooms = ref([
  { id: 1, name: 'A1 洽谈室', status: 'free' },
  { id: 2, name: 'A2 洽谈室', status: 'occupied', occupiedBy: '张三', occupiedTime: '10分钟前' },
  { id: 3, name: 'A3 洽谈室', status: 'occupied', occupiedBy: '李四', occupiedTime: '25分钟前' },
  { id: 4, name: 'B1 洽谈室', status: 'free' },
  { id: 5, name: 'B2 洽谈室', status: 'occupied', occupiedBy: '王五', occupiedTime: '5分钟前' },
  { id: 6, name: 'B3 洽谈室', status: 'free' }
])

const queueList = ref([
  { id: 1, number: 'A-018', customerName: '张三', businessType: '公开见客', waitingTime: '5分钟', status: 'processing' },
  { id: 2, number: 'A-019', customerName: '李四', businessType: '公开见客', waitingTime: '10分钟', status: 'waiting' },
  { id: 3, number: 'A-020', customerName: '王五', businessType: '公开见客', waitingTime: '15分钟', status: 'waiting' },
  { id: 4, number: 'B-015', customerName: '赵六', businessType: '专点预约', waitingTime: '8分钟', status: 'waiting' }
])

const handleQuickAction = (page) => {
  const pathMap = {
    'queue-self': '/queue/self',
    'business-public': '/business/public',
    'business-appoint': '/business/appoint',
    'queue-display': '/queue/display',
    'meeting': '/meeting'
  }
  if (pathMap[page]) {
    router.push(pathMap[page])
  }
}

const handleQueueAction = (queueId) => {
  // 处理队列操作
  console.log('Queue action:', queueId)
}

onMounted(() => {
  // 初始化图表
  initChart()
})

const initChart = () => {
  // 模拟图表初始化
  console.log('Chart initialized')
}
</script>