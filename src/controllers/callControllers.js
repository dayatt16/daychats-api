const callService = require("../services/callServices");

const logCalls = async (req, res) => {
  try {
    const id = req.params.id; // Mengambil ID dari parameter rute
    const type = req.query.type; // Mengambil tipe dari query

    // Validasi ID
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ID",
          message: "ID pengguna diperlukan"
        }
      });
    }

    console.log(`Fetching logs for user ID: ${id} with type: ${type}`); // Log untuk debugging

    // Mendapatkan log panggilan berdasarkan ID dan tipe
    const logs = await callService.getLogCallsByUserIdAndType(id, type);

    // Menggabungkan data dan totals ke dalam respons yang lebih sederhana
    return res.status(200).json({
      success: true,
      data: logs.data, // Ambil data dari logs
      totals: logs.totals // Ambil totals dari logs
    });
  } catch (error) {
    console.error("Error in logCalls:", error); // Log kesalahan
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  logCalls
}
