import { useEffect } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token"); // ✅ `sessionStorage` → `localStorage` に変更（12時間保持のため）
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = decoded.exp - currentTime;

        if (timeUntilExpiration <= 0) {
          console.warn("🔴 トークン期限切れ - ログアウト処理実行");
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          router.push("/login");
        } else {
          console.log(`🟢 トークン有効: ${Math.round(timeUntilExpiration / 60)}分後に再チェック`);
          setTimeout(() => checkAuth(), timeUntilExpiration * 1000);
        }
      } catch (error) {
        console.error("❌ トークンデコードエラー:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        router.push("/login");
      }
    };

    checkAuth(); // 初回実行
  }, [router]);
};

export default useAuth;
