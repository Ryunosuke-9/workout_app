const db = require("../db");

// **種目を取得（部位ごと）**
exports.getExercisesByCategory = async (req, res) => {
    const user_id = req.user.user_id;
    const { category } = req.params;

    try {
        // 基本的な入力チェック
        if (!category) {
            return res.status(400).json({ error: "カテゴリを選択してください。" });
        }

        console.log("種目取得: ユーザーID", user_id, "カテゴリ:", category);

        const [exercises] = await db.query(
            "SELECT id, name FROM exercises WHERE user_id = ? AND category = ?",
            [user_id, category]
        );

        res.json(exercises);
    } catch (err) {
        console.error("種目取得エラー:", err);
        res.status(500).json({ error: "種目の取得に失敗しました。" });
    }
};

// **新しい種目を追加**
exports.addExercise = async (req, res) => {
    const user_id = req.user.user_id;
    const { name, category } = req.body;

    // 基本的な入力チェック
    if (!name || !category) {
        return res.status(400).json({ error: "種目名とカテゴリは必須です。" });
    }

    try {
        console.log("種目追加: ユーザーID", user_id, "種目:", name, "カテゴリ:", category);

        await db.query(
            "INSERT INTO exercises (user_id, name, category) VALUES (?, ?, ?)",
            [user_id, name, category]
        );

        res.status(201).json({ message: "種目を追加しました！" });
    } catch (err) {
        console.error("種目追加エラー:", err);
        res.status(500).json({ error: "種目の追加に失敗しました。" });
    }
};

// **種目削除**
exports.deleteExercise = async (req, res) => {
    const user_id = req.user.user_id;
    const { exercise_id } = req.params;

    try {
        console.log("種目削除: ユーザーID", user_id, "種目ID:", exercise_id);

        // 関連する記録を削除
        await db.query(
            "DELETE FROM muscle_records WHERE user_id = ? AND exercise_id = ?",
            [user_id, exercise_id]
        );

        // 種目を削除
        const [result] = await db.query(
            "DELETE FROM exercises WHERE user_id = ? AND id = ?",
            [user_id, exercise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "該当する種目が見つかりませんでした。" });
        }

        res.json({ message: "種目を削除しました！" });
    } catch (err) {
        console.error("種目削除エラー:", err);
        res.status(500).json({ error: "種目の削除に失敗しました。" });
    }
};

// **筋トレ記録**
exports.recordMuscleData = async (req, res) => {
    const { exercise_id, weight, reps } = req.body;
    const user_id = req.user.user_id;

    // 基本的な入力チェック
    if (!exercise_id || !weight || !reps) {
        return res.status(400).json({ error: "すべての項目を入力してください。" });
    }

    try {
        console.log("筋トレ記録: ユーザーID", user_id, "種目ID:", exercise_id);

        const muscleValue = weight * reps;

        await db.query(
            "INSERT INTO muscle_records (user_id, exercise_id, weight, reps, muscle_value, recorded_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [user_id, exercise_id, weight, reps, muscleValue]
        );

        res.status(201).json({ message: "筋トレデータを保存しました！", muscleValue });
    } catch (err) {
        console.error("データ保存エラー:", err);
        res.status(500).json({ error: "データ保存に失敗しました。" });
    }
};

// **今日の総負荷データを取得**
exports.getDailyMuscleSummary = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        console.log("今日の筋値データを取得中: ユーザーID", user_id);

        const [records] = await db.query(
            `SELECT 
                ex.category,  
                ex.name AS exerciseName,
                mr.weight,
                mr.reps,
                mr.muscle_value AS muscleValue
            FROM muscle_records AS mr
            INNER JOIN exercises AS ex ON mr.exercise_id = ex.id
            WHERE mr.user_id = ? AND DATE(mr.recorded_at) = CURDATE()`,
            [user_id]
        );

        if (!records || records.length === 0) {
            return res.status(404).json({ message: "今日のデータがありません。" });
        }

        const totalMuscleValue = records.reduce((sum, record) => sum + record.muscleValue, 0);

        res.json({ records, totalMuscleValue });
    } catch (err) {
        console.error("データ取得エラー:", err);
        res.status(500).json({ error: "データ取得に失敗しました。" });
    }
};
