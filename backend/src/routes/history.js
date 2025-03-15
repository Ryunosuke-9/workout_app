const express = require("express");
const {
    getDailyHistory,
    getAvailableDates,
    getTotalMuscleValue,
    getWeeklyData
} = require("../controllers/history");
const { authenticateToken } = require("../middleware/auth"); // ✅ 認証ミドルウェア

const router = express.Router();

// **認証確認用**
router.get("/", (req, res) => {
    res.json({ message: "認証成功！", user: req.user });
});

// **指定した日付の履歴を取得**
router.get("/daily", authenticateToken, getDailyHistory);

// **利用可能な日付のリストを取得**
router.get("/dates", authenticateToken, getAvailableDates);

// **全データの合計筋値を取得**
router.get("/totals", authenticateToken, getTotalMuscleValue);

// **週ごとのデータ取得（グラフ用）**
router.get("/weekly", authenticateToken, getWeeklyData);

module.exports = router;
