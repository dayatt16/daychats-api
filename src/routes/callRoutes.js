const express = require("express");
const callController = require("../controllers/callControllers");

const router = express.Router();

router.get("/log/calls/:id", callController.logCalls);

module.exports = router;    