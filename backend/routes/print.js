const express = require('express')
const router = express.Router()
const path = require('path')

const PRINTER_NAME = process.env.PRINTER_NAME || 'GP-C80 Series'

router.post('/ticket', async (req, res) => {
  try {
    const { roomName, queueNumber, companyName } = req.body

    if (!roomName || !queueNumber || !companyName) {
      return res.json({ code: 400, message: '缺少打印参数' })
    }

    const displayNumber = queueNumber.includes('_') ? queueNumber.split('_')[1] : queueNumber

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <style>
    @page {
      size: 80mm 60mm;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 5mm;
      width: 80mm;
      height: 60mm;
      font-family: "Microsoft YaHei", "SimHei", sans-serif;
      font-size: 14px;
      text-align: center;
      box-sizing: border-box;
    }
    .ticket {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .room {
      font-size: 16px;
      margin: 5px 0;
    }
    .number {
      font-size: 36px;
      font-weight: bold;
      color: #cc0000;
      margin: 5px 0;
    }
    .company {
      font-size: 13px;
      margin: 3px 0;
    }
    .footer {
      margin-top: 5px;
      font-size: 11px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="title">排号票</div>
    <div class="room">${roomName}</div>
    <div class="number">${displayNumber}</div>
    <div class="company">厂商：${companyName}</div>
    <div class="footer">请凭此票等候叫号</div>
  </div>
</body>
</html>
`

    res.json({
      code: 200,
      message: '打印成功',
      data: {
        html: htmlContent,
        printer: PRINTER_NAME
      }
    })
  } catch (error) {
    console.error('打印错误:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/printers', (req, res) => {
  res.json({ code: 200, data: [PRINTER_NAME] })
})

module.exports = router
