const db = require("../db");

// **利用可能な日付のリストを取得**
exports.getAvailableDates = async (req, res) => {
    const user_id = req.user.user_id; // 統一: user_id
    try {
        // DATE_FORMAT を使って "YYYY-MM-DD" の文字列として返す
        const [dates] = await db.execute(
            `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
             FROM muscle_records
             WHERE user_id = ?
             ORDER BY date DESC`, [user_id]
        );
        res.json({ dates: dates.map(row => row.date) });
    } catch (err) {
        console.error("❌ getAvailableDates エラー:", err.message);
        res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
    }
};

exports.getDailyHistory = async (req, res) => {
    const user_id = req.user.user_id; // 統一: user_id
    const { date } = req.query; // ここには "YYYY-MM-DD" の文字列が入るはず
    if (!date) {
        return res.status(400).json({ error: "日付が指定されていません。" });
    }
    try {
        const [dailyHistory] = await db.execute(
            `SELECT e.category, e.name AS exercise, r.weight, r.reps, r.muscle_value
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ? 
             AND DATE(r.recorded_at) = ?`, 
            [user_id, date]
        );
        if (dailyHistory.length === 0) {
            console.log(`⚠️ データなし: user_id=${user_id}, date=${date}`);
        }
        res.json({ dailyHistory });
    } catch (err) {
        console.error("❌ getDailyHistory エラー:", err.message);
        res.status(500).json({ error: "データの取得に失敗しました。" });
    }
};

exports.getTotalMuscleValue = async (req, res) => {
    const user_id = req.user.user_id; // 統一: user_id
    try {
        const [categoryTotals] = await db.execute(
            `SELECT e.category, SUM(r.muscle_value) AS total_muscle_value
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ?
             GROUP BY e.category`, [user_id]
        );
        const [overallTotal] = await db.execute(
            `SELECT COALESCE(SUM(muscle_value), 0) AS total_muscle
             FROM muscle_records 
             WHERE user_id = ?`, [user_id]
        );
        res.json({
            categoryTotals,
            overallTotal: overallTotal[0]?.total_muscle || 0
        });
    } catch (err) {
        console.error("❌ getTotalMuscleValue エラー:", err.message);
        res.status(500).json({ error: "総負荷量の取得に失敗しました。" });
    }
};

exports.getWeeklyData = async (req, res) => {
    const user_id = req.user.user_id; // 統一: user_id
    try {
        const [weeklyData] = await db.execute(
            `SELECT YEARWEEK(recorded_at) AS week, 
                    e.category, 
                    SUM(r.muscle_value) AS total_muscle_value
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ? 
             GROUP BY week, e.category
             ORDER BY week ASC`, [user_id]
        );
        const [totalWeekly] = await db.execute(
            `SELECT YEARWEEK(recorded_at) AS week, 
                    COALESCE(SUM(muscle_value), 0) AS total_muscle
             FROM muscle_records 
             WHERE user_id = ?
             GROUP BY week
             ORDER BY week ASC`, [user_id]
        );
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
            if (combinedData[week]) {
                combinedData[week].total_muscle = total_muscle;
            }
        });
        res.json({ weeklyData: Object.values(combinedData) });
    } catch (err) {
        console.error("❌ getWeeklyData エラー:", err.message);
        res.status(500).json({ error: "週ごとのデータ取得に失敗しました。" });
    }
};
