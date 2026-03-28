import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ハッシュで利用するソルト
const SALT_ROUNDS = 10;

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const signAccessToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

export const confirmPassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};
