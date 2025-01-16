const express = require("express");
const multer = require("multer");
const authController = require("../controllers/authControllers");

const router = express.Router();

// Konfigurasi Multer
const storage = multer.memoryStorage(); // Menyimpan file di memori
const upload = multer({ storage: storage });

router.post("/auth/verify", authController.verifyPhoneNumber);
router.post("/auth/confirm", authController.confirmVerification);
router.post("/auth/complete-registration", upload.single('profilePicture'), authController.completeRegistration);

// Endpoint untuk memperbarui status online
router.post("/auth/update-status", authController.updateUserStatus);

module.exports = router;
