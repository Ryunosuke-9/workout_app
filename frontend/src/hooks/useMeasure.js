import { useState, useCallback } from "react";
import axios from "axios";
import useAuth from "./useAuth";

// APIエンドポイントの定義
const API_URL = "http://18.183.224.238/api/measure";

const useMeasure = () => {
  // 認証フックの利用
  const { handleAuthError, getToken } = useAuth();

  // 状態管理
  const [category, setCategory] = useState("chest");
  const [exerciseName, setExerciseName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [exerciseData, setExerciseData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totalMuscleValue, setTotalMuscleValue] = useState(0);
  const [dailyRecords, setDailyRecords] = useState([]);

  // 入力値変更時の処理
  const handleInputChange = useCallback((event, exercise_id, field) => {
    const { value } = event.target;
    if (value === "" || isNaN(value) || Number(value) < 0) return;
    
    setExerciseData(prev => ({
      ...prev,
      [exercise_id]: { ...prev[exercise_id], [field]: value }
    }));
  }, []);

  // 部位に応じた種目一覧を取得
  const fetchExercises = useCallback(async (selectedCategory) => {
    const token = getToken();
    if (!token) {
      handleAuthError({ response: { status: 403 } }, setMessage);
      return;
    }
    
    try {
      const response = await axios.get(
        `${API_URL}/exercises/${selectedCategory}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExercises(response.data);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [handleAuthError, getToken]);

  // 新しい種目を追加
  const handleAddExercise = useCallback(async () => {
    if (!exerciseName.trim()) return;
    
    const token = getToken();
    try {
      await axios.post(
        `${API_URL}/exercises`,
        { name: exerciseName, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExerciseName("");
      fetchExercises(category);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [category, exerciseName, fetchExercises, getToken, handleAuthError]);

  // 種目を削除
  const handleDelete = useCallback(async (exercise_id) => {
    // 確認ダイアログ表示
    const firstConfirm = window.confirm(
      "本当にこの種目を削除してよろしいですか？この種目で行ってきた履歴も消えてしまいます。"
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "この操作は取り消せません。本当に削除してよろしいですか？"
    );
    if (!secondConfirm) return;

    const token = getToken();
    try {
      await axios.delete(`${API_URL}/${exercise_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("✅ 種目を削除しました！");
      fetchExercises(category);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [category, fetchExercises, getToken, handleAuthError]);

  // 筋トレ記録の送信
  const handleSubmit = useCallback(async (exercise_id) => {
    const { weight, reps } = exerciseData[exercise_id] || {};
    
    // 入力値のバリデーション
    if (!weight || !reps) {
      setMessage("⚠️ 重量と回数を入力してください！");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    const token = getToken();
    
    try {
      await axios.post(
        API_URL,
        { 
          exercise_id, 
          weight: Number(weight), 
          reps: Number(reps) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 成功時の処理
      setMessage("✅ 記録しました！💪");
      setExerciseData(prev => ({
        ...prev,
        [exercise_id]: { weight: "", reps: "" }
      }));
      fetchDailyMuscleValue();
    } catch (err) {
      handleAuthError(err, setMessage);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseData, getToken, handleAuthError]);

  // 今日の筋値データを取得
  const fetchDailyMuscleValue = useCallback(async () => {
    const token = getToken();
    
    try {
      const response = await axios.get(`${API_URL}/daily-muscle-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDailyRecords(response.data.records || []);
      setTotalMuscleValue(response.data.totalMuscleValue || 0);
    } catch (err) {
      handleAuthError(err, setMessage);
    }
  }, [getToken, handleAuthError]);

  // 部位変更時の処理
  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
  }, []);

  // 種目名変更時の処理
  const handleExerciseNameChange = useCallback((value) => {
    setExerciseName(value);
  }, []);

  return {
    // 状態
    category,
    exerciseName,
    exercises,
    exerciseData,
    isLoading,
    message,
    totalMuscleValue,
    dailyRecords,
    
    // アクション
    handleCategoryChange,
    handleExerciseNameChange,
    handleInputChange,
    handleAddExercise,
    handleDelete,
    handleSubmit,
    fetchExercises,
    fetchDailyMuscleValue,
    setMessage
  };
};

export default useMeasure; 