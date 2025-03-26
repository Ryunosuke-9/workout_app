const bcrypt = require("bcrypt");
const db = require("../db");

// ユーザー登録のメイン処理
exports.registerUser = async (req, res) => {
  try {
    // ユーザーIDが既に存在するかチェックする関数
    const findUserByUserId = async (user_id) => {
      const [rows] = await db.execute(
        "SELECT user_id FROM users WHERE user_id = ?",
        [user_id]
      );
      return rows.length > 0;
    };

    // ユーザーIDの形式チェック（5文字以上の英数字）
    const isValidUserId = (user_id) => /^[A-Za-z\d]{5,}$/.test(user_id);
    // パスワードの形式チェック（8文字以上、大文字・小文字・数字を含む）
    const isValidPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

    // リクエストからデータを取得
    const { user_id, password, confirm_password } = req.body;

    // 必須項目のチェック
    if (!user_id || !password || !confirm_password) {
      return res.status(400).json({ error: "⚠️ すべての項目を入力してください。" });
    }

    // パスワードの一致チェック
    if (password !== confirm_password) {
      return res.status(400).json({ error: "⚠️ パスワードが一致しません。" });
    }

    // ユーザーIDの形式チェック
    if (!isValidUserId(user_id)) {
      return res.status(400).json({ error: "⚠️ ユーザーIDは5文字以上の英数字のみで入力してください。" });
    }

    // パスワードの形式チェック
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "⚠️ パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。" });
    }

    // ユーザーIDの重複チェック
    if (await findUserByUserId(user_id)) {
      return res.status(400).json({ error: "⚠️ このユーザーIDは既に使用されています。" });
    }

    // パスワードをハッシュ化して保存
    const hashed_password = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (user_id, password) VALUES (?, ?)",
      [user_id, hashed_password]
    );

    // 成功時のレスポンス
    return res.status(201).json({ message: "✅ アカウントが作成されました！" });
  } catch (error) {
    // エラー発生時のログ出力とレスポンス
    console.error("🚨 登録エラー:", error);
    return res.status(500).json({ error: "❌ サーバーエラーが発生しました。" });
  }
};
