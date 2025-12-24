let argon2Promise: Promise<typeof import("argon2")> | null = null;

async function loadArgon2() {
  if (!argon2Promise) {
    argon2Promise = import("argon2");
  }
  const mod = await argon2Promise;
  return (mod as unknown as { default?: typeof mod }).default ?? mod;
}

export async function hashPassword(password: string) {
  const argon2 = await loadArgon2();
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string) {
  const argon2 = await loadArgon2();
  return argon2.verify(hash, password);
}
