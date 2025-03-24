import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/register.module.css";

const API_URL = "https://18.183.224.238:5000/api/register";

const Register = () => {
  const router = useRouter();
  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm_password] = useState("");
  const [message, setMessage] = useState("");
  const [tooltip, setTooltip] = useState({ userId: false, password: false });

  // ✅ ツールチップのトグル
  const toggleTooltip = (field) => {
    setTooltip((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ✅ フォーム送信時の処理
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!user_id || !password || !confirm_password) {
      setMessage("⚠️ すべての項目を入力してください。");
      return;
    }

    if (password !== confirm_password) {
      setMessage("⚠️ パスワードが一致しません。");
      return;
    }

    // ✅ クライアント側のバリデーション
    const user_idRegex = /^[A-Za-z0-9]{5,}$/;
    if (!user_idRegex.test(user_id)) {
      setMessage("⚠️ ユーザーIDは5文字以上の英数字のみで入力してください。");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage("⚠️ パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, password, confirm_password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ 登録成功！ログインしてください。");
        setTimeout(() => {
          router.push("/login");
        }, 2000); // ✅ 2秒後にログインページへ移動
      } else {
        setMessage(`${data.error || "❌ 登録に失敗しました。"}`);
      }
    } catch (error) {
      console.error("❌ エラー:", error);
      setMessage("❌ サーバーエラーが発生しました。");
    }
  };

  // ✅ ログインページへ遷移
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
            ❓
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
            ❓
          </span>
          {tooltip.password && (
            <span className={styles.tooltip}>
              パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。
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
