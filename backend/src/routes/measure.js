const express = require("express");
const { 
    getExercisesByCategory, 
    addExercise, 
    deleteExercise, 
    recordMuscleData, 
    getDailyMuscleSummary 
} = require("../controllers/measure");
const { authenticateToken } = require("../middleware/auth"); // ✅ 認証ミドルウェア

const router = express.Router();

// **認証確認用**
router.get("/", (req, res) => {
    res.json({ message: "認証成功！", user: req.user });
});

// **種目を取得（部位ごと）**
router.get("/exercises/:category", authenticateToken, getExercisesByCategory);

// **新しい種目を追加**
router.post("/exercises", authenticateToken, addExercise);

// **種目削除**
router.delete("/:exerciseId", authenticateToken, deleteExercise);

// **筋トレ記録**
router.post("/", authenticateToken, recordMuscleData);

// **今日の総負荷データを取得**
router.get("/daily-muscle-summary", authenticateToken, getDailyMuscleSummary);

module.exports = router;
