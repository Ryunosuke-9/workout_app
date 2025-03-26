// controllers/settings.js
const db = require("../db");
const bcrypt = require("bcryptjs");

// **アカウント削除**
exports.deleteAccount = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        console.log("アカウント削除リクエスト: ユーザーID", user_id);

        // 関連するデータを削除
        await db.query(
            "DELETE FROM muscle_records WHERE user_id = ?",
            [user_id]
        );

        await db.query(
            "DELETE FROM exercises WHERE user_id = ?",
            [user_id]
        );

        await db.query(
            "DELETE FROM users WHERE id = ?",
            [user_id]
        );

        res.json({ message: "アカウントを削除しました。" });
    } catch (err) {
        console.error("アカウント削除エラー:", err);
        res.status(500).json({ error: "アカウントの削除に失敗しました。" });
    }
};

// **パスワード変更**
exports.changePassword = async (req, res) => {
    const user_id = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    // 基本的な入力チェック
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "現在のパスワードと新しいパスワードを入力してください。" });
    }

    try {
        console.log("パスワード変更リクエスト: ユーザーID", user_id);

        // 現在のパスワードを確認
        const [user] = await db.query(
            "SELECT password FROM users WHERE id = ?",
            [user_id]
        );

        const validPassword = await bcrypt.compare(currentPassword, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: "現在のパスワードが正しくありません。" });
        }

        // 新しいパスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // パスワードを更新
        await db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, user_id]
        );

        res.json({ message: "パスワードを変更しました。" });
    } catch (err) {
        console.error("パスワード変更エラー:", err);
        res.status(500).json({ error: "パスワードの変更に失敗しました。" });
    }
};

// **ユーザーの統計情報を取得**
exports.getUserStats = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        console.log("ユーザー統計情報を取得中: ユーザーID", user_id);

        // 登録日を取得
        const [userRows] = await db.query(
            "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS registrationDate FROM users WHERE id = ?",
            [user_id]
        );

        // 筋トレを行った日数をカウント（重複のない日付数）
        const [countRows] = await db.query(
            `SELECT COUNT(DISTINCT DATE(recorded_at)) AS workoutDays 
             FROM muscle_records
             WHERE user_id = ?`,
            [user_id]
        );

        const registrationDate = userRows[0]?.registrationDate || null;
        const workoutDays = countRows[0]?.workoutDays || 0;

        res.json({ registrationDate, workoutDays });
    } catch (err) {
        console.error("統計情報取得エラー:", err);
        res.status(500).json({ error: "統計情報の取得に失敗しました。" });
    }
};

// **利用可能な日付リストの取得**
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

// **日ごとの履歴取得**
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
                r.id as record_id,
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

// **筋トレ記録の編集**
exports.updateMuscleRecord = async (req, res) => {
    const user_id = req.user.user_id;
    const { record_id } = req.params;
    const { weight, reps } = req.body;

    // 基本的な入力チェック
    if (!weight || !reps) {
        return res.status(400).json({ error: "重量とレップ数を入力してください。" });
    }

    try {
        console.log("筋トレ記録を編集中: ユーザーID", user_id, "記録ID:", record_id);

        const muscleValue = weight * reps;

        await db.query(
            `UPDATE muscle_records 
             SET weight = ?, reps = ?, muscle_value = ?
             WHERE id = ? AND user_id = ?`,
            [weight, reps, muscleValue, record_id, user_id]
        );

        res.json({ message: "筋トレ記録を更新しました。" });
    } catch (err) {
        console.error("記録更新エラー:", err);
        res.status(500).json({ error: "記録の更新に失敗しました。" });
    }
};

// **筋トレ記録の削除**
exports.deleteMuscleRecord = async (req, res) => {
    const user_id = req.user.user_id;
    const { record_id } = req.params;

    try {
        console.log("筋トレ記録を削除中: ユーザーID", user_id, "記録ID:", record_id);

        await db.query(
            "DELETE FROM muscle_records WHERE id = ? AND user_id = ?",
            [record_id, user_id]
        );

        res.json({ message: "筋トレ記録を削除しました。" });
    } catch (err) {
        console.error("記録削除エラー:", err);
        res.status(500).json({ error: "記録の削除に失敗しました。" });
    }
};
