class User {
  constructor(about, fullName, profilePicture = '') {
    this.about = about;
    this.fullName = fullName;
    this.profilePicture = profilePicture; // URL gambar profil
  }

  toFirestore() {
    return {
      about: this.about,
      fullName: this.fullName,
      profilePicture: this.profilePicture,
    };
  }
}

module.exports = User;
