const WebSocket = require('ws')

let wss = null
const clients = new Set()

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server })

  wss.on('connection', (ws) => {
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
  broadcastRoomUpdate
}