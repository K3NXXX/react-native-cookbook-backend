import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'
import os from 'os'
import authRoutes from './routes/auth.routes.js'

const prisma = new PrismaClient()
const app = express()

const PORT = 3000

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes(prisma))

function getIPAddress(): string {
	const interfaces = os.networkInterfaces()
	let localIP = 'localhost'

	for (const iface of Object.values(interfaces)) {
		if (!iface) continue
		for (const details of iface) {
			if (details.family === 'IPv4' && !details.internal) {
				if (
					details.address.startsWith('192.168.') ||
					details.address.startsWith('10.')
				) {
					return details.address
				}
				localIP = details.address
			}
		}
	}
	return localIP
}
const ipAddress = getIPAddress()

app.listen(PORT, () => {
	console.log(`Server is running at http://${ipAddress}:${PORT}`)
})


