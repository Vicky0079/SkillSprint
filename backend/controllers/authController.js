const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { REFERRAL, DAY, generateReferralCode, ensureReferralCode, publicUser } = require('../services/premium');

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const inviteCode = (req.body.referralCode || '').trim().toUpperCase();

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Optional invite code: the new user gets a few free Premium days, the inviter is rewarded later
        // (when this user passes their first challenge).
        let inviter = null;
        if (inviteCode) {
            inviter = await prisma.user.findUnique({ where: { referralCode: inviteCode } });
            if (!inviter) return res.status(400).json({ message: 'That invite code is not valid' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
                referralCode: await generateReferralCode(),
                referredById: inviter ? inviter.id : null,
                premiumUntil: inviter ? new Date(Date.now() + REFERRAL.friendDays * DAY) : null,
            },
        });

        res.status(201).json({
            ...publicUser(user),
            token: generateToken(user.id, user.role),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                ...publicUser(user),
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user profile (with latest XP and Premium status)
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        await ensureReferralCode(req.user.id); // older accounts get their code here
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        res.json(publicUser(user));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe };
