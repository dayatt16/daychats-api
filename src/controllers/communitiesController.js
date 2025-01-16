const communitiesService = require('../services/communitiesService');

const getAllCommunities = async (req, res) => {
  try {
    const communities = await communitiesService.getAllCommunities();
    res.status(200).json({
      success: true,
      data: communities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await communitiesService.getCommunityById(id);
    res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    res.status(error.message.includes('tidak ditemukan') ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllCommunities,
  getCommunityById
}; 