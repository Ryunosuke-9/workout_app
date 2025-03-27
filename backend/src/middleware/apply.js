const express = require("express");
const cors = require("cors");

// 許可するオリジンの設定
const allowedOrigins = [
  "http://18.183.224.238",     // IPアドレスでのアクセス
  "http://localhost:3000",     // ローカル開発環境
];

// ミドルウェア適用のメイン処理
const applyMiddlewares = (app) => {
  try {
    // JSONデータの解析を有効化
    app.use(express.json());

    // CORSの設定を適用
    app.use(cors({
      origin: (origin, callback) => {
        // オリジンの検証
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`🚨 CORSポリシーエラー: ${origin}からのアクセスは許可されていません。`));
        }
      },
      credentials: true, // クッキーやトークンのやり取りを許可
    }));

    console.log("✅ ミドルウェアの適用が完了しました。");
  } catch (error) {
    // エラー発生時のログ出力
    console.error("🚨 ミドルウェア適用エラー:", error);
    throw error;
  }
};

module.exports = { applyMiddlewares };
