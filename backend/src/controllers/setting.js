// controllers/settings.js
const db = require("../db");
const bcrypt = require("bcrypt");

// アカウント削除のメイン処理
exports.deleteAccount = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // 筋トレ記録の削除
    await db.query("DELETE FROM muscle_records WHERE user_id = ?", [user_id]);

    // 種目の削除
    await db.query("DELETE FROM exercises WHERE user_id = ?", [user_id]);

    // ユーザーアカウントの削除
    await db.query("DELETE FROM users WHERE user_id = ?", [user_id]);

    // 成功時のレスポンス
    return res.json({ message: "✅ アカウントとすべてのデータを削除しました。" });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 アカウント削除エラー:", error);
    return res.status(500).json({ error: "❌ アカウント削除に失敗しました。" });
  }
};

// パスワード変更のメイン処理
exports.changePassword = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { currentPassword, newPassword } = req.body;

    // 必須項目のチェック
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "⚠️ 現在のパスワードと新しいパスワードを入力してください。" });
    }

    // 現在のパスワードを取得
    const [rows] = await db.query("SELECT password FROM users WHERE user_id = ?", [user_id]);
    const user = rows[0];

    // 現在のパスワードの一致チェック
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "⚠️ 現在のパスワードが間違っています。" });
    }

    // 新しいパスワードをハッシュ化して保存
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE user_id = ?", [hashedPassword, user_id]);

    // 成功時のレスポンス
    return res.json({ message: "✅ パスワードを変更しました。" });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 パスワード変更エラー:", error);
    return res.status(500).json({ error: "❌ パスワード変更に失敗しました。" });
  }
};

// ユーザースタッツ取得のメイン処理
exports.getUserStats = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // 登録日を取得
    const [userRows] = await db.query(
      "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS registrationDate FROM users WHERE user_id = ?",
      [user_id]
    );

    // 筋トレを行った日数をカウント（重複のない日付数）
    const [countRows] = await db.query(
      `SELECT COUNT(DISTINCT DATE(recorded_at)) AS workoutDays 
       FROM muscle_records 
       WHERE user_id = ?`,
      [user_id]
    );

    // データを整形
    const registrationDate = userRows[0]?.registrationDate || null;
    const workoutDays = countRows[0]?.workoutDays || 0;

    // 成功時のレスポンス
    return res.json({ registrationDate, workoutDays });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 ユーザースタッツ取得エラー:", error);
    return res.status(500).json({ error: "❌ 登録日と筋トレ日数の取得に失敗しました。" });
  }
};

// 利用可能な日付リスト取得のメイン処理
exports.getAvailableDates = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // 利用可能な日付を取得
    const [dates] = await db.execute(
      `SELECT DISTINCT DATE_FORMAT(DATE(recorded_at), '%Y-%m-%d') AS date
       FROM muscle_records
       WHERE user_id = ?
       ORDER BY date DESC`,
      [user_id]
    );

    // 日付リストを整形
    const dateList = dates.map(row => row.date);

    // 成功時のレスポンス
    return res.json({ dates: dateList });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 日付取得エラー:", error);
    return res.status(500).json({ error: "❌ 利用可能な日付の取得に失敗しました。" });
  }
};

// 日ごとの履歴取得のメイン処理
exports.getDailyHistory = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { date } = req.query;

    // 必須項目のチェック
    if (!date) {
      return res.status(400).json({ error: "⚠️ 日付が指定されていません。" });
    }

    // 日ごとの履歴を取得
    const [dailyHistory] = await db.execute(
      `SELECT e.category, e.name AS exercise, r.weight, r.reps, r.muscle_value, r.id
       FROM muscle_records r
       JOIN exercises e ON r.exercise_id = e.id
       WHERE r.user_id = ? AND DATE(r.recorded_at) = ?`,
      [user_id, date]
    );

    // 成功時のレスポンス
    return res.json({ dailyHistory });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 日ごとの履歴取得エラー:", error);
    return res.status(500).json({ error: "❌ データの取得に失敗しました。" });
  }
};

// 筋トレ記録編集のメイン処理
exports.updateMuscleRecord = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { record_id, weight, reps } = req.body;

    // 必須項目のチェック
    if (!record_id || !weight || !reps) {
      return res.status(400).json({ error: "⚠️ 必要なデータが不足しています。" });
    }

    // 筋トレ値を計算
    const muscle_value = weight * reps;

    // 筋トレ記録を更新
    const [result] = await db.query(
      `UPDATE muscle_records 
       SET weight = ?, reps = ?, muscle_value = ? 
       WHERE id = ? AND user_id = ?`,
      [weight, reps, muscle_value, record_id, user_id]
    );

    // 更新結果のチェック
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "⚠️ 記録が見つかりませんでした。" });
    }

    // 成功時のレスポンス
    return res.json({ message: "✅ 筋トレ記録を更新しました。" });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 記録更新エラー:", error);
    return res.status(500).json({ error: "❌ 記録の更新に失敗しました。" });
  }
};

// 筋トレ記録削除のメイン処理
exports.deleteMuscleRecord = async (req, res) => {
  try {
    // ユーザーIDを取得
    const user_id = req.user.user_id;

    // リクエストからデータを取得
    const { record_id } = req.params;

    // 筋トレ記録を削除
    const [result] = await db.query(
      "DELETE FROM muscle_records WHERE id = ? AND user_id = ?",
      [record_id, user_id]
    );

    // 削除結果のチェック
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "⚠️ 記録が見つかりませんでした。" });
    }

    // 成功時のレスポンス
    return res.json({ message: "✅ 筋トレ記録を削除しました。" });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 記録削除エラー:", error);
    return res.status(500).json({ error: "❌ 記録の削除に失敗しました。" });
  }
};
