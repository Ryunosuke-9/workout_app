import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/login.module.css";

// APIエンドポイントの定義
const API_URL = "http://18.183.224.238/api/login";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_id: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  // フォーム入力のハンドラー
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ログイン処理
  const handleLogin = async (e) => {
    e.preventDefault();
    const { user_id, password } = formData;

    // 入力値のバリデーション
    if (!user_id || !password) {
      setMessage("⚠️ ユーザーIDとパスワードを入力してください。");
      return;
    }

    try {
      // APIリクエスト送信
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功時の処理
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);

        // 測定ページへリダイレクト
        setTimeout(() => {
          router.push("/measure");
        }, 500);
      } else {
        // エラーメッセージ表示
        setMessage(data.error || "⚠️ ログインに失敗しました。");
      }
    } catch (error) {
      console.error("ログインエラー:", error);
      setMessage("❌ サーバーエラーが発生しました。");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2>ログイン</h2>
      
      <form onSubmit={handleLogin} className={styles.form}>
        {/* ユーザーID入力フィールド */}
        <input
          type="text"
          name="user_id"
          placeholder="ユーザーID"
          value={formData.user_id}
          onChange={handleInputChange}
          className={styles.input}
          required
        />
        
        {/* パスワード入力フィールド */}
        <input
          type="password"
          name="password"
          placeholder="パスワード"
          value={formData.password}
          onChange={handleInputChange}
          className={styles.input}
          required
        />
        
        <button type="submit" className={styles.button}>
          ログイン
        </button>
      </form>
      
      {message && <p className={styles.message}>{message}</p>}
      
      <button 
        onClick={() => router.push("/register")} 
        className={styles.RegisterButton}
      >
        新規登録ページへ
      </button>
    </div>
  );
};

export default Login;
