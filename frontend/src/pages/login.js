import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/login.module.css";

const API_URL = "http://18.183.224.238:5000/api/login";

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
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ トークンとユーザーIDを `localStorage` に保存
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        console.log("✅ ログイン成功！");

        // ✅ `/measure` にリダイレクト
        router.push("/measure");
      } else {
        setMessage(`${data.error || "⚠️ ログインに失敗しました。"}`);
      }
    } catch (error) {
      console.error("🚨 ログインエラー:", error);
      setMessage("❌ サーバーエラーが発生しました。");
    }
  };

  const handleGoToRegister = () => {
    router.push("/register");
  };

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
      <button onClick={handleGoToRegister} className={styles.RegisterButton}>新規登録ページへ</button>
    </div>
  );
};

export default Login;
