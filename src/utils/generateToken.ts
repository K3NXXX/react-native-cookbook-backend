import jwt from "jsonwebtoken";

export function generateToken(userId: number) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}
