const express = require("express");
const router = express.Router();
const communitiesController = require("../controllers/communitiesController");

// Get all communities
router.get('/communities', communitiesController.getAllCommunities);

// Get community by ID
router.get('/communities/:id', communitiesController.getCommunityById);

module.exports = router;