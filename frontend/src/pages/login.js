import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/login.module.css";

const API_URL = "https://18.183.224.238:5000/api/login";

const Login = () => {
  const router = useRouter();
  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!user_id || !password) {
      setMessage("⚠️ ユーザーIDとパスワードを入力してください。");
      return;
    }

    try {
      console.log("[Login] Sending POST", { user_id, password });
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });

      console.log("[Login] Response status:", response.status);
      const data = await response.json();
      console.log("[Login] Response body:", data);

      if (response.ok) {
        // ✅ トークンの形式を詳細にチェック
        const tokenParts = data.token?.split(".");
        console.log("[Login] Token received:", data.token);
        console.log("[Login] Token format valid:", tokenParts?.length === 3);

        // ✅ `localStorage` へ保存
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        console.log("[Login] Token successfully saved to localStorage");

        // ✅ 保存後すぐに取得して確認
        const storedToken = localStorage.getItem("token");
        console.log("[Login] Retrieved token from localStorage:", storedToken);

        // ✅ 保存完了後にページ遷移（遷移が早すぎると `localStorage` に保存されないことがある）
        setTimeout(() => {
          console.log("[Login] Redirecting to /measure");
          router.push("/measure");
        }, 500);
      } else {
        setMessage(data.error || "⚠️ ログインに失敗しました。");
      }
    } catch (error) {
      console.error("[Login] Network/server error:", error);
      setMessage("❌ サーバーエラーが発生しました。");
    }
  };

  const handleGoToRegister = () => router.push("/register");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2>ログイン</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        <input
          type="text"
          placeholder="ユーザーID"
          value={user_id}
          onChange={(e) => setUser_id(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>ログイン</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
      <button onClick={handleGoToRegister} className={styles.RegisterButton}>
        新規登録ページへ
      </button>
    </div>
  );
};

export default Login;
