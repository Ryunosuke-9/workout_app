const express = require("express");
const {
    getDailyHistory,
    getAvailableDates,
    getTotalMuscleValue,
    getWeeklyData
} = require("../controllers/history");
const { authenticateToken } = require("../middleware/auth"); // ✅ 認証ミドルウェア

const router = express.Router();

// 認証確認用のルーティング
router.get("/", (req, res) => {
    res.json({ message: "認証成功！", user: req.user });
});

// 日ごとの履歴取得のルーティング
router.get("/daily", authenticateToken, getDailyHistory);

// 利用可能な日付リスト取得のルーティング
router.get("/dates", authenticateToken, getAvailableDates);

// 総負荷量取得のルーティング
router.get("/totals", authenticateToken, getTotalMuscleValue);

// 週ごとのデータ取得のルーティング
router.get("/weekly", authenticateToken, getWeeklyData);

module.exports = router;
