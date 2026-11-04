import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env.js";

export interface JwtTokenPayload {
  userId: string;
  email?: string | undefined;
  role?: string | undefined;
  authId?: string | undefined;
}

export function signAccessToken(payload: JwtTokenPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET as string, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): JwtTokenPayload {
  return jwt.verify(token, ENV.JWT_SECRET as string) as JwtTokenPayload;
}

export function signRefreshToken(payload: JwtTokenPayload): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET as string, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyRefreshToken(token: string): JwtTokenPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET as string) as JwtTokenPayload;
}
