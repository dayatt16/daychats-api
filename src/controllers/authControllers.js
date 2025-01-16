const authService = require("../services/authServices");

const verifyPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_PHONE_NUMBER",
          message: "Nomor telepon diperlukan"
        }
      });
    }
    const result = await authService.initiateVerification(phoneNumber);
    return res.status(200).json({
      success: true,
      message: result.message,
      otp: result.otp
    });
  } catch (error) {
    console.error("Kesalahan verifikasi:", error);
    return res.status(400).json({
      success: false,
      error: {
        code: error.code || "VERIFICATION_ERROR",
        message: error.message
      }
    });
  }
};

const confirmVerification = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const result = await authService.confirmVerification(phoneNumber);
    if (result.isNewUser) {
      return res.status(200).json({
        success: true,
        data: {
          isNewUser: true,
          message: "Verifikasi berhasil, silakan lengkapi registrasi",
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        data: {
          isNewUser: false,
          message: "Login berhasil",
          token: result.token,
          user: result.user,
        },
      });
    }
  } catch (error) {
    console.error("Kesalahan konfirmasi:", error);
    return res.status(400).json({
      success: false,
      error: {
        code: error.code || "CONFIRMATION_ERROR",
        message: error.message || "Terjadi kesalahan saat konfirmasi"
      }
    });
  }
};

const completeRegistration = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log isi request body
    const { phoneNumber, fullName } = req.body;

    // Log tipe data
    console.log("Type of phoneNumber:", typeof phoneNumber);
    console.log("Type of fullName:", typeof fullName);

    // Validasi input
    if (typeof phoneNumber !== 'string' || typeof fullName !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Nomor telepon dan nama lengkap harus berupa string."
        }
      });
    }

    const file = req.file; // Dapatkan file dari request
    const result = await authService.completeRegistration(phoneNumber, fullName, file); // Tambahkan file ke parameter
    return res.status(201).json({
      success: true,
      data: {
        message: "Registrasi berhasil",
        token: result.token,
        user: result.user
      }
    });
  } catch (error) {
    console.error("Kesalahan pendaftaran:", error);
    return res.status(400).json({
      success: false,
      error: {
        code: error.code || "REGISTRATION_ERROR",
        message: error.message
      }
    });
  }
};

// Fungsi untuk memperbarui status online
const updateUserStatus = async (req, res) => {
  try {
    const { userId, isOnline } = req.body; // Ambil userId dan status dari body

    // Validasi input
    if (!userId || typeof isOnline !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "userId dan isOnline diperlukan"
        }
      });
    }

    // Panggil service untuk memperbarui status
    await authService.updateUserStatus(userId, isOnline);

    return res.status(200).json({
      success: true,
      message: "Status pengguna berhasil diperbarui"
    });
  } catch (error) {
    console.error("Kesalahan memperbarui status:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: error.code || "UPDATE_STATUS_ERROR",
        message: error.message
      }
    });
  }
};

module.exports = {
  verifyPhoneNumber,
  confirmVerification,
  completeRegistration,
  updateUserStatus, // Tambahkan fungsi baru ini
};
