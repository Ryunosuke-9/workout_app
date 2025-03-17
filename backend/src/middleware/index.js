const express = require("express");
const cors = require("cors");

// 本番環境のオリジンを明示的に指定
const allowedOrigin = "http://13.231.79.153";

const applyMiddlewares = (app) => {
  app.use(express.json()); // JSON データを解析
  app.use(cors({
    origin: allowedOrigin,
    credentials: true,  // 認証情報（クッキーやヘッダー）を許可
  }));
};

module.exports = { applyMiddlewares };
