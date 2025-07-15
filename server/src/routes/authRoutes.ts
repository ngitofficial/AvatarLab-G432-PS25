// server/src/routes/authRoutes.ts
import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import GeneratedContent from '../models/History';

const router = express.Router();

// --- ADD THIS BLOCK HERE ---
router.use((req, res, next) => {
  console.log(`[Auth Router] Received request: ${req.method} ${req.originalUrl}`);
  next(); // Don't forget to call next() to pass the request to subsequent handlers
});
// --- END OF BLOCK TO ADD ---

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, getProfile);
// Route to get a user's generated content history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        // Assuming protect middleware adds user._id to req.user
        const userId = (req as any).user._id;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated.' });
        }

        const userHistory = await GeneratedContent.find({ userId })
                                                .sort({ timestamp: -1 }) // Sort by newest first
                                                .limit(100); // Limit results to prevent overload

        res.json(userHistory);
    } catch (error: any) {
        console.error('Error fetching user history:', error);
        res.status(500).json({ message: 'Server error fetching history.' });
    }
});

export default router;