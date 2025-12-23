import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("Bcrypt Verification", () => {
  it("should hash a string", async () => {
    const password = "password123";
    const hashed = await bcrypt.hash(password, 10);
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);

    const isMatch = await bcrypt.compare(password, hashed);
    expect(isMatch).toBe(true);
  });

  it("should throw if data is undefined", async () => {
    try {
      await bcrypt.hash(undefined, 10);
    } catch (e) {
      expect(e.message).toContain("data and salt arguments required");
    }
  });
});
