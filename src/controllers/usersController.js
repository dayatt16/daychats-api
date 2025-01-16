const usersService = require('../services/usersServices');

class UsersController {
  async getAllUsers(req, res) {
    try {
      const searchQuery = req.query.search; // Ambil query parameter untuk pencarian
      const users = await usersService.getAllUsers(searchQuery); // Pass query ke service
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await usersService.getUserById(id); // Anda perlu menambahkan metode ini di services
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body; // Ambil data pengguna dari body
      const file = req.file; // Ambil file dari request

      // Jika ada file, perbarui gambar profil
      if (file) {
        const updatedUser = await usersService.updateProfilePicture(id, file);
        userData.profilePicture = updatedUser.profilePicture; // Tambahkan URL gambar ke data pengguna
      }

      // Perbarui data pengguna lainnya
      const updatedUserData = await usersService.updateUser(id, userData);
      res.status(200).json({
        success: true,
        data: updatedUserData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new UsersController();
