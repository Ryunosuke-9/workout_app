const bcrypt = require("bcrypt");
const db = require("../db");

// **ユーザーをデータベースに追加**
const createUser = async (user_id, hashedPassword) => {
  return db.execute("INSERT INTO users (user_id, password) VALUES (?, ?)", [user_id, hashedPassword]);
};

// **ユーザーIDで検索**
const findUserByUserId = async (user_id) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE user_id = ?", [user_id]);
  return rows.length > 0 ? rows[0] : null;
};

// **ユーザー登録処理**
exports.registerUser = async (req, res) => {
  try {
    console.log("📌 受信データ:", req.body); // デバッグ用ログ

    const { user_id, password, confirm_password } = req.body;

    if (!user_id || !password || !confirm_password) {
      return res.status(400).json({ error: "⚠️ すべての項目を入力してください。" });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ error: "⚠️ パスワードが一致しません。" });
    }

    const user_idRegex = /^[A-Za-z0-9]{5,}$/;
    if(!user_idRegex.test(user_id)) {
        return res.status(400).json({ error: "ユーザーIDは5文字以上の英数字のみで入力してください"})
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "⚠️ パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。" });
    }

    const existingUser = await findUserByUserId(user_id);
    if (existingUser) {
      return res.status(400).json({ error: "⚠️ このユーザーIDは既に使用されています。" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(user_id, hashedPassword);

    res.status(201).json({ message: "✅ アカウントが作成されました！" });
  } catch (error) {
    console.error("🚨 登録エラー:", error);
    res.status(500).json({ error: "❌ サーバーエラーが発生しました" });
  }
};
