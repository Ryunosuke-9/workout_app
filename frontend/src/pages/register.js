import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/register.module.css";

// APIエンドポイントの定義
const API_URL = "http://18.183.224.238/api/register";

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    confirm_password: ""
  });
  const [message, setMessage] = useState("");
  const [tooltip, setTooltip] = useState({ userId: false, password: false });

  // バリデーション用の正規表現
  const VALIDATION = {
    userId: /^[A-Za-z0-9]{5,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/
  };

  // フォーム入力のハンドラー
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ツールチップの表示/非表示を切り替え
  const toggleTooltip = (field) => {
    setTooltip(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // フォームのバリデーション
  const validateForm = () => {
    const { user_id, password, confirm_password } = formData;

    if (!user_id || !password || !confirm_password) {
      setMessage("⚠️ すべての項目を入力してください。");
      return false;
    }

    if (password !== confirm_password) {
      setMessage("⚠️ パスワードが一致しません。");
      return false;
    }

    if (!VALIDATION.userId.test(user_id)) {
      setMessage("⚠️ ユーザーIDは5文字以上の英数字のみで入力してください。");
      return false;
    }

    if (!VALIDATION.password.test(password)) {
      setMessage("⚠️ パスワードは8文字以上で、大文字・小文字・数字をそれぞれ1文字以上含めてください。");
      return false;
    }

    return true;
  };

  // ユーザー登録の処理
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ 登録成功！ログインしてください。");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.error || "❌ 登録に失敗しました。");
      }
    } catch (error) {
      console.error("❌ エラー:", error);
      setMessage("❌ サーバーエラーが発生しました。");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>負荷量計算アプリ</h1>
      <h2>新規登録</h2>
      
      <form onSubmit={handleRegister} className={styles.form}>
        {/* ユーザーID入力フィールド */}
        <div className={styles["input-container"]}>
          <input
            type="text"
            name="user_id"
            placeholder="ユーザーID"
            value={formData.user_id}
            onChange={handleInputChange}
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

        {/* パスワード入力フィールド */}
        <div className={styles["input-container"]}>
          <input
            type="password"
            name="password"
            placeholder="パスワード"
            value={formData.password}
            onChange={handleInputChange}
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

        {/* パスワード確認フィールド */}
        <div className={styles["input-container"]}>
          <input
            type="password"
            name="confirm_password"
            placeholder="パスワード（確認）"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>

        <button type="submit" className={styles.button}>
          登録
        </button>
      </form>

      {message && <p className={styles.message}>{message}</p>}

      <button 
        onClick={() => router.push("/login")} 
        className={styles.LoginButton}
      >
        ログインページへ
      </button>
    </div>
  );
};

export default Register;
