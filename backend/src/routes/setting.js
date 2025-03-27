const express = require("express");
const {
  deleteAccount,
  changePassword,
  getUserStats,
  getAvailableDates,
  getDailyHistory,
  updateMuscleRecord,
  deleteMuscleRecord
} = require("../controllers/setting");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// 認証確認用のルーティング
router.get("/", (req, res) => {
  res.json({ message: "認証成功！", user: req.user });
});

// アカウント削除のルーティング
router.delete("/account", authenticateToken, deleteAccount);

// パスワード変更のルーティング
router.put("/account/password", authenticateToken, changePassword);

// ユーザースタッツ取得のルーティング
router.get("/stats", authenticateToken, getUserStats);

// 利用可能な日付リスト取得のルーティング
router.get("/dates", authenticateToken, getAvailableDates);

// 日ごとの履歴取得のルーティング
router.get("/daily", authenticateToken, getDailyHistory);

// 筋トレ記録編集のルーティング
router.put("/records/:record_id", authenticateToken, updateMuscleRecord);

// 筋トレ記録削除のルーティング
router.delete("/records/:record_id", authenticateToken, deleteMuscleRecord);

module.exports = router;
