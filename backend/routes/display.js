const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/settings', async (req, res) => {
  try {
    let settings = await db.DisplaySetting.findOne()

    if (!settings) {
      settings = await db.DisplaySetting.create({
        screenTitle: '排号管理系统',
        cardColor: '#6ba6d6',
        refreshInterval: '10',
        displayCount: 10,
        voiceType: 'female',
        speechRate: '0.8',
        status: 'on'
      })
    }

    res.json({
      code: 200,
      message: 'success',
      data: settings
    })
  } catch (error) {
    console.error('获取大屏设置失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/settings', async (req, res) => {
  try {
    const { screenTitle, cardColor, refreshInterval, displayCount, voiceType, speechRate } = req.body

    let settings = await db.DisplaySetting.findOne()

    if (!settings) {
      settings = await db.DisplaySetting.create({
        screenTitle: screenTitle || '排号管理系统',
        cardColor: cardColor || '#6ba6d6',
        refreshInterval: refreshInterval || '10',
        displayCount: displayCount || 10,
        voiceType: voiceType || 'female',
        speechRate: speechRate || '0.8'
      })
    } else {
      await settings.update({
        screenTitle: screenTitle !== undefined ? screenTitle : settings.screenTitle,
        cardColor: cardColor !== undefined ? cardColor : settings.cardColor,
        refreshInterval: refreshInterval !== undefined ? refreshInterval : settings.refreshInterval,
        displayCount: displayCount !== undefined ? displayCount : settings.displayCount,
        voiceType: voiceType !== undefined ? voiceType : settings.voiceType,
        speechRate: speechRate !== undefined ? speechRate : settings.speechRate
      })
    }

    res.json({
      code: 200,
      message: '保存成功',
      data: settings
    })
  } catch (error) {
    console.error('保存大屏设置失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/status', async (req, res) => {
  try {
    let settings = await db.DisplaySetting.findOne()

    if (!settings) {
      settings = await db.DisplaySetting.create({
        status: 'on'
      })
    }

    res.json({
      code: 200,
      message: 'success',
      data: { status: settings.status }
    })
  } catch (error) {
    console.error('获取大屏状态失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/status', async (req, res) => {
  try {
    const { status } = req.body

    let settings = await db.DisplaySetting.findOne()

    if (!settings) {
      settings = await db.DisplaySetting.create({
        status: status || 'on'
      })
    } else {
      await settings.update({
        status: status !== undefined ? status : settings.status
      })
    }

    res.json({
      code: 200,
      message: '状态更新成功',
      data: { status: settings.status }
    })
  } catch (error) {
    console.error('更新大屏状态失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router