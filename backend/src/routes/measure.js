const express = require("express");
const {
  getExercisesByCategory,
  addExercise,
  deleteExercise,
  recordMuscleData,
  getDailyMuscleSummary,
} = require("../controllers/measure");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// 認証確認用のルーティング
router.get("/", (req, res) => {
  res.json({ message: "認証成功！", user: req.user });
});

// 種目取得のルーティング（部位ごと）
router.get("/exercises/:category", authenticateToken, getExercisesByCategory);

// 新規種目追加のルーティング
router.post("/exercises", authenticateToken, addExercise);

// 種目削除のルーティング
router.delete("/:exercise_id", authenticateToken, deleteExercise);

// 筋トレ記録のルーティング
router.post("/", authenticateToken, recordMuscleData);

// 今日の総負荷データ取得のルーティング
router.get("/daily-muscle-summary", authenticateToken, getDailyMuscleSummary);

module.exports = router;
