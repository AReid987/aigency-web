import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput, type SignupInput, type User, type AuthResponse } from '../schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  // Mock implementation - always return dummy user for specific credentials
  if (input.email === 'user@example.com' && input.password === 'password') {
    const user: User = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Creative User',
      avatar_url: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return {
      user,
      token: 'mock-jwt-token-' + randomUUID()
    };
  }
  
  throw new Error('Invalid credentials');
};

export const signup = async (input: SignupInput): Promise<AuthResponse> => {
  try {
    // Check if user already exists
    const existingUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();
    
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const userId = randomUUID();
    const result = await db.insert(usersTable)
      .values({
        id: userId,
        email: input.email,
        name: input.name
      })
      .returning()
      .execute();
    
    const user = result[0];
    
    return {
      user,
      token: 'mock-jwt-token-' + randomUUID()
    };
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
};