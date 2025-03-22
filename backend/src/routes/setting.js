const express = require("express");
const {
  deleteAccount,
  changePassword,
  getAvailableDates,
  getDailyHistory,
  updateMuscleRecord,
  deleteMuscleRecord
} = require("../controllers/setting");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// アカウント削除
router.delete("/account", authenticateToken, deleteAccount);

// パスワード変更
router.put("/account/password", authenticateToken, changePassword);

// 利用可能な日付リストの取得
router.get("/dates", authenticateToken, getAvailableDates);

// 日ごとの履歴取得
router.get("/daily", authenticateToken, getDailyHistory);

// 筋トレ記録の編集（record_id指定）
router.put("/records/:record_id", authenticateToken, updateMuscleRecord);

// 筋トレ記録の削除（record_id指定）
router.delete("/records/:record_id", authenticateToken, deleteMuscleRecord);

module.exports = router;
