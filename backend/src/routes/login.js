const express = require("express");
const { loginUser } = require("../controllers/login");

const router = express.Router();

// **ログインAPI**
router.post("/", loginUser);

module.exports = router;
