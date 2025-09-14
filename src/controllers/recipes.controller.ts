import type { PrismaClient } from '@prisma/client'
import type { Response } from 'express'
import type { AuthRequest } from '../middleware/checkAuth.js'

export async function createRecipe(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    const { title, description, image, ingredients } = req.body

    if (!req.userId) {
      return res.status(401).json({ error: 'Not authorized' })
    }

    if (!title || !ingredients) {
      return res.status(400).json({ error: 'Title and ingredients are required' })
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        image,
        ingredients: Array.isArray(ingredients)
          ? JSON.stringify(ingredients)
          : ingredients,
        userId: Number(req.userId),
      },
    })

    return res
      .status(201)
      .json({ message: 'Recipe created successfully', recipe })
  } catch (error) {
    console.error('createRecipe error:', error)
    return res.status(500).json({ error: 'Failed to create recipe' })
  }
}

export async function getAllRecipes(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return res.json({ recipes })
  } catch (error) {
    console.error('getAllRecipes error:', error)
    return res.status(500).json({ error: 'Failed to fetch recipes' })
  }
}

export async function getMyRecipes(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authorized' })
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId: Number(req.userId) },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ recipes })
  } catch (error) {
    console.error('getMyRecipes error:', error)
    return res.status(500).json({ error: 'Failed to fetch your recipes' })
  }
}

export async function deleteRecipe(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    const { id } = req.params

    if (!req.userId) {
      return res.status(401).json({ error: 'Not authorized' })
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: Number(id) } })

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    if (recipe.userId !== Number(req.userId)) {
      return res.status(403).json({ error: 'You cannot delete this recipe' })
    }

    await prisma.recipe.delete({ where: { id: Number(id) } })

    return res.status(200).json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('deleteRecipe error:', error)
    return res.status(500).json({ error: 'Failed to delete recipe' })
  }
}

export async function updateRecipe(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    const { id } = req.params
    const { title, description, image, ingredients } = req.body

    if (!req.userId) {
      return res.status(401).json({ error: 'Not authorized' })
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: Number(id) } })
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    if (recipe.userId !== Number(req.userId)) {
      return res.status(403).json({ error: 'You cannot update this recipe' })
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        image,
        ingredients: Array.isArray(ingredients)
          ? JSON.stringify(ingredients)
          : ingredients,
      },
    })

    return res.json({ message: 'Recipe updated successfully', recipe: updatedRecipe })
  } catch (error) {
    console.error('updateRecipe error:', error)
    return res.status(500).json({ error: 'Failed to update recipe' })
  }
}