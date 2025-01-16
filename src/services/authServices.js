const admin = require("../config/firebase");
const User = require("../models/authModels");
const { parsePhoneNumber, isValidPhoneNumber } = require("libphonenumber-js");
const { v4: uuidv4 } = require("uuid");

class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// Fungsi untuk generate OTP 6 digit
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const initiateVerification = async (phoneNumber) => {
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new AuthError("Nomor telepon tidak valid", "INVALID_PHONE_NUMBER");
  }  
  try {
    const otp = generateOTP(); // Generate 6 digit OTP
    return { 
      success: true, 
      message: "Kode verifikasi telah dikirim",
      otp: otp // Ini akan ditampilkan di local notification Flutter
    };
  } catch (error) {
    throw new AuthError("Gagal mengirim kode verifikasi", "VERIFICATION_SEND_ERROR");
  }
};

const confirmVerification = async (phoneNumber) => {
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new AuthError("Nomor telepon tidak valid", "INVALID_PHONE_NUMBER");
  }

  const normalizedPhoneNumber = parsePhoneNumber(phoneNumber).format("E.164");

  try {
    const userQuery = await admin.firestore().collection("users")
      .where("phoneNumber", "==", normalizedPhoneNumber)
      .limit(1)
      .get();

    const isNewUser = userQuery.empty;

    if (!isNewUser) {
      const userDoc = userQuery.docs[0];
      const user = userDoc.data();
      const token = await createCustomToken(userDoc.id);
      return { 
        isNewUser: false, 
        token, 
        user: {
          id: userDoc.id,
          ...user
        }
      };
    }

    return { isNewUser: true };
  } catch (error) {
    console.error("Kesalahan dalam confirmVerification:", error);
    throw new AuthError("Gagal mengkonfirmasi verifikasi", "VERIFICATION_ERROR");
  }
};

const completeRegistration = async (phoneNumber, fullName, file) => {
  // Validasi input
  if (typeof phoneNumber !== 'string' || !fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
    throw new AuthError("Data tidak valid", "INVALID_INPUT");
  }

  try {
    const normalizedPhoneNumber = parsePhoneNumber(phoneNumber).format("E.164");
    console.log("Received phoneNumber:", phoneNumber);
    console.log("Received fullName:", fullName);

    // Cek apakah nomor telepon sudah ada di Firestore
    const userQuery = await admin.firestore().collection("users")
      .where("phoneNumber", "==", normalizedPhoneNumber)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      throw new AuthError("Nomor telepon sudah terdaftar", "PHONE_NUMBER_EXISTS");
    }

    const userData = new User(normalizedPhoneNumber, fullName);
    
    // Upload gambar ke Firebase Storage
    let profilePictureUrl = "";
    if (file) {
      const bucket = admin.storage().bucket();
      const fileName = `${uuidv4()}_${file.originalname}`; // Buat nama file unik
      const fileUpload = bucket.file(fileName);
      await fileUpload.save(file.buffer, {
        metadata: { contentType: file.mimetype },
      });

      // Encode fileName untuk URL
      const encodedFileName = encodeURIComponent(fileName);
      profilePictureUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFileName}?alt=media`; // URL gambar
    }
    
    userData.profilePicture = profilePictureUrl; // Simpan URL gambar ke userData

    const userRef = await admin.firestore().collection("users").add(userData.toFirestore());
    const token = await createCustomToken(userRef.id);
    return { 
      token,
      user: {
        id: userRef.id,
        fullName: fullName,
        phoneNumber: normalizedPhoneNumber,
        profilePicture: profilePictureUrl // Kembalikan URL gambar
      }
    };
  } catch (error) {
    throw new AuthError("Gagal menyelesaikan registrasi", "REGISTRATION_ERROR");
  }
};

const createCustomToken = async (userId) => {
  try {
    return await admin.auth().createCustomToken(userId);
  } catch (error) {
    console.error("Kesalahan membuat custom token:", error);
    throw new AuthError("Gagal membuat token", "TOKEN_CREATION_ERROR");
  }
};

// Fungsi untuk memperbarui status online
const updateUserStatus = async (userId, isOnline) => {
  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    await userRef.update({ isOnline: isOnline }); // Memperbarui status isOnline
  } catch (error) {
    console.error("Kesalahan memperbarui status pengguna:", error);
    throw new Error("Gagal memperbarui status pengguna");
  }
};

module.exports = {
  initiateVerification,
  confirmVerification,
  completeRegistration,
  updateUserStatus,
};
