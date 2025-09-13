import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

export default function authRoutes(prisma: PrismaClient) {
  const router = Router();

  router.post("/register", (req, res) => registerUser(req, res, prisma));
  router.post("/login", (req, res) => loginUser(req, res, prisma));

  return router;
}
