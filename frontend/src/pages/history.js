import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "@/styles/history.module.css";
import HamburgerMenu from "@/hooks/HamburgerMenu";
import useAuth from "@/hooks/auth";

// APIのURLは環境変数から取得（未設定の場合はデフォルト値）
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://13.231.79.153:5000/api/history";

const HistoryPage = () => {
  // 認証チェック（未ログインの場合は内部でリダイレクト）
  useAuth();
  const router = useRouter();

  // 各種状態の管理
  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("total_muscle");

  // セッションストレージからトークンを取得する関数
  const getToken = () => sessionStorage.getItem("token");

  // 指定日付の履歴データを取得
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
      console.error("❌ 日付ごとの履歴取得エラー:", error);
    }
  }, []);

  // コンポーネント初回レンダリング時に必要なデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("トークンが存在しません");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. 総負荷量（各部位・全体）の取得
        const totalResponse = await fetch(`${API_URL}/totals`, { headers });
        if (!totalResponse.ok) throw new Error(`サーバーエラー: ${totalResponse.status}`);
        const totalData = await totalResponse.json();
        setCategoryTotals(totalData.categoryTotals ?? []);
        setOverallTotal(totalData.overallTotal ?? 0);

        // 2. 週ごとのデータ取得
        const weeklyResponse = await fetch(`${API_URL}/weekly`, { headers });
        if (!weeklyResponse.ok) throw new Error(`サーバーエラー: ${weeklyResponse.status}`);
        const weeklyDataJson = await weeklyResponse.json();
        setWeeklyData(weeklyDataJson.weeklyData ?? []);

        // 3. 利用可能な日付の取得
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
        console.error("❌ データ取得エラー:", error);
        // 認証関連エラーの場合、ログインページへリダイレクト
        if (error.message.includes("403")) {
          router.push("/login");
        }
      }
    };

    fetchData();
  }, [fetchDailyHistory, router]);

  // 日付変更時のハンドラー
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  };

  // 週ごとのグラフ表示用：指定カテゴリの最大値を算出（最低値は100）
  const maxYValue = weeklyData && weeklyData.length > 0
    ? Math.max(...weeklyData.map((d) => Number(d[selectedCategory]) || 0), 100)
    : 100;

  // 日付文字列を表示用にフォーマットする関数
  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>計測履歴</h1>
        <HamburgerMenu />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.leftColumn}>
          <div className={styles.historyHeader}>
            <h2>日付ごとの履歴</h2>
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
                  <th>重量 (kg)</th>
                  <th>回数</th>
                  <th>筋値</th>
                </tr>
              </thead>
              <tbody>
                {dailyHistory.map((item, index) => (
                  <tr key={index}>
                    <td>{item.category}</td>
                    <td>{item.exercise}</td>
                    <td>{item.weight}</td>
                    <td>{item.reps}</td>
                    <td>{item.muscle_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noDataMessage}>この日には記録がありません。</p>
          )}
        </div>
        <div className={styles.rightColumn}>
          <h2>部位と総合の総負荷量</h2>
          {categoryTotals.length > 0 ? (
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th>部位</th>
                  <th>合計筋値</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map((item, index) => (
                  <tr key={index}>
                    <td>{item.category}</td>
                    <td>{item.total_muscle_value}</td>
                  </tr>
                ))}
                <tr className={styles.fixedTotalRow}>
                  <td>ALL</td>
                  <td>{overallTotal}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className={styles.noDataMessage}>データがありません。</p>
          )}
        </div>
      </div>
      <h2>週ごとの筋値推移</h2>
      <label className={styles.graphSelectLabel}>
        表示するデータ:
        <select
          className={styles.graphSelect}
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="total_muscle">総合筋値</option>
          <option value="chest">胸</option>
          <option value="back">背中</option>
          <option value="legs">足</option>
          <option value="arms">腕</option>
          <option value="shoulders">肩</option>
        </select>
      </label>
      <ResponsiveContainer width="90%" height={500}>
        <LineChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis domain={[0, maxYValue]} />
          <Tooltip />
          <Line type="monotone" dataKey={selectedCategory} stroke="#ffcc00" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryPage;
