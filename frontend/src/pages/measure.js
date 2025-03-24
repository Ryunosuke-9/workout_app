import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "@/styles/measure.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useAuth from "@/hooks/auth";

// API URLは環境変数から取得（未設定の場合はデフォルト値）
const API_URL = "https://18.183.224.238:5000/api/measure";

const MeasurePage = () => {
  // 認証チェック（未ログイン時は内部でリダイレクト）
  useAuth();
  const router = useRouter();

  // 各種状態の管理
  const [category, setCategory] = useState("chest");
  const [exerciseName, setExerciseName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exerciseData, setExerciseData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totalMuscleValue, setTotalMuscleValue] = useState(0);
  const [dailyRecords, setDailyRecords] = useState([]);

  // 認証エラーハンドリング（useCallbackでメモ化）
  const handleAuthError = useCallback(
    (error) => {
      if (error.response?.status === 403) {
        console.error("🚨 認証エラー: トークン無効");
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setMessage("⚠️ セッションが切れました。再ログインしてください。");
        setTimeout(() => router.push("/login"), 1000);
      } else {
        console.error("❌ APIエラー:", error);
        setMessage("⚠️ サーバーエラーが発生しました。");
      }
    },
    [router]
  );

  // 入力値変更時の処理
  const handleInputChange = (event, exercise_id, field) => {
    const { value } = event.target;
    if (value === "" || isNaN(value) || Number(value) < 0) return;
    setExerciseData((prev) => ({
      ...prev,
      [exercise_id]: { ...prev[exercise_id], [field]: value },
    }));
  };

  // 部位変更時に種目一覧を取得
  const fetchExercises = useCallback(
    async (selectedCategory) => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleAuthError({ response: { status: 403 } });
        return;
      }
      try {
        console.log(`📡 ${selectedCategory} の種目を取得中...`);
        const response = await axios.get(
          `${API_URL}/exercises/${selectedCategory}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExercises(response.data);
      } catch (err) {
        handleAuthError(err);
      }
    },
    [handleAuthError]
  );

  useEffect(() => {
    fetchExercises(category);
  }, [category, fetchExercises]);

  // 新しい種目を追加
  const handleAddExercise = async () => {
    if (!exerciseName.trim()) return;
    const token = localStorage.getItem("token");
    try {
      console.log("📡 新しい種目を追加:", { exerciseName, category });
      await axios.post(
        `${API_URL}/exercises`,
        { name: exerciseName, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExerciseName("");
      fetchExercises(category);
    } catch (err) {
      handleAuthError(err);
    }
  };

  // 種目を削除
  const handleDelete = async (exercise_id) => {
    // １段階目の確認（履歴も削除される旨を明示）
    const firstConfirm = window.confirm(
      "本当にこの種目を削除してよろしいですか？この種目で行ってきた履歴も消えてしまいます。"
    );
    if (!firstConfirm) return;

    // ２段階目の確認
    const secondConfirm = window.confirm(
      "この操作は取り消せません。本当に削除してよろしいですか？"
    );
    if (!secondConfirm) return;

    const token = localStorage.getItem("token");
    try {
      console.log("📡 種目を削除:", exercise_id);
      await axios.delete(`${API_URL}/${exercise_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ 種目を削除しました！");
      fetchExercises(category);
    } catch (err) {
      console.error("❌ 削除エラー:", err.response?.data || err);
      handleAuthError(err);
    }
  };

  // 筋トレ記録の送信
  const handleSubmit = async (exercise_id) => {
    const { weight, reps } = exerciseData[exercise_id] || {};
    if (!weight || !reps) {
      setMessage("⚠️ 重量と回数を入力してください！");
      return;
    }
    const token = localStorage.getItem("token");
    setIsLoading(true);
    setMessage("");
    try {
      console.log("📡 筋トレ記録送信:", { exercise_id, weight, reps });
      await axios.post(
        API_URL,
        { exercise_id, weight: Number(weight), reps: Number(reps) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ 記録しました！💪");
      setExerciseData((prev) => ({
        ...prev,
        [exercise_id]: { weight: "", reps: "" },
      }));
      fetchDailyMuscleValue();
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 今日の筋値データを取得
  const fetchDailyMuscleValue = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      console.log("📡 今日の筋値データを取得中...");
      const response = await axios.get(`${API_URL}/daily-muscle-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyRecords(response.data.records || []);
      setTotalMuscleValue(response.data.totalMuscleValue || 0);
    } catch (err) {
      handleAuthError(err);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchDailyMuscleValue();
  }, [fetchDailyMuscleValue]);

  return (
    <div className={styles.pageContainer}>

      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>総負荷量計測</h1>
        <HamburgerMenu />
      </div>

      <div className={styles.contentContainer}>
        {/* 左カラム */}
        <div className={styles.leftColumn}>
          {/* 部位選択と種目登録 */}
          <div className={styles.topRowContainer}>
            {/* 部位選択 */}
            <div className={`${styles.PartRegister} ${styles.BoxContainer}`}>
              <h2>部位を選択</h2>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.PartDropdown}
              >
                <option value="chest">胸</option>
                <option value="shoulders">肩</option>
                <option value="back">背中</option>
                <option value="arms">腕</option>
                <option value="legs">脚</option>
              </select>
            </div>
            {/* 種目登録 */}
            <div className={`${styles.EventRegister} ${styles.BoxContainer}`}>
              <h2>種目を登録</h2>
              <div className={styles.EventForm}>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="新しい種目名を入力"
                  className={styles.EventInput}
                />
                <button onClick={handleAddExercise} className={styles.EventButton}>
                  追加
                </button>
              </div>
            </div>
          </div>

          {/* 登録済みの種目一覧 */}
          <div className={styles.ExerciseContainer}>
            <h2>登録済みの種目</h2>
            <table className={styles.ExerciseTable}>
              <thead>
                <tr>
                  <th>種目</th>
                  <th>重量 (kg)</th>
                  <th>回数</th>
                  <th>記録</th>
                  <th>削除</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>{exercise.name}</td>
                    <td>
                      <input
                        type="number"
                        value={exerciseData[exercise.id]?.weight || ""}
                        onChange={(e) => handleInputChange(e, exercise.id, "weight")}
                        className={styles.ExerciseInput}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={exerciseData[exercise.id]?.reps || ""}
                        onChange={(e) => handleInputChange(e, exercise.id, "reps")}
                        className={styles.ExerciseInput}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleSubmit(exercise.id)}
                        className={styles.recordButton}
                        disabled={isLoading}
                      >
                        記録する
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className={styles.deleteButton}
                      >
                        削除する
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右カラム（今日の筋値） */}
        <div className={styles.rightColumn}>
          <h2 className={styles.TodayMuscleValue}>今日の記録</h2>
          <p className={styles.totalMuscleValue}>
            総負荷量: <span>{totalMuscleValue}</span> kg
          </p>
          <table className={styles.MuscleTable}>
            <thead>
              <tr>
                <th>部位</th>
                <th>種目</th>
                <th>重量 (kg)</th>
                <th>回数</th>
                <th>筋値</th>
              </tr>
            </thead>
            <tbody>
              {dailyRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.category}</td>
                  <td>{record.exerciseName}</td>
                  <td>{record.weight} kg</td>
                  <td>{record.reps} 回</td>
                  <td>{record.muscleValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeasurePage;
