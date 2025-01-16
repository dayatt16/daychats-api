const admin = require("../config/firebase");
const { v4: uuidv4 } = require("uuid"); // Mengimpor UUID
const User = require("../models/usersModel"); // Pastikan Anda memiliki model User

// Metode untuk mendapatkan semua pengguna dengan pencarian
const getAllUsers = async (searchQuery) => {
  try {
    const usersRef = admin.firestore().collection("users");
    let users = [];

    if (searchQuery) {
      // Format nomor telepon
      const formattedQuery = searchQuery.startsWith('0') 
        ? searchQuery.replace('0', '+62') 
        : searchQuery.startsWith('+62') 
          ? searchQuery 
          : '+62' + searchQuery;

      // Query untuk fullName (tidak berubah)
      const fullNameQuerySnapshot = await usersRef
        .where('fullName', '>=', searchQuery)
        .where('fullName', '<=', searchQuery + '\uf8ff')
        .get();
      users = users.concat(fullNameQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));

      // Query untuk phoneNumber dengan berbagai format
      const phoneQueries = [
        formattedQuery,
        searchQuery,
        searchQuery.startsWith('0') ? searchQuery.substring(1) : searchQuery,
        searchQuery.startsWith('+62') ? searchQuery.substring(3) : searchQuery,
      ];

      for (const query of phoneQueries) {
        const phoneNumberQuerySnapshot = await usersRef
          .where('phoneNumber', '>=', query)
          .where('phoneNumber', '<=', query + '\uf8ff')
          .get();
        users = users.concat(phoneNumberQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));
      }

      // Menghilangkan duplikat berdasarkan ID
      users = Array.from(new Set(users.map(a => a.id)))
        .map(id => {
          return users.find(a => a.id === id)
        });

    } else {
      // Jika tidak ada searchQuery, ambil semua pengguna (tidak berubah)
      const snapshot = await usersRef.get();
      users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return users;
  } catch (error) {
    throw new Error(`Gagal mendapatkan semua pengguna: ${error.message}`);
  }
};

// Metode untuk mendapatkan pengguna berdasarkan ID
const getUserById = async (userId) => {
  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    return { id: userDoc.id, ...userDoc.data() }; // Kembalikan data pengguna
  } catch (error) {
    throw new Error(`Gagal mendapatkan pengguna: ${error.message}`);
  }
};

// Metode untuk memperbarui gambar profil
const updateProfilePicture = async (userId, file) => {
  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const previousProfilePicture = userDoc.data().profilePicture; // Ambil URL gambar sebelumnya

    console.log('Previous Profile Picture:', previousProfilePicture);

    // Hapus gambar sebelumnya dari Firebase Storage jika ada
    if (previousProfilePicture) {
      const previousFileName = previousProfilePicture.split('/o/')[1].split('?')[0]; // Ambil nama file
      const previousFile = admin.storage().bucket().file(previousFileName);
      await previousFile.delete(); // Hapus file dari storage
    }

    const bucket = admin.storage().bucket();
    const fileName = `${uuidv4()}_${file.originalname}`; // Buat nama file unik menggunakan UUID
    const fileUpload = bucket.file(fileName);
    
    // Upload gambar ke Firebase Storage
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    // Encode fileName untuk URL
    const encodedFileName = encodeURIComponent(fileName);
    const profilePictureUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFileName}?alt=media`; // URL gambar

    // Update URL gambar di Firestore
    await userRef.update({ profilePicture: profilePictureUrl });

    return { profilePicture: profilePictureUrl }; // Kembalikan URL gambar
  } catch (error) {
    throw new Error(`Gagal memperbarui gambar profil: ${error.message}`);
  }
};

// Metode untuk memperbarui data pengguna
const updateUser = async (userId, userData) => {
  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    
    // Perbarui data pengguna dengan hanya field yang ada di userData
    await userRef.update(userData); // Perbarui data pengguna
    const updatedUserDoc = await userRef.get();
    return { id: updatedUserDoc.id, ...updatedUserDoc.data() }; // Kembalikan data pengguna yang diperbarui
  } catch (error) {
    throw new Error(`Gagal memperbarui pengguna: ${error.message}`);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfilePicture,
  updateUser,
  // ... existing methods ...
};
