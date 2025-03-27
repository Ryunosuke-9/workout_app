const app = require("./app");

// ポート番号の設定
const PORT = process.env.PORT || 5000;

// サーバーの起動
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 サーバーが起動しました: http://0.0.0.0:${PORT}`);
});