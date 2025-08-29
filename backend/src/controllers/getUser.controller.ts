import { Request } from "express";
import { AuthPayload } from "../middleware/auth.middleware";

export function getUser(req: Request): AuthPayload | undefined {
  return (req as any).user as AuthPayload | undefined;
}