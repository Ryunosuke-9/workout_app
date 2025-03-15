import { useEffect } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode"; // ✅ 修正

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn("🔴 トークン期限切れ - ログアウト処理実行");
          sessionStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ トークンデコードエラー:", error);
        sessionStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        router.push("/login");
      }
    };

    // **1秒ごとにチェック**
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval); // ✅ クリーンアップ
  }, [router]);
};

export default useAuth; // ✅ 修正なしでOK
