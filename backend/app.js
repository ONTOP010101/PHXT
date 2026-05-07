require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
const { initWebSocket, broadcastRoomUpdate } = require('./websocket')

app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth')
const customerRoutes = require('./routes/customer')
const companyRoutes = require('./routes/company')
const meetingRoutes = require('./routes/meeting')
const queueRoutes = require('./routes/queue')
const userRoutes = require('./routes/user')
const roleRoutes = require('./routes/role')
const printRoutes = require('./routes/print')
const displayRoutes = require('./routes/display')
const miniappRoutes = require('./routes/miniapp')
const logRoutes = require('./routes/log')

app.use('/api/auth', authRoutes)
app.use('/api/customer', customerRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/meeting', meetingRoutes)
app.use('/api/queue', queueRoutes)
app.use('/api/user', userRoutes)
app.use('/api/role', roleRoutes)
app.use('/api/print', printRoutes)
app.use('/api/display', displayRoutes)
app.use('/api/miniapp', miniappRoutes)
app.use('/api/log', logRoutes)

app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'Server is running' })
})

const PORT = process.env.PORT || 3001
const server = http.createServer(app)

initWebSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { broadcastRoomUpdate }
