const db = require("../db");

// 🔸種目一覧を取得
exports.getExercises = async (req, res) => {
    try {
        const [exercises] = await db.execute(
            "SELECT * FROM exercises WHERE user_id = ? ORDER BY category, name",
            [req.user.user_id]
        );
        res.json({ exercises });
    } catch (err) {
        console.error("❌ 種目一覧取得エラー:", err);
        res.status(500).json({ error: "❌ 種目一覧の取得に失敗しました" });
    }
};

// 🔸種目を追加
exports.addExercise = async (req, res) => {
    try {
        const { category, name } = req.body;
        if (!category || !name) {
            return res.status(400).json({ error: "⚠️ カテゴリーと種目名を入力してください" });
        }

        const [result] = await db.execute(
            "INSERT INTO exercises (user_id, category, name) VALUES (?, ?, ?)",
            [req.user.user_id, category, name]
        );

        res.status(201).json({ message: "✅ 種目を追加しました", id: result.insertId });
    } catch (err) {
        console.error("❌ 種目追加エラー:", err);
        res.status(500).json({ error: "❌ 種目の追加に失敗しました" });
    }
};

// 🔸種目を削除
exports.deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(
            "DELETE FROM exercises WHERE id = ? AND user_id = ?",
            [id, req.user.user_id]
        );
        res.json({ message: "✅ 種目を削除しました" });
    } catch (err) {
        console.error("❌ 種目削除エラー:", err);
        res.status(500).json({ error: "❌ 種目の削除に失敗しました" });
    }
};

// 🔸筋トレ記録を追加
exports.addMuscleRecord = async (req, res) => {
    try {
        const { exercise_id, weight, reps } = req.body;
        if (!exercise_id || !weight || !reps) {
            return res.status(400).json({ error: "⚠️ すべての項目を入力してください" });
        }

        const muscle_value = weight * reps;
        await db.execute(
            "INSERT INTO muscle_records (user_id, exercise_id, weight, reps, muscle_value) VALUES (?, ?, ?, ?, ?)",
            [req.user.user_id, exercise_id, weight, reps, muscle_value]
        );

        res.status(201).json({ message: "✅ 記録を追加しました" });
    } catch (err) {
        console.error("❌ 記録追加エラー:", err);
        res.status(500).json({ error: "❌ 記録の追加に失敗しました" });
    }
};
