import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/login.module.css";

const API_BASE_URL = "http://13.231.79.153:5000/api/login";

const Login = () => {
  const router = useRouter();
  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!user_id || !password) {
      setMessage("ユーザーIDとパスワードを入力してください。");
      return;
    }

    try {
      console.log("ログインリクエスト送信中...", { user_id, password });

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, password }),
      });

      const data = await response.json();
      console.log("サーバーからのレスポンス:", data);
      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.token);
        router.push("/measure"); // ✅ 即座にリダイレクト
      } else {
        setMessage(`${data.error || "ログインに失敗しました。"}`);
      }
    } catch (error) {
      console.error("ログインエラー:", error);
      setMessage("サーバーエラーが発生しました。");
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
        <button type="submit" className={styles.button}>
          ログイン
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}

      <button onClick={handleGoToRegister} className={styles.RegisterButton}>
        新規登録ページへ
      </button>
    </div>
  );
};

export default Login;
