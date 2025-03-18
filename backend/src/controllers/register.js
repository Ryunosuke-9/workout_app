const bcrypt = require("bcrypt");
const db = require("../db");

// **ユーザーをデータベースに追加**
const createUser = async (user_id, hashed_password) => {
  return db.execute("INSERT INTO users (user_id, password) VALUES (?, ?)", [user_id, hashed_password]);
};

// **ユーザーIDで検索（`password` を取得せずに最適化）**
const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute("SELECT user_id FROM users WHERE user_id = ?", [user_id]);
  return rows.length > 0 ? rows[0] : null;
};

// **ユーザー登録処理**
exports.registerUser = async (req, res) => {
  try {
    console.log("📌 受信データ:", req.body); // デバッグ用ログ

    const { user_id, password, confirm_password } = req.body;

    // **1. 必須項目チェック**
    if (!user_id || !password || !confirm_password) {
      return res.status(400).json({ error: "⚠️ すべての項目を入力してください。" });
    }

    // **2. パスワード一致チェック**
    if (password !== confirm_password) {
      return res.status(400).json({ error: "⚠️ パスワードが一致しません。" });
    }

    // **3. ユーザーIDのバリデーション**
    const user_idRegex = /^[A-Za-z0-9]{5,}$/;
    if (!user_idRegex.test(user_id)) {
      return res.status(400).json({ error: "⚠️ ユーザーIDは5文字以上の英数字のみで入力してください。" });
    }

    // **4. パスワードのバリデーション**
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "⚠️ パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。" });
    }

    // **5. 既存ユーザーの確認**
    const existingUser = await findUserByUserId(user_id);
    if (existingUser) {
      return res.status(400).json({ error: "⚠️ このユーザーIDは既に使用されています。" });
    }

    // **6. パスワードのハッシュ化**
    const hashed_password = await bcrypt.hash(password, 10);
    await createUser(user_id, hashed_password);

    console.log(`✅ 新規ユーザー登録成功: ${user_id}`);
    res.status(201).json({ message: "✅ アカウントが作成されました！" });

  } catch (error) {
    console.error("🚨 登録エラー:", error);
    res.status(500).json({ error: "❌ サーバーエラーが発生しました。" });
  }
};
