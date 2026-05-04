<template>
  <div id="page-home-menu" class="home-menu slide-in">
    <div class="menu-content">
      <div class="banner-card">
        <div class="banner-bg"></div>
        <div class="banner-ring"></div>
        <text class="banner-tag">排号管理系统</text>
        <text class="banner-title">厂商专属排号服务</text>
        <text class="banner-desc">高效洽谈 · 实时叫号 · 无需等候</text>
      </div>

      <div class="queue-status-card">
        <div class="queue-status-header">
          <text class="queue-status-title">实时排号状态</text>
          <view class="queue-status-link" @click="viewAllQueue">
            <text>查看全部</text>
            <div class="icon-arrow-sm"></div>
          </view>
        </div>
        <div class="queue-status-content">
          <div class="queue-main">
            <div class="queue-room">{{ currentRoom }}</div>
            <div class="queue-number-row">
              <div class="queue-current">
                <text class="queue-label">当前叫号</text>
                <text class="queue-number">{{ currentNumber }}</text>
              </div>
              <div class="queue-next">
                <text class="queue-label">下一位</text>
                <text class="queue-number">{{ nextNumber }}</text>
              </div>
            </div>
          </div>
          <div class="queue-wait">
            <div class="wait-circle">
              <text class="wait-time">{{ waitTime }}</text>
              <text class="wait-unit">分钟</text>
            </div>
            <text class="wait-label">预计等待</text>
          </div>
        </div>
        <div class="queue-stats">
          <div class="stat-item">
            <text class="stat-value">{{ totalCount }}</text>
            <text class="stat-label">累计排号</text>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <text class="stat-value">{{ todayCount }}</text>
            <text class="stat-label">今日已办理</text>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <div
          class="action-item"
          v-for="action in quickActions"
          :key="action.id"
          @click="handleQuickAction(action.path)"
        >
          <div class="action-icon" :style="{ background: action.bgColor }">
            <div class="action-icon-inner" :style="{ color: action.color }">
              <i :data-lucide="action.icon" class="w-6 h-6"></i>
            </div>
          </div>
          <text class="action-label">{{ action.label }}</text>
        </div>
      </div>

      <div class="section-header">
        <text class="section-title">快捷功能</text>
      </div>

      <div class="menu-grid">
        <div
          class="menu-card"
          v-for="menu in menuItems"
          :key="menu.id"
          @click="handleMenuClick(menu.path)"
        >
          <div class="menu-icon" :style="{ background: menu.bgColor }">
            <i :data-lucide="menu.icon" class="w-6 h-6" :style="{ color: menu.color }"></i>
          </div>
          <div class="menu-info">
            <text class="menu-title">{{ menu.title }}</text>
            <text class="menu-desc">{{ menu.desc }}</text>
          </div>
          <div class="menu-arrow">
            <i data-lucide="chevron-right" class="w-5 h-5 text-surface-400"></i>
          </div>
        </div>
      </div>

      <div class="section-header" style="margin-top: 24px;">
        <text class="section-title">洽谈室状态</text>
        <view class="section-more" @click="viewAllRooms">
          <text>查看全部</text>
          <div class="icon-arrow-sm"></div>
        </view>
      </div>

      <div class="rooms-grid">
        <div
          class="room-card"
          v-for="room in meetingRooms"
          :key="room.id"
          :class="getRoomStatusClass(room.status)"
        >
          <div class="room-header">
            <text class="room-name">{{ room.name }}</text>
            <span class="room-status" :class="getStatusBadgeClass(room.status)">
              {{ getStatusText(room.status) }}
            </span>
          </div>
          <div class="room-info" v-if="room.status === 'occupied'">
            <text class="room-occupied">{{ room.occupiedBy }}</text>
            <text class="room-time">{{ room.occupiedTime }}</text>
          </div>
          <div class="room-info" v-else>
            <text class="room-free">暂无排队</text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentRoom = ref('1 号洽谈室')
const currentNumber = ref('1_018')
const nextNumber = ref('1_019')
const waitTime = ref('18')
const totalCount = ref('3,485')
const todayCount = ref('892')

const quickActions = ref([
  { id: 1, icon: 'scan-line', label: '扫码排号', path: '/queue/self/vertical', color: '#16a34a', bgColor: '#dcfce7' },
  { id: 2, icon: 'list', label: '排号队列', path: '/queue/self', color: '#0284c7', bgColor: '#f0f9ff' },
  { id: 3, icon: 'history', label: '历史记录', path: '/customer', color: '#d97706', bgColor: '#fef3c7' },
  { id: 4, icon: 'help-circle', label: '帮助中心', path: '/meeting', color: '#8b5cf6', bgColor: '#f5f3ff' }
])

const menuItems = ref([
  { id: 1, title: '客户资料管理', desc: '查看和管理客户信息', icon: 'users', path: '/customer', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 2, title: '洽谈室管理', desc: '管理洽谈室和状态', icon: 'door-open', path: '/meeting', color: '#16a34a', bgColor: '#f0fdf4' },
  { id: 3, title: '公开见客业务', desc: '公开见客排号业务', icon: 'user-check', path: '/business/public', color: '#0284c7', bgColor: '#f0f9ff' },
  { id: 4, title: '专点预约业务', desc: '专点见客预约管理', icon: 'calendar-check', path: '/business/appoint', color: '#7c3aed', bgColor: '#f5f3ff' },
  { id: 5, title: '内部排号管理', desc: '内部排号和叫号管理', icon: 'ticket', path: '/queue/self', color: '#ea580c', bgColor: '#fff7ed' },
  { id: 6, title: '排号显示大屏', desc: '排号信息展示大屏', icon: 'monitor', path: '/queue/display', color: '#dc2626', bgColor: '#fef2f2' },
  { id: 7, title: '角色权限管理', desc: '系统角色和权限配置', icon: 'shield', path: '/system/role', color: '#0891b2', bgColor: '#ecfeff' },
  { id: 8, title: '用户账号管理', desc: '系统用户账号管理', icon: 'user-cog', path: '/system/user', color: '#64748b', bgColor: '#f8fafc' }
])

const meetingRooms = ref([
  { id: 1, name: '1 号洽谈室', status: 'free' },
  { id: 2, name: '2 号洽谈室', status: 'occupied', occupiedBy: '张三', occupiedTime: '10分钟前' },
  { id: 3, name: '3 号洽谈室', status: 'occupied', occupiedBy: '李四', occupiedTime: '25分钟前' },
  { id: 4, name: '4 号洽谈室', status: 'free' },
  { id: 5, name: '5 号洽谈室', status: 'occupied', occupiedBy: '王五', occupiedTime: '5分钟前' },
  { id: 6, name: '6 号洽谈室', status: 'free' }
])

const handleQuickAction = (path) => {
  router.push(path)
}

const handleMenuClick = (path) => {
  router.push(path)
}

const viewAllQueue = () => {
  router.push('/queue/self')
}

const viewAllRooms = () => {
  router.push('/meeting')
}

const getRoomStatusClass = (status) => {
  return status === 'free' ? 'room-free-status' : status === 'occupied' ? 'room-occupied-status' : 'room-disabled-status'
}

const getStatusBadgeClass = (status) => {
  return status === 'free' ? 'badge-green' : status === 'occupied' ? 'badge-orange' : 'badge-gray'
}

const getStatusText = (status) => {
  return status === 'free' ? '空闲' : status === 'occupied' ? '占用中' : '停用'
}

onMounted(() => {
  if (window.lucide) {
    window.lucide.createIcons()
  }
})
</script>

<style scoped>
.home-menu {
  padding: 20px;
  background: #f1f5f9;
  min-height: calc(100vh - 64px);
}

.menu-content {
  max-width: 900px;
  margin: 0 auto;
}

.banner-card {
  background: linear-gradient(135deg, #166534, #15803d);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.banner-ring {
  position: absolute;
  bottom: -50px;
  left: -30px;
  width: 120px;
  height: 120px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.banner-tag {
  font-size: 12px;
  font-weight: 600;
  color: #bbf7d0;
  letter-spacing: 2px;
  margin-bottom: 10px;
  display: block;
}

.banner-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 8px;
  display: block;
}

.banner-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
}

.queue-status-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.queue-status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.queue-status-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.queue-status-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #16a34a;
  font-weight: 600;
}

.queue-status-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 18px;
}

.queue-main {
  flex: 1;
}

.queue-room {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
}

.queue-number-row {
  display: flex;
  gap: 28px;
}

.queue-current,
.queue-next {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queue-label {
  font-size: 12px;
  color: #94a3b8;
}

.queue-number {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.queue-wait {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.wait-circle {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.wait-time {
  font-size: 22px;
  font-weight: 700;
  color: #16a34a;
}

.wait-unit {
  font-size: 11px;
  color: #16a34a;
}

.wait-label {
  font-size: 12px;
  color: #94a3b8;
}

.queue-stats {
  display: flex;
  justify-content: center;
  gap: 50px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.stat-divider {
  width: 1px;
  background: #e2e8f0;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 80px;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-item:hover {
  transform: translateY(-2px);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 0 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #16a34a;
  font-weight: 600;
  cursor: pointer;
}

.icon-arrow-sm {
  width: 14px;
  height: 14px;
  border-right: 2px solid #16a34a;
  border-bottom: 2px solid #16a34a;
  transform: rotate(-45deg);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.menu-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.menu-desc {
  font-size: 12px;
  color: #94a3b8;
}

.menu-arrow {
  flex-shrink: 0;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.room-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.room-card.room-free-status {
  border-left: 4px solid #16a34a;
}

.room-card.room-occupied-status {
  border-left: 4px solid #ea580c;
}

.room-card.room-disabled-status {
  border-left: 4px solid #94a3b8;
}

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.room-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.room-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 100px;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.room-occupied {
  font-size: 12px;
  color: #64748b;
}

.room-time {
  font-size: 11px;
  color: #94a3b8;
}

.room-free {
  font-size: 12px;
  color: #94a3b8;
}

.badge-green {
  background: #dcfce7;
  color: #16a34a;
}

.badge-orange {
  background: #ffedd5;
  color: #ea580c;
}

.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}
</style>
