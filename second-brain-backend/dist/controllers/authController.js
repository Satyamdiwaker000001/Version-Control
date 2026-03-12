"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
exports.authController = {
    register: async (req, res) => {
        try {
            const { email, password, name } = registerSchema.parse(req.body);
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash
                }
            });
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({
                token,
                user: { id: user.id, email: user.email, name: user.name }
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            res.status(200).json({
                token,
                user: { id: user.id, email: user.email, name: user.name }
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    me: async (req, res) => {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, email: true, name: true, createdAt: true }
            });
            if (!dbUser)
                return res.status(404).json({ error: 'User not found' });
            res.json({ user: dbUser });
        }
        catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    }
};
