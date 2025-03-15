const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.error("❌ 認証エラー: トークンがありません");
        return res.status(401).json({ error: "認証トークンがありません。" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error("❌ 認証エラー: トークンが無効または期限切れ");
            return res.status(403).json({ error: "トークンが無効または期限切れです。" });
        }

        req.user = { user_id: user.user_id };
        console.log("✅ 認証成功！デコードしたユーザー:", req.user);
        next();
    });
};

module.exports = { authenticateToken };
