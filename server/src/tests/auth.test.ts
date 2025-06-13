import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput, type SignupInput } from '../schema';
import { login, signup } from '../handlers/auth';
import { eq } from 'drizzle-orm';

describe('auth handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('login', () => {
    it('should login with correct demo credentials', async () => {
      const testInput: LoginInput = {
        email: 'user@example.com',
        password: 'password'
      };

      const result = await login(testInput);

      expect(result.user).toBeDefined();
      expect(result.user.email).toEqual('user@example.com');
      expect(result.user.name).toEqual('Creative User');
      expect(result.user.id).toEqual('user-1');
      expect(result.token).toBeDefined();
      expect(result.token).toMatch(/^mock-jwt-token-/);
    });

    it('should reject invalid credentials', async () => {
      const testInput: LoginInput = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      expect(login(testInput)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const testInput: SignupInput = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'newpassword'
      };

      const result = await signup(testInput);

      expect(result.user).toBeDefined();
      expect(result.user.name).toEqual('New User');
      expect(result.user.email).toEqual('newuser@example.com');
      expect(result.user.id).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.token).toMatch(/^mock-jwt-token-/);

      // Verify user was saved to database
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, 'newuser@example.com'))
        .execute();

      expect(users).toHaveLength(1);
      expect(users[0].name).toEqual('New User');
      expect(users[0].email).toEqual('newuser@example.com');
    });

    it('should reject duplicate email', async () => {
      const testInput: SignupInput = {
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Create first user
      await signup(testInput);

      // Try to create another user with same email
      const duplicateInput: SignupInput = {
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password456'
      };

      expect(signup(duplicateInput)).rejects.toThrow('User already exists');
    });
  });
});