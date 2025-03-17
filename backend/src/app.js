const express = require("express");
require("dotenv").config();
const { applyMiddlewares } = require("./middleware"); // ✅ 共通ミドルウェア
const { authenticateToken } = require("./middleware/auth"); // ✅ 認証ミドルウェア

const app = express();

// ✅ 共通ミドルウェアを適用
applyMiddlewares(app);

// ✅ ルート設定
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const measureRoute = require("./routes/measure");
const historyRoutes = require("./routes/history");


app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/measure", authenticateToken, measureRoute); // ✅ `measure` ルートに認証を適用
app.use("/api/history", authenticateToken,historyRoutes);

// ✅ `app` のみをエクスポート（`{ app }` ではなく `app`）
module.exports = app;

