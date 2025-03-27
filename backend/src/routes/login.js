const express = require("express");
const { loginUser } = require("../controllers/login");

const router = express.Router();

// ユーザーログインのルーティング
router.post("/", loginUser);

module.exports = router;
