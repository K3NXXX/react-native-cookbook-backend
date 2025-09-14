import type { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import {
	getMe,
	loginUser,
	registerUser,
  updateUser,
  uploadAvatar,
} from '../controllers/auth.controller.js'
import { checkAuth } from '../middleware/checkAuth.js'

export default function authRoutes(prisma: PrismaClient) {
	const router = Router()

	router.post('/register', (req, res) => registerUser(req, res, prisma))
	router.post('/login', (req, res) => loginUser(req, res, prisma))
	router.get('/me', checkAuth, (req, res) => getMe(req, res, prisma))
	router.put('/update', checkAuth, (req, res) => updateUser(req, res, prisma))
	router.put('/avatar', checkAuth, (req, res) => uploadAvatar(req, res, prisma))

	return router
}
