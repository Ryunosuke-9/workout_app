const bcrypt = require("bcrypt");
const db = require("../db");

// 🔸ユーザー作成（DB）
const createUser = async (user_id, hashed_password) => {
    return db.execute(
        "INSERT INTO users (user_id, password) VALUES (?, ?)",
        [user_id, hashed_password]
    );
};

// 🔸ユーザーID検索（存在確認用）
const findUserByUserId = async (user_id) => {
    const [rows] = await db.execute(
        "SELECT user_id FROM users WHERE user_id = ?",
        [user_id]
    );
    return rows[0] || null;
};

// 🔸定数で共通メッセージをまとめる
const ERRORS = {
    REQUIRED: "⚠️ すべての項目を入力してください。",
    PASSWORD_MISMATCH: "⚠️ パスワードが一致しません。",
    USER_ID_INVALID: "⚠️ ユーザーIDは5文字以上の英数字のみで入力してください。",
    PASSWORD_INVALID: "⚠️ パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。",
    DUPLICATE_USER: "⚠️ このユーザーIDは既に使用されています。",
    SERVER: "❌ サーバーエラーが発生しました。",
};

// 🔸バリデーション関数を外出し
const isValidUserId = (id) => /^[A-Za-z0-9]{5,}$/.test(id);
const isValidPassword = (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pw);

// 🔹ユーザー登録処理
exports.registerUser = async (req, res) => {
    try {
        const { user_id, password, confirm_password } = req.body;

        if (!user_id || !password || !confirm_password) {
            return res.status(400).json({ error: ERRORS.REQUIRED });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ error: ERRORS.PASSWORD_MISMATCH });
        }

        if (!isValidUserId(user_id)) {
            return res.status(400).json({ error: ERRORS.USER_ID_INVALID });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ error: ERRORS.PASSWORD_INVALID });
        }

        const existingUser = await findUserByUserId(user_id);
        if (existingUser) {
            return res.status(400).json({ error: ERRORS.DUPLICATE_USER });
        }

        const hashed_password = await bcrypt.hash(password, 10);
        await createUser(user_id, hashed_password);

        return res.status(201).json({ message: "✅ アカウントが作成されました！" });
    } catch (error) {
        console.error("🚨 登録エラー:", error);
        return res.status(500).json({ error: ERRORS.SERVER });
    }
};
