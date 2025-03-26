const db = require("../db");

// 🔸利用可能な日付リストの取得
exports.getAvailableDates = async (req, res) => {
    try {
        const [dates] = await db.execute(
            `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
             FROM muscle_records
             WHERE user_id = ?
             ORDER BY date DESC`,
            [req.user.user_id]
        );
        res.json({ dates: dates.map(row => row.date) });
    } catch (err) {
        console.error("❌ 日付取得エラー:", err.message);
        res.status(500).json({ error: "❌ 利用可能な日付の取得に失敗しました" });
    }
};

// 🔸日ごとの履歴を取得
exports.getDailyHistory = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "⚠️ 日付が指定されていません。" });
        }

        const [dailyHistory] = await db.execute(
            `SELECT e.category, e.name AS exercise, r.weight, r.reps, r.muscle_value, r.id
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ? AND DATE(r.recorded_at) = ?`,
            [req.user.user_id, date]
        );

        res.json({ dailyHistory });
    } catch (err) {
        console.error("❌ 日ごとの履歴取得エラー:", err.message);
        res.status(500).json({ error: "❌ データの取得に失敗しました" });
    }
};

// 🔸総負荷量を取得
exports.getTotalMuscleValue = async (req, res) => {
    try {
        const [totalValue] = await db.execute(
            `SELECT 
                SUM(CASE WHEN e.category = '胸' THEN r.muscle_value ELSE 0 END) as chest,
                SUM(CASE WHEN e.category = '背中' THEN r.muscle_value ELSE 0 END) as back,
                SUM(CASE WHEN e.category = '肩' THEN r.muscle_value ELSE 0 END) as shoulder,
                SUM(CASE WHEN e.category = '腕' THEN r.muscle_value ELSE 0 END) as arms,
                SUM(CASE WHEN e.category = '脚' THEN r.muscle_value ELSE 0 END) as legs,
                SUM(r.muscle_value) as total
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ?`,
            [req.user.user_id]
        );

        res.json(totalValue[0]);
    } catch (err) {
        console.error("❌ 総負荷量取得エラー:", err.message);
        res.status(500).json({ error: "❌ 総負荷量の取得に失敗しました" });
    }
};

// 🔸週間データを取得
exports.getWeeklyData = async (req, res) => {
    try {
        const [weeklyData] = await db.execute(
            `SELECT 
                DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') as date,
                SUM(CASE WHEN e.category = '胸' THEN r.muscle_value ELSE 0 END) as chest,
                SUM(CASE WHEN e.category = '背中' THEN r.muscle_value ELSE 0 END) as back,
                SUM(CASE WHEN e.category = '肩' THEN r.muscle_value ELSE 0 END) as shoulder,
                SUM(CASE WHEN e.category = '腕' THEN r.muscle_value ELSE 0 END) as arms,
                SUM(CASE WHEN e.category = '脚' THEN r.muscle_value ELSE 0 END) as legs,
                SUM(r.muscle_value) as total
             FROM muscle_records r
             JOIN exercises e ON r.exercise_id = e.id
             WHERE r.user_id = ?
             AND recorded_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(recorded_at)
             ORDER BY date DESC`,
            [req.user.user_id]
        );

        res.json(weeklyData);
    } catch (err) {
        console.error("❌ 週間データ取得エラー:", err.message);
        res.status(500).json({ error: "❌ 週間データの取得に失敗しました" });
    }
};
  