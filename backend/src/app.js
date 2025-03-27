const express = require("express");
require("dotenv").config();

// Expressアプリケーションの初期化
const app = express();

// ミドルウェアのインポート
const { applyMiddlewares } = require("./middleware/apply");
const { authenticateToken } = require("./middleware/auth");

// ルートのインポート
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const measureRoute = require("./routes/measure");
const historyRoutes = require("./routes/history");
const settingRoutes = require("./routes/setting");

// 共通ミドルウェアの適用
applyMiddlewares(app);

// APIルートの設定
app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/measure", authenticateToken, measureRoute);
app.use("/api/history", authenticateToken, historyRoutes);
app.use("/api/setting", authenticateToken, settingRoutes);

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error("🚨 エラーが発生しました:", err);
  res.status(500).json({ error: "❌ サーバーエラーが発生しました。" });
});

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({ error: "⚠️ ページが見つかりません。" });
});

module.exports = app;
