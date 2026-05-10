const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPrisma } = require('../prisma');
const { toUserDto } = require('../utils/dto');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  const token = jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
  return token;
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }

    const prisma = getPrisma();
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash,
      },
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: toUserDto(user) });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email, password are required' });
    }

    const prisma = getPrisma();
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: toUserDto(user) });
  } catch (err) {
    return next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const user = await prisma.users.findUnique({ where: { id: Number(req.user.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: toUserDto(user) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
