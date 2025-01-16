 const express = require("express")
const router = express.Router()
const chatsController = require("../controllers/chatsController")

// Menggunakan userId untuk mendapatkan daftar chat
router.get("/chats/:userId", chatsController.getChatsByIdUser); 

// Mempertahankan endpoint untuk mendapatkan pesan berdasarkan chatId
router.get("/chats/:chatId/messages", chatsController.getMessagesByChatId); 

// Mengubah endpoint untuk mengirim pesan baru tanpa chatId
router.post("/chats/messages", chatsController.sendMessage); // Endpoint baru
// Menandai chat sebagai terbaca
router.put("/chats/:chatId/read/:userId", chatsController.markChatAsRead);


module.exports = router
