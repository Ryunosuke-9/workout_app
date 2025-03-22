import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/HamburgerMenu.module.css"; // ✅ CSS Modulesを適用

export default function HamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);

    // 📌 メニュー外をクリックすると閉じる処理
    useEffect(() => {
        const closeMenu = (event) => {
            if (!event.target.closest(`.${styles.menuContainer}`)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    return (
        <div className={styles.menuContainer}>
            {/* 🔹 メニューを開閉するボタン */}
            <button 
                className={styles.menuButton}
                onClick={(e) => {
                    e.stopPropagation(); // 🔹 クリックがイベント伝播しないようにする
                    setIsOpen(!isOpen);
                }}
            >
                ☰
            </button>

            {/* 🔹 メニューの中身（開いているときのみ表示） */}
            <ul className={`${styles.menuList} ${isOpen ? styles.open : ""}`}>
                <li><Link href="/measure">計測</Link></li>
                <li><Link href="/history">履歴</Link></li>
                <li><Link href="/setting">設定</Link></li>
            </ul>
        </div>
    );
}
