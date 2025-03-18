const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

// **SECRET_KEY が未設定ならエラーを出す**
if (!SECRET_KEY) {
    console.error("🚨 環境変数 SECRET_KEY が設定されていません。");
    process.exit(1); // サーバーを強制終了
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.error("❌ 認証エラー: トークンがありません");
        return res.status(401).json({ error: "⚠️ 認証トークンがありません。" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error("❌ 認証エラー: トークンが無効または期限切れ", err);
            return res.status(403).json({ error: "⚠️ トークンが無効または期限切れです。" });
        }

        req.user = { user_id: user.user_id };
        if (process.env.NODE_ENV !== "production") {
            console.log("✅ 認証成功！デコードしたユーザー:", req.user);
        }
        next();
    });
};

module.exports = { authenticateToken };
