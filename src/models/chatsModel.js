class Chat {
  constructor(
    userId,
    contactId,
    lastMessage,
    lastMessageTime,
    messageStatus,
    unreadCount,
    participants
  ) {
    this.userId = userId;
    this.contactId = contactId;
    this.lastMessage = lastMessage;
    this.lastMessageTime = lastMessageTime;
    this.messageStatus = messageStatus;
    this.unreadCount = unreadCount;
    this.participants = participants; // Array of participant IDs
  }

  toFirestore() {
    return {
      userId: this.userId,
      contactId: this.contactId,
      lastMessage: this.lastMessage,
      lastMessageTime: this.lastMessageTime,
      messageStatus: this.messageStatus,
      unreadCount: this.unreadCount,
      participants: this.participants,
    };
  }
}

// New Message class to represent messages in the sub-collection
class Message {
  constructor(senderId, receiverId, content, timestamp, status, messageType) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.timestamp = timestamp;
    this.status = status;
    this.messageType = messageType; // e.g., "text", "image", etc.
  }

  toFirestore() {
    return {
      senderId: this.senderId,
      receiverId: this.receiverId,
      content: this.content,
      timestamp: this.timestamp,
      status: this.status,
      messageType: this.messageType,
    };
  }
}

// Exporting both classes
module.exports = { Chat, Message };