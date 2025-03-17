import { useState, useEffect } from "react";
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
import HamburgerMenu from "@/components/HamburgerMenu"; // ✅ components に変更
import useAuth from "@/components/Auth"; // ✅ hooks ではなく components に変更

const API_URL = "http://13.231.79.153:5000/api/history";

const HistoryPage = () => {
  useAuth(); // ✅ 認証チェックを適用
  const router = useRouter();
  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("total_muscle");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("No token");
        const headers = { Authorization: `Bearer ${token}` };

        const totalRes = await fetch(`${API_URL}/totals`, { headers });
        if (!totalRes.ok) throw new Error(`Server error: ${totalRes.status}`);
        const totalData = await totalRes.json();
        setCategoryTotals(totalData.categoryTotals ?? []);
        setOverallTotal(totalData.overallTotal ?? 0);

        const weeklyRes = await fetch(`${API_URL}/weekly`, { headers });
        if (!weeklyRes.ok) throw new Error(`Server error: ${weeklyRes.status}`);
        const weeklyDataResponse = await weeklyRes.json();
        setWeeklyData(weeklyDataResponse.weeklyData ?? []);

        const datesRes = await fetch(`${API_URL}/dates`, { headers });
        if (!datesRes.ok) throw new Error(`Server error: ${datesRes.status}`);
        const datesData = await datesRes.json();
        if (!datesData || !Array.isArray(datesData.dates)) {
          console.error("Invalid datesData:", datesData);
          setAvailableDates([]);
        } else {
          setAvailableDates(datesData.dates);
          if (datesData.dates.length > 0) {
            const initialDate = datesData.dates[0];
            setSelectedDate(initialDate);
            fetchDailyHistory(initialDate);
          }
        }
      } catch (error) {
        console.error("API error:", error);
        if (error.message.includes("403")) {
          router.push("/login");
        }
      }
    };
    fetchData();
  }, []);

  const fetchDailyHistory = async (dateStr) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_URL}/daily?date=${dateStr}`, { headers });
      if (!res.ok) {
        console.error(`Error ${res.status}:`, await res.text());
        setDailyHistory([]);
        return;
      }
      const data = await res.json();
      setDailyHistory(data.dailyHistory ?? []);
    } catch (error) {
      console.error("Data fetch error:", error);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchDailyHistory(newDate);
  };

  const formatDateForDisplay = (dateStr) => dateStr.replace(/-/g, "/");

  const maxYValue =
    weeklyData.length > 0
      ? Math.max(...weeklyData.map((d) => Number(d[selectedCategory]) || 0), 100)
      : 100;

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
          <h2>部位と総合の総負荷量負荷量</h2>
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
                  <td>AII</td>
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
