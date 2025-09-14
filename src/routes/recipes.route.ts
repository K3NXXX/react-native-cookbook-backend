import type { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { createRecipe, deleteRecipe, getAllRecipes, getMyRecipes } from '../controllers/recipes.controller.js'
import { checkAuth } from '../middleware/checkAuth.js'

export default function recipesRoutes(prisma: PrismaClient) {
  const router = Router()

  router.post('/', checkAuth, (req, res) => createRecipe(req, res, prisma))

  router.get('/', (req, res) => getAllRecipes(req, res, prisma))

  router.get('/my', checkAuth, (req, res) => getMyRecipes(req, res, prisma))

  router.delete('/:id', checkAuth, (req, res) => deleteRecipe(req, res, prisma)) 

  return router
}
