const express = require("express");
const { registerUser } = require("../controllers/register");

const router = express.Router();

// **ユーザー登録API**
router.post("/", registerUser);

module.exports = router;
