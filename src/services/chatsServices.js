const admin = require("../config/firebase");
const db = admin.firestore();
const { Chat, Message } = require("../models/chatsModel");

// Get all chats for a specific user
const getChatsByUserId = async (userId) => {
  try {
    const chatsRef = db.collection("chats");
    const snapshot = await chatsRef
      .where("participants", "array-contains", userId)
      .get();

    const chats = [];
    for (const doc of snapshot.docs) {
      const chatData = { id: doc.id, ...doc.data() };

      // Ambil data pengguna untuk setiap peserta, kecuali userId
      const participantsData = await Promise.all(
        chatData.participants
          .filter((participantId) => participantId !== userId)
          .map(async (participantId) => {
            const userDoc = await db
              .collection("users")
              .doc(participantId)
              .get();
            return { id: userDoc.id, ...userDoc.data() };
          })
      );

      // Tentukan unreadCount berdasarkan apakah userId adalah sender atau receiver
      const isReceiver =
        chatData.participants.includes(userId) &&
        chatData.lastMessageSenderId !== userId;
      const unreadCount = isReceiver ? chatData.unreadCount : 0;

      // Tambahkan unreadCount ke chatData
      chats.push({ ...chatData, participantsData, unreadCount });
    }

    return chats;
  } catch (error) {
    throw new Error(`Error getting chats: ${error.message}`);
  }
};

// Get messages for a specific chat
const getMessagesByChatId = async (chatId) => {
  try {
    const messagesRef = db
      .collection("chats")
      .doc(chatId)
      .collection("messages");
    const snapshot = await messagesRef.orderBy("timestamp", "desc").get();

    const messages = [];
    for (const doc of snapshot.docs) {
      const messageData = { id: doc.id, ...doc.data() };

      // Ambil data pengguna untuk sender dan receiver
      const senderDoc = await db
        .collection("users")
        .doc(messageData.senderId)
        .get();
      const receiverDoc = await db
        .collection("users")
        .doc(messageData.receiverId)
        .get();

      messages.push({
        ...messageData,
        senderData: { id: senderDoc.id, ...senderDoc.data() },
        receiverData: { id: receiverDoc.id, ...receiverDoc.data() },
      });
    }

    return messages;
  } catch (error) {
    throw new Error(`Error getting messages: ${error.message}`);
  }
};

// Send a new message
const sendMessage = async (chatId, messageData) => {
  try {
    let newChatId = chatId;
    let isNewChat = false; // Menandai apakah ini chat baru atau tidak

    // Jika chatId tidak diberikan, cari chat yang sudah ada
    if (!chatId) {
      const chatsRef = db.collection("chats");
      const chatSnapshot = await chatsRef
        .where("participants", "array-contains", messageData.senderId) // Ambil chat yang melibatkan senderId
        .get();

      // Filter untuk menemukan chat yang juga melibatkan receiverId
      const existingChat = chatSnapshot.docs.find((doc) =>
        doc.data().participants.includes(messageData.receiverId)
      );

      if (existingChat) {
        newChatId = existingChat.id; // Ambil ID chat yang sudah ada
      } else {
        // Jika chat belum ada, buat chat baru
        const newChat = new Chat(
          messageData.senderId,
          messageData.receiverId,
          messageData.content,
          admin.firestore.Timestamp.now(),
          "sent",
          1, // unreadCount diatur ke 1 karena ini adalah pesan pertama untuk penerima
          [messageData.senderId, messageData.receiverId] // participants
        );

        // Tambahkan chat baru ke koleksi chats
        const chatDocRef = await chatsRef.add(newChat.toFirestore());
        newChatId = chatDocRef.id; // Simpan ID chat baru
        isNewChat = true; // Tandai bahwa ini adalah chat baru
      }
    }

    // Dapatkan referensi ke subkoleksi messages
    const messagesRef = db
      .collection("chats")
      .doc(newChatId)
      .collection("messages");

    // Buat pesan baru
    const newMessage = new Message(
      messageData.senderId,
      messageData.receiverId,
      messageData.content,
      admin.firestore.Timestamp.now(),
      "sent",
      messageData.messageType || "text"
    );

    // Tambahkan pesan ke subkoleksi messages
    const messageDoc = await messagesRef.add(newMessage.toFirestore());

    // Update dokumen chat dengan informasi pesan terakhir
    await db
      .collection("chats")
      .doc(newChatId)
      .update({
        lastMessage: messageData.content,
        lastMessageTime: newMessage.timestamp,
        messageStatus: "sent",
        lastMessageSenderId: messageData.senderId,
        unreadCount: isNewChat
          ? 1 // Set unreadCount ke 1 jika chat baru
          : messageData.senderId !== messageData.receiverId 
            ? admin.firestore.FieldValue.increment(1) // Tambahkan unreadCount jika bukan pengirim
            : admin.firestore.FieldValue.increment(0) // Tidak menambah unreadCount jika pengirim adalah penerima
      });

    return { id: messageDoc.id, ...newMessage.toFirestore() };
  } catch (error) {
    throw new Error(`Error sending message: ${error.message}`);
  }
};

// Mark chat as read to reset unreadCount
// Mark a chat as read
const markChatAsRead = async (chatId, userId) => {
  try {
    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      throw new Error("Chat not found");
    }

    const chatData = chatDoc.data();

    // Pastikan userId adalah penerima pesan terakhir
    if (chatData.lastMessageSenderId !== userId) {
      await chatRef.update({
        unreadCount: 0, // Reset unreadCount menjadi 0
        messageStatus: "read", // Set status menjadi "read"
      });

      // Update status di sub-koleksi messages
      const messagesRef = chatRef.collection("messages");
      const messagesSnapshot = await messagesRef.get();
      const batch = db.batch();

      messagesSnapshot.forEach((doc) => {
        batch.update(doc.ref, { status: "read" }); // Ubah status menjadi "read"
      });

      await batch.commit(); // Komit perubahan batch
    } else {
      throw new Error("You cannot mark this chat as read");
    }
  } catch (error) {
    throw new Error(`Error marking chat as read: ${error.message}`);
  }
};



module.exports = {
  getChatsByUserId,
  getMessagesByChatId,
  sendMessage,
  markChatAsRead,
};
