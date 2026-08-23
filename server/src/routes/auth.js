import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/login', (req, res) => {
  const { password } = req.body || {}

  if (!password || password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  const token = jwt.sign({ sub: 'owner' }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.json({ token })
})

export default router
