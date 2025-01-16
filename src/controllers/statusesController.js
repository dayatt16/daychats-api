const statusesService = require("../services/statusesServices");

// Mengambil semua status
const getAllStatuses = async (req, res) => {
  try {
    const statuses = await statusesService.getAllStatuses();
    res.status(200).json({status:true, data:statuses});
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Membuat status baru
const createStatus = async (req, res) => {
  const { userId, caption, mediaType, backgroundColor } = req.body;
  const file = req.file;
  try {
    const newStatus = await statusesService.createStatus({
      userId,
      caption,
      mediaType,
      backgroundColor,
    }, file);
    res.status(201).json({status:true, data:newStatus});
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Mengambil status berdasarkan userId
const getStatusesByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const userStatuses = await statusesService.getStatusesByUserId(userId);
    res.status(200).json({status:true, data:userStatuses});
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Menghapus status berdasarkan ID
const deleteStatusById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await statusesService.deleteStatusById(id);
    res.status(200).json({ status: true, message: result.message });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  getAllStatuses,
  createStatus,
  getStatusesByUserId,
  deleteStatusById,
};
