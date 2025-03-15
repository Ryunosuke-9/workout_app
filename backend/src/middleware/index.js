const express = require("express");
const cors = require("cors");

// **共通ミドルウェアの適用**
const applyMiddlewares = (app) => {
    app.use(express.json()); // JSON データを解析
    app.use(cors());         // CORS 設定
};

module.exports = { applyMiddlewares };
