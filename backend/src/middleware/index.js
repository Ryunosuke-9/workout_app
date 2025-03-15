const express = require("express");
const cors = require("cors");

// 許可するオリジンを環境変数から取得（なければデフォルト値を設定）
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://13.231.79.153:3000";

const applyMiddlewares = (app) => {
  app.use(express.json()); // JSON データを解析
  app.use(cors({ origin: allowedOrigin })); // CORS 設定：特定のオリジンのみ許可
};

module.exports = { applyMiddlewares };
