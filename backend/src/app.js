const express = require("express");
require("dotenv").config();

const app = express(); // ✅ これを先に定義する必要がある

const { applyMiddlewares } = require("./middleware/apply"); // ✅ 共通ミドルウェア
const { authenticateToken } = require("./middleware/auth"); // ✅ 認証ミドルウェア

// ✅ 共通ミドルウェアを適用
applyMiddlewares(app);

// ✅ ウェルカムページ
app.get("/", (req, res) => {
  res.send("🚀 musclog.com へようこそ！");
});

// ✅ ルート設定
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const measureRoute = require("./routes/measure");
const historyRoutes = require("./routes/history");
const settingRoutes = require("./routes/setting");

app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/measure", authenticateToken, measureRoute);
app.use("/api/history", authenticateToken, historyRoutes);
app.use("/api/setting", authenticateToken, settingRoutes);

// ✅ `app` をエクスポート
module.exports = app;
