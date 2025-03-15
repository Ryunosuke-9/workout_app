const app = require("./app"); // ✅ `app.js` を正しくインポート

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
