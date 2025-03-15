import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/register.module.css";

// ※ URL は正しいホストとプロトコルに修正してください
const API_URL = "http://13.231.79.153:5000/api/register";

const Register = () => {
  const router = useRouter();
  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm_password] = useState("");
  const [message, setMessage] = useState("");
  const [tooltip, setTooltip] = useState({ userId: false, password: false });

  const toggleTooltip = (field) => {
    setTooltip((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!user_id || !password || !confirm_password) {
      setMessage("すべての項目を入力してください");
      return;
    }

    if (password !== confirm_password) {
      setMessage("パスワードが一致しません");
      return;
    }

    try {
      const response = await fetch(API_URL, {  // 修正: API_BASE_URL → API_URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, password, confirm_password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("登録成功！ログインしてください");
      } else {
        setMessage(`${data.error || "登録に失敗しました"}`);
      }
    } catch (error) {
      console.error("エラー:", error);
      setMessage("サーバーエラーが発生しました");
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2>新規登録</h2>
      <form onSubmit={handleRegister} className={styles.form}>
        {/* ユーザーID */}
        <div className={styles["input-container"]}>
          <input
            type="text"
            placeholder="ユーザーID"
            value={user_id}
            onChange={(e) => setUser_id(e.target.value)}
            className={styles.input}
            required
          />
          <span
            className={styles["question-mark"]}
            onClick={() => toggleTooltip("userId")}
          >
            ?
          </span>
          {tooltip.userId && (
            <span className={styles.tooltip}>
              ユーザーIDは5文字以上の英数字のみで入力してください。
            </span>
          )}
        </div>

        {/* パスワード */}
        <div className={styles["input-container"]}>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <span
            className={styles["question-mark"]}
            onClick={() => toggleTooltip("password")}
          >
            ?
          </span>
          {tooltip.password && (
            <span className={styles.tooltip}>
              パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めて入力してください。
            </span>
          )}
        </div>

        {/* 確認用パスワード */}
        <div className={styles["input-container"]}>
          <input
            type="password"
            placeholder="パスワード（確認）"
            value={confirm_password}
            onChange={(e) => setConfirm_password(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <button type="submit" className={styles.button}>
          登録
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}

      <button onClick={handleGoToLogin} className={styles.LoginButton}>
        ログインページへ
      </button>
    </div>
  );
};

export default Register;
