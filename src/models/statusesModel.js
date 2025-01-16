// Model untuk status
class Status {
  constructor(userId, mediaUrl, caption, mediaType, backgroundColor) {
    this.userId = userId;
    this.createdAt = new Date();
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam dari sekarang
    this.mediaUrl = mediaUrl;
    this.caption = caption;
    this.mediaType = mediaType;
    this.backgroundColor = backgroundColor;
  }

  // Metode untuk mengonversi objek Status menjadi objek yang dapat disimpan di Firestore
  toFirestore() {
    return {
      userId: this.userId,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      mediaUrl: this.mediaUrl,
      caption: this.caption,
      mediaType: this.mediaType,
      backgroundColor: this.backgroundColor,
    };
  }
}

module.exports = Status;
