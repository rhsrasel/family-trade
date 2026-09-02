// lib/auth.js

import {jwtVerify, SignJWT} from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function createToken(user) {
  return new SignJWT({
    id: user._id.toString(),
    role: "user",
    email: user.email,
  })
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getAdminFromRequest(request) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) return null;

  try {
    const {payload} = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request) {
  const token = request.cookies.get("user_token")?.value;

  if (!token) return null;

  try {
    const {payload} = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}