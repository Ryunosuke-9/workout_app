const db = require("../db");

// **利用可能な日付のリストを取得**
exports.getAvailableDates = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        console.log("利用可能な日付を取得中: ユーザーID", user_id);

        const [dates] = await db.query(
            `SELECT DISTINCT DATE(recorded_at) AS date
             FROM muscle_records
             WHERE user_id = ?
             ORDER BY date DESC`,
            [user_id]
        );

        res.json({ dates: dates.map(row => row.date) });
    } catch (err) {
        console.error("日付取得エラー:", err);
        res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
    }
};

// **日ごとの履歴を取得**
exports.getDailyHistory = async (req, res) => {
    const user_id = req.user.user_id;
    const { date } = req.query;

    // 基本的な入力チェック
    if (!date) {
        return res.status(400).json({ error: "日付を指定してください。" });
    }

    try {
        console.log("日ごとの履歴を取得中: ユーザーID", user_id, "日付:", date);

        const [dailyHistory] = await db.query(
            `SELECT 
                e.category,
                e.name AS exercise,
                r.weight,
                r.reps,
                r.muscle_value
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ? AND DATE(r.recorded_at) = ?
             ORDER BY r.recorded_at DESC`,
            [user_id, date]
        );

        res.json({ dailyHistory });
    } catch (err) {
        console.error("履歴取得エラー:", err);
        res.status(500).json({ error: "データの取得に失敗しました。" });
    }
};

// **部位ごとの総負荷量と全体の合計負荷量を取得**
exports.getTotalMuscleValue = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        console.log("総負荷量を取得中: ユーザーID", user_id);

        const [categoryTotals] = await db.query(
            `SELECT 
                e.category,
                SUM(r.muscle_value) AS total_muscle_value
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ?
             GROUP BY e.category`,
            [user_id]
        );

        const [overallTotal] = await db.query(
            `SELECT COALESCE(SUM(muscle_value), 0) AS total_muscle
             FROM muscle_records 
             WHERE user_id = ?`,
            [user_id]
        );

        res.json({
            categoryTotals,
            overallTotal: overallTotal[0]?.total_muscle || 0
        });
    } catch (err) {
        console.error("総負荷量取得エラー:", err);
        res.status(500).json({ error: "総負荷量の取得に失敗しました。" });
    }
};

// **週ごとのデータ取得（グラフ用）**
exports.getWeeklyData = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        console.log("週ごとのデータを取得中: ユーザーID", user_id);

        const [weeklyData] = await db.query(
            `SELECT 
                DATE_FORMAT(recorded_at, '%Y-%W') AS week,
                e.category,
                SUM(r.muscle_value) AS total_muscle_value
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ?
             GROUP BY week, e.category
             ORDER BY week ASC`,
            [user_id]
        );

        const [totalWeekly] = await db.query(
            `SELECT 
                DATE_FORMAT(recorded_at, '%Y-%W') AS week,
                COALESCE(SUM(muscle_value), 0) AS total_muscle
             FROM muscle_records 
             WHERE user_id = ?
             GROUP BY week
             ORDER BY week ASC`,
            [user_id]
        );

        // データの整形
        const categories = [...new Set(weeklyData.map(d => d.category))];
        const combinedData = {};

        weeklyData.forEach(({ week, category, total_muscle_value }) => {
            if (!combinedData[week]) {
                combinedData[week] = { week, total_muscle: 0 };
                categories.forEach(cat => combinedData[week][cat] = 0);
            }
            combinedData[week][category] = total_muscle_value;
        });

        totalWeekly.forEach(({ week, total_muscle }) => {
            if (!combinedData[week]) {
                combinedData[week] = { week, total_muscle };
                categories.forEach(cat => combinedData[week][cat] = 0);
            } else {
                combinedData[week].total_muscle = total_muscle;
            }
        });

        res.json({ weeklyData: Object.values(combinedData) });
    } catch (err) {
        console.error("週ごとのデータ取得エラー:", err);
        res.status(500).json({ error: "週ごとのデータ取得に失敗しました。" });
    }
};
  