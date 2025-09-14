// This is a mock database for demonstration purposes.
// In a real application, you would use a proper database like PostgreSQL,
// and a library like Prisma or Drizzle to interact with it.

export type User = {
  id: string;
  email: string;
  passwordHash: string;
};

// Using a Map to simulate a collection in a database.
const users = new Map<string, User>();

// Pre-populate with a user for testing login
// In a real app, this would not exist.
import bcrypt from 'bcrypt';
const saltRounds = 10;
const password = 'password123';
const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(password, salt);

users.set('patient@example.com', {
    id: '1',
    email: 'patient@example.com',
    passwordHash: hash
});


export const usersDb = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    return users.get(email);
  },
  
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    if (users.has(user.email)) {
        throw new Error('User already exists');
    }
    const newUser = { id: String(users.size + 1), ...user };
    users.set(user.email, newUser);
    return newUser;
  },
};
