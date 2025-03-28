import { useState, useCallback } from "react";
import useAuth from "./useAuth";

// APIエンドポイントの定義
const API_URL = "http://18.183.224.238/api/history";

const useHistory = () => {
  // 認証フックの利用
  const { handleAuthError, getToken } = useAuth();

  // 状態管理
  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [message, setMessage] = useState("");

  // 日付ごとの履歴を取得
  const fetchDailyHistory = useCallback(async (dateStr) => {
    try {
      const token = getToken();
      if (!token) throw new Error("トークンが存在しません");
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_URL}/daily?date=${dateStr}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`データ取得エラー: ${response.status}`);
      }
      
      const data = await response.json();
      setDailyHistory(data.dailyHistory ?? []);
    } catch (error) {
      handleAuthError(error, setMessage);
    }
  }, [handleAuthError, getToken]);

  // 初期データ取得
  const fetchInitialData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("トークンが存在しません");
      const headers = { Authorization: `Bearer ${token}` };

      // 筋値合計データの取得
      const totalResponse = await fetch(`${API_URL}/totals`, { headers });
      if (!totalResponse.ok) throw new Error(`サーバーエラー: ${totalResponse.status}`);
      const totalData = await totalResponse.json();
      setCategoryTotals(totalData.categoryTotals ?? []);
      setOverallTotal(totalData.overallTotal ?? 0);

      // 週間データの取得
      const weeklyResponse = await fetch(`${API_URL}/weekly`, { headers });
      if (!weeklyResponse.ok) throw new Error(`サーバーエラー: ${weeklyResponse.status}`);
      const weeklyDataJson = await weeklyResponse.json();
      setWeeklyData(weeklyDataJson.weeklyData ?? []);

      // 利用可能な日付の取得
      const datesResponse = await fetch(`${API_URL}/dates`, { headers });
      if (!datesResponse.ok) throw new Error(`サーバーエラー: ${datesResponse.status}`);
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
      handleAuthError(error, setMessage);
    }
  }, [fetchDailyHistory, handleAuthError, getToken]);

  // 日付選択時の処理
  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  }, [fetchDailyHistory]);

  return {
    // 状態
    dailyHistory,
    selectedDate,
    availableDates,
    categoryTotals,
    overallTotal,
    weeklyData,
    message,
    
    // アクション
    fetchInitialData,
    handleDateChange,
    setMessage
  };
};

export default useHistory; 