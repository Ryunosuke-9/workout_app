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
import HamburgerMenu from "@/components/HamburgerMenu";
import useAuth from "@/hooks/auth";

const API_URL = "http://18.183.224.238/api/history";

const HistoryPage = () => {
  useAuth();
  const router = useRouter();

  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("total_muscle");
  const [message, setMessage] = useState("");

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
      console.error("❌ 日付ごとの履歴取得エラー:", error);
      handleAuthError(error);
    }
  }, [handleAuthError]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("トークンが存在しません");
        const headers = { Authorization: `Bearer ${token}` };

        const totalResponse = await fetch(`${API_URL}/totals`, { headers });
        if (!totalResponse.ok) throw new Error(`サーバーエラー: ${totalResponse.status}`);
        const totalData = await totalResponse.json();
        setCategoryTotals(totalData.categoryTotals ?? []);
        setOverallTotal(totalData.overallTotal ?? 0);

        const weeklyResponse = await fetch(`${API_URL}/weekly`, { headers });
        if (!weeklyResponse.ok) throw new Error(`サーバーエラー: ${weeklyResponse.status}`);
        const weeklyDataJson = await weeklyResponse.json();
        console.log("🚀 WEEKLY API RESPONSE:", weeklyDataJson);
        setWeeklyData(weeklyDataJson.weeklyData ?? []);

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
        handleAuthError(error);
      }
    };

    fetchData();
  }, [fetchDailyHistory, handleAuthError, router]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  };

  const maxYValue =
    weeklyData && weeklyData.length > 0
      ? Math.max(...weeklyData.map((d) => Number(d[selectedCategory]) || 0), 100)
      : 100;

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
        <h1 className={styles.headerTitle}>計測履歴</h1>
        <HamburgerMenu />
      </div>

      <div className={styles.columnsContainer}>
        <div className={styles.leftColumn}>
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

      <div className={styles.graphContainer}>
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
            <XAxis
              dataKey="week"
              tickFormatter={(weekNum) => {
                const week = String(weekNum % 100).padStart(2, '0'); 
                return `W${week}`;
              }}
            />
            <YAxis domain={[0, maxYValue]} />
            <Tooltip 
              wrapperStyle={{ pointerEvents: "auto" }} // ツールチップの動作をスムーズに
              contentStyle={{ backgroundColor: "var(--tooltip-bg)", color: "var(--tooltip-text)", border: "1px solid var(--tooltip-border)" }} 
            />
            <Line type="monotone" dataKey={selectedCategory} stroke="#ffcc00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default HistoryPage;