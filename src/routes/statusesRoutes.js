const express = require("express");
const multer = require("multer");
const statusesController = require("../controllers/statusesController");

const router = express.Router();

// Konfigurasi Multer
const storage = multer.memoryStorage(); // Menyimpan file di memori
const upload = multer({ storage: storage });

// Endpoint untuk mendapatkan semua status
router.get("/statuses", statusesController.getAllStatuses);

// Endpoint untuk membuat status baru dengan upload file
router.post("/statuses", upload.single('mediaFile'), statusesController.createStatus);

// Endpoint untuk mendapatkan status berdasarkan userId
router.get("/statuses/:userId", statusesController.getStatusesByUserId);

// Endpoint untuk menghapus status berdasarkan ID
router.delete("/statuses/:id", statusesController.deleteStatusById);

module.exports = router;
