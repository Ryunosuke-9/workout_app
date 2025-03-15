const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

// **ユーザーIDで検索**
const findUserByUserId = async (user_id) => { 
    const [rows] = await db.execute("SELECT user_id, password FROM users WHERE user_id = ?", [user_id]);
    return rows.length > 0 ? rows[0] : null;
};

// **パスワードを比較**
const comparePassword = async (inputPassword, hashedPassword) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
};

// **ログイン処理**
exports.loginUser = async (req, res) => {
    try {
        const { user_id, password } = req.body;
        if (!user_id || !password) {
            return res.status(400).json({ error: "すべての項目を入力してください。" });
        }

        const user = await findUserByUserId(user_id);
        if (!user) {
            return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "ユーザーIDまたはパスワードが間違っています。" });
        }

        // **トークンを 1 日間有効にする**
        const token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, { expiresIn: "1d" });

        res.status(200).json({ message: "ログイン成功！", token });
    } catch (error) {
        console.error("❌ サーバーエラー:", error);
        res.status(500).json({ error: "サーバーエラー" });
    }
};
