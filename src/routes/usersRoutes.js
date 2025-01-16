const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const multer = require("multer");

// Konfigurasi Multer
const storage = multer.memoryStorage(); // Menyimpan file di memori
const upload = multer({ storage: storage });

router.get('/users', usersController.getAllUsers);
router.get('/users/:id', usersController.getUserById);
router.put('/users/:id', upload.single('profilePicture'), usersController.updateUser); // Endpoint untuk update user dan gambar profil

module.exports = router;