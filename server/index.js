const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true })
})

if (require.main === module) {
  const port = process.env.PORT || 3001

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

module.exports = app
