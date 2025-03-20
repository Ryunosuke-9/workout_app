const express = require("express");
const cors = require("cors");

// 本番環境とローカル環境のオリジンを許可
const allowedOrigins = [
  "http://18.183.224.238",  // 本番環境
  "http://localhost:3000"   // ローカル環境
];

const applyMiddlewares = (app) => {
  app.use(express.json()); // JSON データを解析
  app.use(cors({
    origin: (origin, callback) => {
      // origin が undefined の場合（例えば Postman からのリクエスト）は許可
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy does not allow this origin"));
      }
    },
    credentials: true,  // 認証情報（クッキーやヘッダー）を許可
  }));
};

module.exports = { applyMiddlewares };
