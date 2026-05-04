const WebSocket = require('ws')
const db = require('./models')

let wss = null
const clients = new Set()

const getRoomsData = async () => {
  try {
    const meetings = await db.MeetingRoom.findAll({
      where: { status: 'occupied' },
      order: [['id', 'ASC']]
    })

    const result = await Promise.all(meetings.map(async (meeting) => {
      const meetingData = meeting.toJSON()
      const queues = await db.Queue.findAll({
        where: {
          roomId: meeting.id,
          completed: false
        },
        order: [['createdAt', 'ASC']]
      })

      const calledQueues = queues.filter(q => q.status === 'called')
      const currentQueue = calledQueues.length > 0 ? calledQueues[calledQueues.length - 1] : null
      const waitingQueues = queues.filter(q => q.status === 'waiting')

      return {
        ...meetingData,
        currentNumber: currentQueue ? currentQueue.queueNumber?.split('_')[1] || '000' : '000',
        nextNumber: waitingQueues.length > 0 ? waitingQueues[0].queueNumber?.split('_')[1] || '000' : '000',
        waitingTime: waitingQueues.length > 0 ? Math.max(1, Math.floor(waitingQueues.length * 2)) : 0
      }
    }))

    return result
  } catch (error) {
    console.error('Get rooms data error:', error)
    return []
  }
}

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server })

  wss.on('connection', async (ws) => {
    clients.add(ws)
    console.log('WebSocket client connected. Total clients:', clients.size)

    ws.on('close', () => {
      clients.delete(ws)
      console.log('WebSocket client disconnected. Total clients:', clients.size)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      clients.delete(ws)
    })

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connected successfully'
    }))

    const roomsData = await getRoomsData()
    ws.send(JSON.stringify({
      type: 'room_update',
      data: roomsData,
      timestamp: new Date().toISOString()
    }))
  })

  console.log('WebSocket server initialized')
  return wss
}

const broadcast = (data) => {
  const message = JSON.stringify(data)
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

const broadcastQueueUpdate = (roomId, queueData) => {
  broadcast({
    type: 'queue_update',
    roomId,
    data: queueData,
    timestamp: new Date().toISOString()
  })
}

const broadcastRoomUpdate = (rooms) => {
  broadcast({
    type: 'room_update',
    data: rooms,
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  initWebSocket,
  broadcast,
  broadcastQueueUpdate,
  broadcastRoomUpdate,
  getRoomsData
}