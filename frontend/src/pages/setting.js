import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/setting.module.css";
import useAuth from "@/hooks/auth";
import HamburgerMenu from "@/components/HamburgerMenu";

const API_URL = "https://musclog.com/api/setting";

const SettingPage = () => {
  useAuth();
  const router = useRouter();

  // アカウント情報用
  const [userId, setUserId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [theme, setTheme] = useState("black");

  // 履歴・日付用
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);

  // メッセージ用
  const [message, setMessage] = useState("");

  // 編集状態管理（履歴テーブル）
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const [registrationDate, setRegistrationDate] = useState("");
  const [workoutDays, setWorkoutDays] = useState(null);


  const getToken = () => localStorage.getItem("token");

  const handleAuthError = useCallback(
    (error) => {
      console.error("❌ 認証/データ取得エラー:", error);
      if (
        error.message.includes("403") ||
        error.message.includes("トークンが存在しません")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setMessage("⚠️ セッションが切れました。再ログインしてください。");
        setTimeout(() => router.push("/login"), 1000);
      }
    },
    [router]
  );

  // ユーザーIDの取得
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (id) setUserId(id);
  }, []);

  // パスワード変更処理
  const handlePasswordChange = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/account/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setMessage(data.message || data.error || "パスワード更新結果不明");
    } catch (err) {
      setMessage("❌ パスワード変更に失敗しました。");
      console.error(err);
    }
  };

  // アカウント削除処理
  const handleAccountDelete = async () => {
    if (!confirm("本当にアカウントを削除しますか？")) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      router.push("/register");
    } catch (err) {
      setMessage("❌ アカウント削除に失敗しました。");
      console.error(err);
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRegistrationDate(data.registrationDate);
        setWorkoutDays(data.workoutDays);
      } catch (error) {
        console.error("📛 ユーザー情報取得失敗:", error);
      }
    };
    fetchStats();
  }, []);
  

  // 選択日付の履歴取得
  const fetchDailyHistory = useCallback(async (dateStr) => {
    try {
      const token = getToken();
      if (!token) throw new Error("トークンが存在しません");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_URL}/daily?date=${dateStr}`, { headers });
      if (!response.ok) {
        throw new Error(`データ取得エラー: ${response.status}`);
      }
      const data = await response.json();
      setDailyHistory(data.dailyHistory ?? []);
    } catch (error) {
      console.error("❌ 日ごとの履歴取得エラー:", error);
      handleAuthError(error);
    }
  }, [handleAuthError]);

  // 利用可能な日付の取得と初期日付設定
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("トークンが存在しません");
        const headers = { Authorization: `Bearer ${token}` };
        const datesResponse = await fetch(`${API_URL}/dates`, { headers });
        if (!datesResponse.ok)
          throw new Error(`サーバーエラー: ${datesResponse.status}`);
        const datesData = await datesResponse.json();
        if (Array.isArray(datesData.dates) && datesData.dates.length > 0) {
          setAvailableDates(datesData.dates);
          const initialDate = datesData.dates[0];
          setSelectedDate(initialDate);
          fetchDailyHistory(initialDate);
        } else {
          setAvailableDates([]);
        }
      } catch (error) {
        console.error("❌ 日付取得エラー:", error);
        handleAuthError(error);
      }
    };
    fetchDates();
  }, [fetchDailyHistory, handleAuthError, router]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  };

  // 履歴編集開始
  const handleEditRecord = (index) => {
    setEditingIndex(index);
    setEditingRecord({ ...dailyHistory[index] });
  };

  // 履歴編集保存
  const handleSaveEdit = async (index) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/records/${editingRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          record_id: editingRecord.id,
          weight: editingRecord.weight,
          reps: editingRecord.reps,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "記録を更新しました。");
        const newHistory = [...dailyHistory];
        newHistory[index] = {
          ...editingRecord,
          muscle_value: editingRecord.weight * editingRecord.reps,
        };
        setDailyHistory(newHistory);
        setEditingIndex(null);
        setEditingRecord(null);
      } else {
        setMessage(data.error || "更新に失敗しました。");
      }
    } catch (error) {
      console.error("❌ 更新エラー:", error);
      setMessage("記録更新に失敗しました。");
    }
  };

  // 履歴削除処理
  const handleDeleteRecord = async (index) => {
    if (!confirm("この記録を削除しますか？")) return;
    try {
      const token = getToken();
      const recordId = dailyHistory[index].id;
      const res = await fetch(`${API_URL}/records/${recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "記録を削除しました。");
        setDailyHistory(dailyHistory.filter((_, i) => i !== index));
      } else {
        setMessage(data.error || "削除に失敗しました。");
      }
    } catch (error) {
      console.error("❌ 削除エラー:", error);
      setMessage("記録削除に失敗しました。");
    }
  };

  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`${styles.pageContainer} ${
        theme === "white" ? styles.whiteTheme : styles.blackTheme
      }`}
    >

      {/* ヘッダー */}
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>設定</h1>
        <HamburgerMenu />
      </div>

      {/* アカウント情報：2行×3列グリッド */}
      <div className={styles.accountContainer}>
        <h2>アカウント情報</h2>
        {/* 空白 */}
        <div className={styles.spacer}></div>
        <div className={styles.spacer}></div>

        {/* 左列：ユーザーID・パスワード */}
        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>ユーザーID:</span>
            <span>{userId}</span>
          </p>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>パスワード:</span>
            <span>
              ********
              <button
                className={styles.ChangeButton}
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? "閉じる" : "変更"}
              </button>
            </span>
          </p>
          {showPasswordForm && (
            <div className={styles.passwordChangeBox}>
              <input
                type="password"
                placeholder="現在のパスワード"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="新しいパスワード"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={handlePasswordChange}>変更する</button>
            </div>
          )}
        </div>

        
        {/* 中央列：登録情報（登録日・筋トレ日数） */}
        <div className={styles.column}>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>登録日:</span>
            <span>{registrationDate || "取得中..."}</span>
          </p>
          <p className={styles.infoLine}>
            <span className={styles.infoLabel}>筋トレ日数:</span>
            <span>{workoutDays != null ? `${workoutDays} 日` : "取得中..."}</span>
          </p>
        </div>

        

        {/* 右列：ログアウト & アカウント削除 */}
        <div className={styles.column}>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.actionButton} ${styles.logoutButton}`}
              onClick={handleLogout}
            >
              ログアウト
            </button>
            <button
              className={`${styles.actionButton} ${styles.dangerButton}`}
              onClick={handleAccountDelete}
            >
              アカウント削除
            </button>
          </div>
        </div>
      </div>

      {/* 日付選択と履歴編集・削除 */}
      <div className={styles.historyEditContainer}>
        <div className={styles.historyHeader}>
          <h2 className={styles.historyTitle}>日付ごとの履歴</h2>
          <select
            className={styles.dateSelect}
            onChange={handleDateChange}
            value={selectedDate}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {formatDateForDisplay(date)}
              </option>
            ))}
          </select>
        </div>
        {dailyHistory.length > 0 ? (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>部位</th>
                <th>種目</th>
                <th>重量</th>
                <th>回数</th>
                <th>筋値</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {dailyHistory.map((item, index) =>
                editingIndex === index ? (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>
                      <input
                        type="number"
                        value={editingRecord.weight}
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            weight: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingRecord.reps}
                        onChange={(e) =>
                          setEditingRecord({
                            ...editingRecord,
                            reps: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>{editingRecord.weight * editingRecord.reps}</td>
                    <td>
                      <div className={styles.buttonGroup}>
                        <button
                          className={`${styles.buttonModern} ${styles.saveButton}`}
                          onClick={() => handleSaveEdit(index)}
                        >
                          保存
                        </button>
                        <button
                          className={`${styles.buttonModern} ${styles.cancelButton}`}
                          onClick={() => setEditingIndex(null)}
                        >
                          キャンセル
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>{item.weight}</td>
                    <td>{item.reps}</td>
                    <td>{item.muscle_value}</td>
                    <td>
                      <div className={styles.buttonGroup}>
                        <button
                          className={`${styles.buttonModern} ${styles.editButton}`}
                          onClick={() => handleEditRecord(index)}
                        >
                          編集
                        </button>
                        <button
                          className={`${styles.buttonModern} ${styles.deleteButton}`}
                          onClick={() => handleDeleteRecord(index)}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        ) : (
          <p className={styles.noDataMessage}>この日には記録がありません。</p>
        )}
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default SettingPage;
