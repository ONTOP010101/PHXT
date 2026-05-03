require('dotenv').config()
const db = require('./models')

async function testCompany() {
  try {
    console.log('Testing Company model...')
    
    const companies = await db.Company.findAll()
    console.log('Companies found:', companies.length)
    
    const newCompany = await db.Company.create({
      companyName: 'Test Company',
      phone: '13800138000'
    })
    console.log('Created company:', newCompany.id)
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

testCompany()