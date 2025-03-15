import { useState } from "react";
import Link from 'next/link';
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
                <li><Link href="/measure/">Measure</Link></li>
                <li><Link href="/history/">History</Link></li>
                <li><Link href="/workouts">設定</Link></li>
            </ul>
        </div>
    );
}
