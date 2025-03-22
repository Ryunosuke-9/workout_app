const express = require("express");
const {
  deleteAccount,
  changePassword,
  updateMuscleRecord,
  deleteMuscleRecord
} = require("../controllers/setting");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// ✅ アカウント削除
router.delete("/account", authenticateToken, deleteAccount);

// ✅ パスワード変更
router.put("/account/password", authenticateToken, changePassword);

// ✅ 筋トレ記録の編集（record_id指定）
router.put("/records/:record_id", authenticateToken, updateMuscleRecord);

// ✅ 筋トレ記録の削除（record_id指定）
router.delete("/records/:record_id", authenticateToken, deleteMuscleRecord);

module.exports = router;
