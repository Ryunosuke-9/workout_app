import { useState } from "react";
import styles from "@/styles/HamburgerMenu.module.css"; // ✅ CSS Modulesを適用

export default function HamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.menuContainer}>
            {/* 🔹 メニューを開閉するボタン */}
            <button 
                className={styles.menuButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            {/* 🔹 メニューの中身（開いているときのみ表示） */}
            <ul className={`${styles.menuList} ${isOpen ? styles.open : ""}`}>
                <li><a href="/measure">計測</a></li>
                <li><a href="/history">履歴</a></li>
                <li><a href="/workouts">設定</a></li>
            </ul>
        </div>
    );
}
