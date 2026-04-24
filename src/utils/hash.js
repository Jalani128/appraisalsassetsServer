import bcrypt from "bcrypt";

// Hashed Password
export const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

// Compare Password
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
