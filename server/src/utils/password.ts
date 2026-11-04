import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare candidate plain password against stored bcrypt hash
 */
export async function comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hash);
}
