import { Router } from "express";
const router = Router()
import { registerUserController, verifyUserEmail, loginUserController, logoutUserController, uploadAvater, updateUserDetails, forgotPasswordController, verifyForgotPasswordController, resetPasswordController, refreshToken } from "../controllers/user.controller.js";
import authMiddleware from '../middleware/authMiddleware.js'

import upload from "../middleware/multer.js";

router.post('/register', registerUserController)
router.post('verify-email', verifyUserEmail)
router.post('/login', loginUserController)
router.get('/logout', authMiddleware, logoutUserController)

router.put('/upload-avatar', authMiddleware, upload.single("avatar"), uploadAvater)
router.put('/update-user', authMiddleware, updateUserDetails);
router.put('/forgot-password', forgotPasswordController);
router.put('/verify-forgot-password', verifyForgotPasswordController);
router.put('/reset-password', resetPasswordController);
router.post('/refresh-token', refreshToken)

export default router;