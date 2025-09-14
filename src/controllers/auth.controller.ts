import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { generateToken } from '../utils/generateToken.js'
import type { AuthRequest } from '../middleware/checkAuth.js'

export async function registerUser(req: Request, res: Response, prisma: PrismaClient) {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function loginUser(req: Request, res: Response, prisma: PrismaClient) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user.id);

    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}


export async function getMe(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        avatar: true
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function updateUser(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    const { name, email, newPassword, currentPassword } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    let updatedPassword = user.password;
    if (newPassword && newPassword.trim() !== "") {
      updatedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        email: email || user.email,
        password: updatedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken(updatedUser.id);

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      token,
    });

  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({ error: "Failed to update user data" });
  }
}



export async function uploadAvatar(req: AuthRequest, res: Response, prisma: PrismaClient) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const { avatar } = req.body; 
    if (!avatar) {
      return res.status(400).json({ error: "Avatar is required" });
    }

    const user = await prisma.user.update({
      where: { id: Number(req.userId) },
      data: { avatar },
      select: { id: true, name: true, email: true, avatar: true },
    });

    return res.status(200).json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("uploadAvatar error:", error);
    return res.status(500).json({ error: "Failed to upload avatar" });
  }
}

