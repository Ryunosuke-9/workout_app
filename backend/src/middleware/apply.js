const express = require("express");
const cors = require("cors");

// 本番環境とローカル環境のオリジンを許可
const allowedOrigins = [
  "http://18.183.224.238",     // IPアドレスでのアクセス
  "http://localhost:3000",     // ローカル開発環境
];

const applyMiddlewares = (app) => {
  app.use(express.json()); // JSON データを解析

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow this origin: ${origin}`));
      }
    },
    credentials: true, // クッキーやトークンのやり取りを許可
  }));
};

module.exports = { applyMiddlewares };
