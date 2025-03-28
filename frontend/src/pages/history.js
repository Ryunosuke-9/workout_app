import React, { useEffect, useState } from "react";
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
import useHistory from "@/hooks/useHistory";

const HistoryPage = () => {
  const {
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
    handleDateChange
  } = useHistory();

  // グラフ表示用の状態
  const [selectedCategory, setSelectedCategory] = useState("total_muscle");

  // 初期データ取得
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>計測履歴</h1>
        <HamburgerMenu />
      </div>

      <div className={styles.columnsContainer}>
        {/* 左カラム - 日付ごとの履歴 */}
        <div className={styles.leftColumn}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>日付ごとの履歴</h2>
            <select
              className={styles.dateSelect}
              onChange={(e) => handleDateChange(e.target.value)}
              value={selectedDate}
            >
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {(() => {
                    const date2 = new Date(date);
                    return date2.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
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

        {/* 右カラム - 筋値の合計 */}
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

      {/* グラフ表示部分 */}
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
            <YAxis 
              domain={[
                0, 
                weeklyData.length > 0
                  ? Math.max(...weeklyData.map((d) => Number(d[selectedCategory]) || 0), 100)
                  : 100
              ]} 
            />
            <Tooltip 
              wrapperStyle={{ pointerEvents: "auto" }}
              contentStyle={{ 
                backgroundColor: "var(--tooltip-bg)", 
                color: "var(--tooltip-text)", 
                border: "1px solid var(--tooltip-border)" 
              }} 
            />
            <Line 
              type="monotone" 
              dataKey={selectedCategory} 
              stroke="#ffcc00" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
        
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default HistoryPage;