import { useEffect } from "react";
import styles from "@/styles/measure.module.css";
import HamburgerMenu from "@/components/HamburgerMenu";
import useMeasure from "@/hooks/useMeasure";

// APIエンドポイントの定義
const API_URL = "http://18.183.224.238/api/measure";

const MeasurePage = () => {
  const {
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
    fetchDailyMuscleValue
  } = useMeasure();

  // 初期データ取得
  useEffect(() => {
    fetchExercises(category);
    fetchDailyMuscleValue();
  }, [category, fetchExercises, fetchDailyMuscleValue]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>総負荷量計測</h1>
        <HamburgerMenu />
      </div>

      <div className={styles.contentContainer}>
        {/* 左カラム - 入力フォーム */}
        <div className={styles.leftColumn}>
          {/* 部位選択と種目登録 */}
          <div className={styles.topRowContainer}>
            {/* 部位選択 */}
            <div className={`${styles.PartRegister} ${styles.BoxContainer}`}>
              <h2>部位を選択</h2>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
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
                  onChange={(e) => handleExerciseNameChange(e.target.value)}
                  placeholder="新しい種目名を入力"
                  className={styles.EventInput}
                />
                <button 
                  onClick={handleAddExercise} 
                  className={styles.EventButton}
                >
                  追加
                </button>
              </div>
            </div>
          </div>

          {/* 登録済みの種目一覧 */}
          <div className={styles.ExerciseContainer}>
            <h2>登録済みの種目</h2>
            {message && <p className={styles.message}>{message}</p>}
            
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

        {/* 右カラム - 今日の記録表示 */}
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
