// controllers/settings.js
const db = require("../db");
const bcrypt = require("bcrypt");

// アカウント削除（ユーザー・種目・筋トレ記録 全削除）
exports.deleteAccount = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    await db.query("DELETE FROM muscle_records WHERE user_id = ?", [user_id]);
    await db.query("DELETE FROM exercises WHERE user_id = ?", [user_id]);
    await db.query("DELETE FROM users WHERE user_id = ?", [user_id]);

    res.json({ message: "✅ アカウントとすべてのデータを削除しました。" });
  } catch (err) {
    console.error("❌ アカウント削除エラー:", err);
    res.status(500).json({ error: "アカウント削除に失敗しました。" });
  }
};

// パスワード変更
exports.changePassword = async (req, res) => {
  const user_id = req.user.user_id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "現在のパスワードと新しいパスワードを入力してください。" });
  }
  try {
    const [rows] = await db.query("SELECT password FROM users WHERE user_id = ?", [user_id]);
    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "現在のパスワードが間違っています。" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE user_id = ?", [hashedPassword, user_id]);

    res.json({ message: "✅ パスワードを変更しました。" });
  } catch (err) {
    console.error("❌ パスワード変更エラー:", err);
    res.status(500).json({ error: "パスワード変更に失敗しました。" });
  }
};

// 利用可能な日付のリストを取得
exports.getAvailableDates = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [dates] = await db.execute(
      `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
       FROM muscle_records
       WHERE user_id = ?
       ORDER BY date DESC`,
      [user_id]
    );
    res.json({ dates: dates.map(row => row.date) });
  } catch (err) {
    console.error("❌ 日付取得エラー:", err.message);
    res.status(500).json({ error: "利用可能な日付の取得に失敗しました。" });
  }
};

// 日ごとの履歴を取得
exports.getDailyHistory = async (req, res) => {
  const user_id = req.user.user_id;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: "日付が指定されていません。" });
  }
  try {
    const [dailyHistory] = await db.execute(
      `SELECT e.category, e.name AS exercise, r.weight, r.reps, r.muscle_value, r.id
       FROM muscle_records r
       JOIN exercises e ON r.exercise_id = e.id
       WHERE r.user_id = ? AND DATE(r.recorded_at) = ?`,
      [user_id, date]
    );
    res.json({ dailyHistory });
  } catch (err) {
    console.error("❌ 日ごとの履歴取得エラー:", err.message);
    res.status(500).json({ error: "データの取得に失敗しました。" });
  }
};

// 筋トレ記録の編集
exports.updateMuscleRecord = async (req, res) => {
  const user_id = req.user.user_id;
  const { record_id, weight, reps } = req.body;

  if (!record_id || !weight || !reps) {
    return res.status(400).json({ error: "必要なデータが不足しています。" });
  }
  const muscle_value = weight * reps;

  try {
    const [result] = await db.query(
      `UPDATE muscle_records 
       SET weight = ?, reps = ?, muscle_value = ? 
       WHERE id = ? AND user_id = ?`,
      [weight, reps, muscle_value, record_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "記録が見つかりませんでした。" });
    }

    res.json({ message: "✅ 筋トレ記録を更新しました。" });
  } catch (err) {
    console.error("❌ 記録更新エラー:", err);
    res.status(500).json({ error: "記録の更新に失敗しました。" });
  }
};

// 筋トレ記録の削除
exports.deleteMuscleRecord = async (req, res) => {
  const user_id = req.user.user_id;
  const { record_id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM muscle_records WHERE id = ? AND user_id = ?",
      [record_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "記録が見つかりませんでした。" });
    }

    res.json({ message: "✅ 筋トレ記録を削除しました。" });
  } catch (err) {
    console.error("❌ 記録削除エラー:", err);
    res.status(500).json({ error: "記録の削除に失敗しました。" });
  }
};
