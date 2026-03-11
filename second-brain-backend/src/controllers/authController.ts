import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, name } = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash
        }
      });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req: Request, res: Response) => {
     try {
       const { email, password } = loginSchema.parse(req.body);

       const user = await prisma.user.findUnique({ where: { email } });
       if (!user) {
         return res.status(401).json({ error: 'Invalid credentials' });
       }

       const isMatch = await bcrypt.compare(password, user.passwordHash);
       if (!isMatch) {
         return res.status(401).json({ error: 'Invalid credentials' });
       }

       const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

       res.status(200).json({
         token,
         user: { id: user.id, email: user.email, name: user.name }
       });
     } catch (error: any) {
       res.status(400).json({ error: error.message });
     }
  },

  me: async (req: any, res: Response) => {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, createdAt: true }
      });

      if (!dbUser) return res.status(404).json({ error: 'User not found' });
      
      res.json({ user: dbUser });
    } catch (e: any) {
      res.status(500).json({ error: 'Server error' });
    }
  }
};
