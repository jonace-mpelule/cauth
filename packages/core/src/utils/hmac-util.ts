import crypto from "node:crypto"

export function hashRefreshToken({ token, refreshTokenSecret}:{token: string, refreshTokenSecret: string}) {
  return crypto
    .createHmac("sha256", refreshTokenSecret)
    .update(token)
    .digest("hex");
}

export function verifyRefreshToken({ incomingToken, storedHash, refreshTokenSecret}:{incomingToken: string, storedHash: string, refreshTokenSecret: string}) {
  const incomingHash = hashRefreshToken({token:incomingToken, refreshTokenSecret});

  return crypto.timingSafeEqual(
    Buffer.from(incomingHash),
    Buffer.from(storedHash)
  );
}
