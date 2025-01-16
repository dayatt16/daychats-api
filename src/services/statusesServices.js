const admin = require("../config/firebase");
const db = admin.firestore();
const Status = require("../models/statusesModel");
const { v4: uuidv4 } = require("uuid");

// Mendapatkan semua status
const getAllStatuses = async () => {
  await deleteExpiredStatuses(); // Panggil fungsi untuk menghapus status yang sudah kedaluwarsa
  const statusesRef = db.collection("statuses");
  const snapshot = await statusesRef.get();
  const statuses = await Promise.all(snapshot.docs.map(async (doc) => {
    const statusData = { statusId: doc.id, createdAt: doc.data().createdAt, userId: doc.data().userId }; // Ambil statusId, createdAt, dan userId
    const userData = await getUserData(statusData.userId); // Ambil data pengguna
    return { 
      statusId: statusData.statusId, 
      createdAt: statusData.createdAt, 
      userId: statusData.userId,
      user: { 
        fullName: userData.fullName, 
        profilePicture: userData.profilePicture 
      } 
    }; // Gabungkan data status dan pengguna
  }));
  return statuses;
};

// Membuat status baru
const createStatus = async (statusData, file) => {
  const { userId, caption, mediaType, backgroundColor } = statusData;
  let mediaUrl = "";

  // Jika ada file yang diupload, simpan ke Firebase Storage
  if (file) {
    const bucket = admin.storage().bucket();
    const fileName = `${uuidv4()}_${file.originalname}`; // Buat nama file unik
    const fileUpload = bucket.file(fileName);
    
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    // Encode fileName untuk URL
    const encodedFileName = encodeURIComponent(fileName);
    mediaUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFileName}?alt=media`; // URL gambar
  }

  // Pastikan tidak ada nilai yang undefined
  const newStatus = new Status(
    userId,
    mediaUrl || null, // Jika mediaUrl tidak ada, set ke null
    caption || null, // Jika caption tidak ada, set ke null
    mediaType || "text", // Set default mediaType jika tidak ada
    backgroundColor || null // Jika backgroundColor tidak ada, set ke null
  );
  
  // Gunakan toFirestore() untuk menyimpan status ke Firestore
  const statusRef = await db.collection("statuses").add(newStatus.toFirestore());
  return { id: statusRef.id, ...newStatus.toFirestore() }; // Kembalikan data yang disimpan
};

// Mendapatkan status berdasarkan userId
const getStatusesByUserId = async (userId) => {
  await deleteExpiredStatuses(); // Panggil fungsi untuk menghapus status yang sudah kedaluwarsa
  const statusesRef = db.collection("statuses");
  const snapshot = await statusesRef.where("userId", "==", userId).get();
  const statuses = await Promise.all(snapshot.docs.map(async (doc) => {
    const statusData = { 
      id: doc.id, 
      createdAt: doc.data().createdAt, 
      expiresAt: doc.data().expiresAt, // Ambil expiresAt
      userId: doc.data().userId, 
      mediaUrl: doc.data().mediaUrl, // Ambil mediaUrl
      caption: doc.data().caption, // Ambil caption
      mediaType: doc.data().mediaType, // Ambil mediaType
      backgroundColor: doc.data().backgroundColor // Ambil backgroundColor
    }; // Ambil semua data yang diperlukan

    // Ambil data pengguna
    const userData = await getUserData(statusData.userId);
    
    return { 
      ...statusData, // Gabungkan data status
      user: { 
        fullName: userData.fullName, 
        profilePicture: userData.profilePicture 
      } 
    }; // Kembalikan data status dan pengguna
  }));
  return statuses;
};

// Fungsi untuk mendapatkan data pengguna berdasarkan userId
const getUserData = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null; // Kembalikan data pengguna
};

// Fungsi untuk menghapus status yang sudah kedaluwarsa
const deleteExpiredStatuses = async () => {
  const statusesRef = db.collection("statuses");
  const now = admin.firestore.Timestamp.now();
  const snapshot = await statusesRef.where("expiresAt", "<", now).get();

  const batch = db.batch();
  snapshot.docs.forEach(async doc => {
    const mediaUrl = doc.data().mediaUrl; // Ambil URL media jika ada
    batch.delete(doc.ref); // Hapus dokumen yang sudah kedaluwarsa

    // Jika ada mediaUrl, hapus file dari Firebase Storage
    if (mediaUrl) {
      const fileName = mediaUrl.split('/o/')[1].split('?')[0]; // Ambil nama file
      const file = admin.storage().bucket().file(fileName);
      await file.delete(); // Hapus file dari storage
    }
  });

  await batch.commit(); // Komit perubahan batch
};

// Metode untuk menghapus status berdasarkan ID
const deleteStatusById = async (statusId) => {
  const statusRef = db.collection("statuses").doc(statusId);
  const statusDoc = await statusRef.get();

  if (!statusDoc.exists) {
    throw new Error('Status not found');
  }

  const mediaUrl = statusDoc.data().mediaUrl; // Ambil URL media

  // Hapus status dari Firestore
  await statusRef.delete();

  // Jika ada mediaUrl, hapus file dari Firebase Storage
  if (mediaUrl) {
    const fileName = mediaUrl.split('/o/')[1].split('?')[0]; // Ambil nama file
    const file = admin.storage().bucket().file(fileName);
    await file.delete(); // Hapus file dari storage
  }

  return { message: 'Status deleted successfully' }; // Kembalikan pesan sukses
};

module.exports = {
  getAllStatuses,
  createStatus,
  getStatusesByUserId,
  deleteStatusById,
};
