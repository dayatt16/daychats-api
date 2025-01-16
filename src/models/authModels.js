const admin = require("../config/firebase");

class User {
  constructor(phoneNumber, fullName) {
    this.phoneNumber = phoneNumber;
    this.fullName = fullName;
    this.about = `Hello, I'm ${fullName}!`;
    this.createdAt = admin.firestore.FieldValue.serverTimestamp();
    this.lastSeen = admin.firestore.FieldValue.serverTimestamp();
    this.isOnline = true;
    this.profilePicture = "https://";// Default URL atau kosong
  }

  toFirestore() {
    return {
      phoneNumber: this.phoneNumber,
      fullName: this.fullName,
      about: this.about,
      createdAt: this.createdAt,
      lastSeen: this.lastSeen,
      isOnline: this.isOnline,
      profilePicture: this.profilePicture,
    };
  }
}

module.exports = User;
