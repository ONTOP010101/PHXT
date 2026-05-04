<template>
  <div id="queue-display-preview" class="h-screen w-screen bg-white flex flex-col items-center justify-center text-surface-900">
    <div class="text-center w-full h-full flex flex-col px-4 py-8">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-16">{{ settings.screenTitle || '排号管理系统' }}</h1>

      <div v-if="rooms.length > 0" class="grid gap-2.5 flex-1 w-full" :class="{
        'grid-cols-1': rooms.length === 1,
        'grid-cols-2': rooms.length === 2,
        'grid-cols-3 md:grid-cols-3 lg:grid-cols-3': rooms.length >= 3
      }">
        <div v-for="room in rooms" :key="room.id" class="room-card p-4 rounded-lg border text-center flex flex-col justify-center" :style="{ backgroundColor: settings.cardColor, borderColor: settings.cardColor }">
          <div class="font-bold text-white mb-2" :class="getRoomNameClass()">{{ room.name }}</div>
          <div class="text-white mb-1.5" :class="getRoomInfoClass()">类型: {{ room.type === 'public' ? '公开见客' : '专点见客' }}</div>
          <div class="text-white mb-1.5" :class="getRoomInfoClass()">当前叫号: {{ room.currentNumber || '000' }}</div>
          <div class="text-white mb-1.5" :class="getRoomInfoClass()">下一个号: {{ room.nextNumber || '000' }}</div>
          <div class="text-white" :class="getRoomInfoClass()">预计等待时间：{{ room.waitingTime || '0' }}分钟</div>
        </div>
      </div>
      <div v-else class="text-center text-gray-600 mt-8 flex-1 flex items-center justify-center">
        暂无开启的洽谈室
      </div>

      <div class="time-display text-center mt-4 md:mt-8">
        <div class="text-sm md:text-base text-surface-900">北京时间</div>
        <div class="text-lg md:text-xl font-bold text-surface-900">{{ beijingTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getMeetingList } from '../api/meeting'
import { getDisplaySettings } from '../api/display'

const settings = ref({
  screenTitle: '排号管理系统',
  displayMode: 'standard',
  refreshInterval: '10',
  displayCount: 10,
  cardColor: '#6ba6d6',
  voiceType: 'female',
  speechRate: '0.8'
})

const rooms = ref([])

let ws = null
let reconnectTimer = null
let reconnectInterval = 3000

const lastAnnouncedPerRoom = {}
let isInitialLoad = true
const ANNOUNCE_DEBOUNCE_MS = 30000
const recentBatchCall = {}

const getWsUrl = () => {
  const baseUrl = import.meta.env.VITE_WS_URL || (window.location.origin.replace('http', 'ws') + '/ws')
  return baseUrl
}

const connectWebSocket = () => {
  try {
    ws = new WebSocket(getWsUrl())

    ws.onopen = () => {
      console.log('WebSocket connected')
      reconnectInterval = 3000
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      loadRooms()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error('Parse WebSocket message error:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      scheduleReconnect()
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  } catch (error) {
    console.error('Create WebSocket error:', error)
    scheduleReconnect()
  }
}

const scheduleReconnect = () => {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    reconnectInterval = Math.min(reconnectInterval * 1.5, 15000)
    connectWebSocket()
  }, reconnectInterval)
}

const handleWebSocketMessage = (data) => {
  if (data.type === 'room_update') {
    const oldRooms = rooms.value.map(r => ({ ...r }))
    rooms.value = data.data || []
    if (!isInitialLoad) {
      checkAndAnnounce(oldRooms, rooms.value)
    }
  } else if (data.type === 'batch_call') {
    if (!isInitialLoad) {
      handleBatchCallAnnounce(data)
    }
  } else if (data.type === 'connected') {
    console.log('WebSocket server message:', data.message)
  }
}

const updateRoomsWithAnnounce = (newData) => {
  const oldRooms = rooms.value.map(r => ({ ...r }))
  rooms.value = newData
  if (!isInitialLoad) {
    checkAndAnnounce(oldRooms, rooms.value)
  }
}

const loadRooms = async () => {
  try {
    const res = await getMeetingList()
    if (res.code === 200 && res.data) {
      const newData = res.data.list.filter(room => room.status === 'occupied').slice(0, 16)
      if (isInitialLoad) {
        rooms.value = newData
        for (const room of newData) {
          if (room.currentNumber && room.currentNumber !== '000') {
            lastAnnouncedPerRoom[room.id] = { number: room.currentNumber, timestamp: Date.now() }
          }
        }
        isInitialLoad = false
      } else {
        updateRoomsWithAnnounce(newData)
      }
    }
  } catch (error) {
    console.error('加载洽谈室失败:', error)
  }
}

const loadSettings = async () => {
  try {
    const res = await getDisplaySettings()
    if (res.code === 200 && res.data) {
      settings.value = {
        screenTitle: res.data.screenTitle || '排号管理系统',
        displayMode: 'standard',
        refreshInterval: res.data.refreshInterval || '10',
        displayCount: res.data.displayCount || 10,
        cardColor: res.data.cardColor || '#6ba6d6',
        voiceType: res.data.voiceType || 'female',
        speechRate: res.data.speechRate || '0.8'
      }
    }
  } catch (error) {
    console.error('加载大屏设置失败:', error)
  }
}

const getRoomNameClass = () => {
  const roomCount = rooms.value.length
  if (roomCount === 1) {
    return 'text-[8rem] md:text-[10rem] lg:text-[15rem]'
  } else if (roomCount === 2) {
    return 'text-[6rem] md:text-[8rem] lg:text-[10rem]'
  } else {
    return 'text-[4rem] md:text-[5rem] lg:text-[6rem]'
  }
}

const getRoomInfoClass = () => {
  const roomCount = rooms.value.length
  if (roomCount === 1) {
    return 'text-[5rem] md:text-[7rem] lg:text-[9rem]'
  } else if (roomCount === 2) {
    return 'text-[3rem] md:text-[4rem] lg:text-[5rem]'
  } else {
    return 'text-[2rem] md:text-[2.5rem] lg:text-[3rem]'
  }
}

const currentAnnouncingRoomId = ref(null)
const announceQueue = ref([])

const getAudioUnlocked = () => {
  return window.__audioUnlocked === true
}

const setAudioUnlocked = (value) => {
  window.__audioUnlocked = value
}

let isAnnouncing = false
let dengAudio = null

const checkAndAnnounce = (oldRooms, newRooms) => {
  const roomsToAnnounce = []
  const now = Date.now()

  for (const newRoom of newRooms) {
    if (newRoom.status !== 'occupied' || !newRoom.currentNumber || newRoom.currentNumber === '000') continue

    const oldRoom = oldRooms.find(r => r.id === newRoom.id)
    const oldNumber = oldRoom ? oldRoom.currentNumber : null
    const newNumber = newRoom.currentNumber

    if (oldNumber !== newNumber) {
      const batchInfo = recentBatchCall[newRoom.id]
      if (batchInfo && (now - batchInfo.timestamp < 10000) && batchInfo.lastNumber === newNumber) {
        console.log(`跳过多号并叫触发的单个播报: 房间${newRoom.name}, 号码${newNumber}`)
        lastAnnouncedPerRoom[newRoom.id] = { number: newNumber, timestamp: now }
        continue
      }

      const lastAnnounced = lastAnnouncedPerRoom[newRoom.id]
      const isDuplicate = lastAnnounced &&
        lastAnnounced.number === newNumber &&
        (now - lastAnnounced.timestamp < ANNOUNCE_DEBOUNCE_MS)

      if (!isDuplicate) {
        lastAnnouncedPerRoom[newRoom.id] = { number: newNumber, timestamp: now }
        roomsToAnnounce.push({ ...newRoom })
        console.log(`检测到叫号变化: 房间${newRoom.name}, ${oldNumber} → ${newNumber}`)
      } else {
        console.log(`跳过重复播报: 房间${newRoom.name}, 号码${newNumber}, 距上次${now - lastAnnounced.timestamp}ms`)
      }
    }
  }

  for (const room of roomsToAnnounce) {
    if (isAnnouncing) {
      const existingIndex = announceQueue.value.findIndex(r => r.id === room.id)
      if (existingIndex >= 0) {
        announceQueue.value[existingIndex] = room
      } else {
        announceQueue.value.push(room)
      }
    } else if (getAudioUnlocked()) {
      currentAnnouncingRoomId.value = room.id
      isAnnouncing = true
      announce(room)
    } else {
      const existingIndex = announceQueue.value.findIndex(r => r.id === room.id)
      if (existingIndex >= 0) {
        announceQueue.value[existingIndex] = room
      } else {
        announceQueue.value.push(room)
      }
      console.log('音频未解锁，播报任务已加入队列')
    }
  }
}

const handleBatchCallAnnounce = (data) => {
  const { roomName, firstNumber, lastNumber, callCount, roomId } = data
  const roomNum = roomName.replace('号洽谈室', '')
  const batchKey = `batch_${roomName}_${firstNumber}_${lastNumber}`
  const now = Date.now()

  recentBatchCall[roomId] = { timestamp: now, lastNumber }

  const lastBatchAnnounced = lastAnnouncedPerRoom[`batch_${data.roomId}`]
  if (lastBatchAnnounced &&
    lastBatchAnnounced.key === batchKey &&
    (now - lastBatchAnnounced.timestamp < ANNOUNCE_DEBOUNCE_MS)) {
    console.log(`跳过重复多号并叫播报: ${firstNumber}-${lastNumber}`)
    return
  }

  lastAnnouncedPerRoom[`batch_${data.roomId}`] = { key: batchKey, timestamp: now }

  const batchRoom = {
    id: `batch_${data.roomId}`,
    name: roomName,
    currentNumber: lastNumber,
    isBatchCall: true,
    firstNumber,
    lastNumber,
    callCount
  }

  if (isAnnouncing) {
    const existingIndex = announceQueue.value.findIndex(r => r.id === batchRoom.id)
    if (existingIndex >= 0) {
      announceQueue.value[existingIndex] = batchRoom
    } else {
      announceQueue.value.push(batchRoom)
    }
  } else if (getAudioUnlocked()) {
    currentAnnouncingRoomId.value = batchRoom.id
    isAnnouncing = true
    announce(batchRoom)
  } else {
    const existingIndex = announceQueue.value.findIndex(r => r.id === batchRoom.id)
    if (existingIndex >= 0) {
      announceQueue.value[existingIndex] = batchRoom
    } else {
      announceQueue.value.push(batchRoom)
    }
    console.log('音频未解锁，多号并叫播报任务已加入队列')
  }
}

const processNextInQueue = () => {
  if (announceQueue.value.length > 0 && !isAnnouncing) {
    const nextRoom = announceQueue.value.shift()
    currentAnnouncingRoomId.value = nextRoom.id
    isAnnouncing = true
    announce(nextRoom)
  }
}

const playDengSound = (callback) => {
  dengAudio = new Audio()
  dengAudio.src = '/static/前面的噔噔.MP3'
  dengAudio.volume = 0.5

  const handleEnd = () => {
    dengAudio.removeEventListener('ended', handleEnd)
    dengAudio.removeEventListener('error', handleError)
    clearTimeout(timeoutId)
    dengAudio = null
    if (callback) callback()
  }

  const handleError = () => {
    dengAudio.removeEventListener('ended', handleEnd)
    dengAudio.removeEventListener('error', handleError)
    clearTimeout(timeoutId)
    dengAudio = null
    if (callback) callback()
  }

  dengAudio.addEventListener('ended', handleEnd)
  dengAudio.addEventListener('error', handleError)

  const timeoutId = setTimeout(() => {
    handleError()
  }, 3000)

  try {
    dengAudio.play()
  } catch (error) {
    handleError()
  }
}

const getVoice = (voiceType) => {
  const voices = window.speechSynthesis.getVoices()
  const chineseVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('CN'))

  if (chineseVoices.length > 0) {
    if (voiceType === 'female') {
      return chineseVoices.find(v =>
        v.name.includes('Google') || v.name.includes('Zira') || v.gender === 'female'
      ) || chineseVoices.find(v => !v.name.includes('David')) || chineseVoices[0]
    } else {
      return chineseVoices.find(v =>
        v.name.includes('David') || v.gender === 'male'
      ) || chineseVoices[0]
    }
  }
  return voices[0] || null
}

const announce = (room) => {
  const roomName = room.name
  const roomNum = roomName.replace('号洽谈室', '')
  let isSpeaking = false

  const speechRate = parseFloat(settings.value.speechRate) || 0.8
  const voiceType = settings.value.voiceType || 'female'

  let message = ''
  if (room.isBatchCall) {
    message = `请${room.firstNumber}号到${room.lastNumber}号，到${roomName}洽谈。`
  } else {
    const number = room.currentNumber
    message = `请${roomNum}杠${number}号厂商，到${roomName}洽谈。`
  }

  const speakText = (count) => {
    if (count <= 0) return
    if (isSpeaking) return

    isSpeaking = true

    console.log('准备播报:', message, `第${3 - count + 1}次`)

    if ('speechSynthesis' in window) {
      const doSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(message)
        utterance.lang = 'zh-CN'
        utterance.rate = speechRate
        utterance.pitch = voiceType === 'female' ? 1.1 : 0.7
        utterance.volume = 1.0

        const selectedVoice = getVoice(voiceType)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }

        utterance.onstart = () => {
          console.log('语音开始播报')
        }

        utterance.onend = () => {
          console.log('语音播报完成')
          isSpeaking = false
          if (count > 1) {
            setTimeout(() => speakText(count - 1), 2000)
          } else {
            isAnnouncing = false
            currentAnnouncingRoomId.value = null
            setTimeout(processNextInQueue, 500)
          }
        }

        utterance.onerror = (e) => {
          console.log('语音播报出错:', e)
          isSpeaking = false
          if (count > 1) {
            setTimeout(() => speakText(count - 1), 2000)
          } else {
            isAnnouncing = false
            currentAnnouncingRoomId.value = null
            setTimeout(processNextInQueue, 500)
          }
        }

        try {
          window.speechSynthesis.speak(utterance)
        } catch (error) {
          console.error('调用 speechSynthesis.speak() 失败:', error)
          isSpeaking = false
        }
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        doSpeak()
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          doSpeak()
        }
        setTimeout(() => {
          if (isSpeaking) {
            isSpeaking = false
            isAnnouncing = false
            currentAnnouncingRoomId.value = null
            setTimeout(processNextInQueue, 500)
          }
        }, 3000)
      }
    } else {
      console.log('浏览器不支持语音合成')
      isSpeaking = false
      isAnnouncing = false
      currentAnnouncingRoomId.value = null
      setTimeout(processNextInQueue, 500)
    }
  }

  playDengSound(() => {
    setTimeout(() => speakText(2), 500)
  })
}

const beijingTime = ref('')

const updateBeijingTime = () => {
  const now = new Date()
  const beijingOffset = 8 * 60
  const localOffset = now.getTimezoneOffset()
  const beijingDate = new Date(now.getTime() + (localOffset + beijingOffset) * 60000)

  const year = beijingDate.getFullYear()
  const month = String(beijingDate.getMonth() + 1).padStart(2, '0')
  const day = String(beijingDate.getDate()).padStart(2, '0')
  const hours = String(beijingDate.getHours()).padStart(2, '0')
  const minutes = String(beijingDate.getMinutes()).padStart(2, '0')
  const seconds = String(beijingDate.getSeconds()).padStart(2, '0')

  beijingTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

let timeInterval = null
let refreshInterval = null

const checkAudioUnlocked = () => {
  if (!getAudioUnlocked()) {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.resume()
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length > 0) {
        setAudioUnlocked(true)
        console.log('音频已解锁')
        processNextInQueue()
      }
    }, 100)
  }
}

onMounted(async () => {
  updateBeijingTime()
  timeInterval = setInterval(updateBeijingTime, 1000)

  setTimeout(checkAudioUnlocked, 500)
  setInterval(checkAudioUnlocked, 5000)

  await loadSettings()
  await loadRooms()

  connectWebSocket()

  refreshInterval = setInterval(async () => {
    await loadRooms()
  }, 10000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (ws) {
    ws.close()
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
})
</script>

<style scoped>
#queue-display-preview {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>