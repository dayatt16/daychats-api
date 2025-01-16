const chatService = require("../services/chatsServices");

class ChatController {
  async getChatsByIdUser(req, res) {
    try {
      const { userId } = req.params;
      const chats = await chatService.getChatsByUserId(userId);
      res.status(200).json({
        success: true,
        data: chats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get messages by chat ID
  async getMessagesByChatId(req, res) {
    try {
      const { chatId } = req.params;
      const messages = await chatService.getMessagesByChatId(chatId);
      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Send new message without requiring chatId
  async sendMessage(req, res) {
    try {
      const messageData = req.body; // Ambil data dari body

      // Validasi input
      if (
        !messageData.senderId ||
        !messageData.receiverId ||
        !messageData.content
      ) {
        return res.status(400).json({
          success: false,
          error: "senderId, receiverId, and content are required.",
        });
      }

      const newMessage = await chatService.sendMessage(null, messageData); // Kirim null untuk chatId
      res.status(201).json({
        success: true,
        data: newMessage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Mark a chat as read
  async markChatAsRead(req, res) {
    try {
      const { chatId, userId } = req.params;
      await chatService.markChatAsRead(chatId, userId);
      res.status(200).json({
        success: true,
        message: "Chat marked as read successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ChatController();