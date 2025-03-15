const app = require("./app"); // ✅ `app.js` を正しくインポート

const PORT = process.env.PORT || 5000;
app.listen(5000, '0.0.0.0', () => {
    console.log("🚀 Server running on http://0.0.0.0:5000");
});
