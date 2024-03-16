import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../constants/common";

export function generateJwt(payload: any): string {
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyJwt(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export function getSecret(): string {
  return JWT_SECRET;
}
