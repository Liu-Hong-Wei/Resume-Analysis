import express from 'express'
import cors from 'cors'

app.use(cors({ origin: 'http://localhost:5173' })) // 前端地址
const app = express()
const port = 3001

app.get('/', (req, res) => {
      res.send('Hello from Express!')
})

app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
})
