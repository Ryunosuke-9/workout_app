import { useEffect } from "react";
import { useRouter } from "next/router";
import jwtDecode from "jwt-decode"; // インポート修正

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      let token = localStorage.getItem("token");
      console.log("[AuthHook] Retrieved token:", token);

      if (!token) {
        console.error("[AuthHook] No token found → redirect to /login");
        router.push("/login");
        return;
      }

      // トークンが "Bearer xxxxx" の形式の場合、プレフィックスを削除
      token = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

      try {
        const decoded = jwtDecode(token); // 修正
        console.log("[AuthHook] Decoded token payload:", decoded);

        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = decoded.exp - currentTime;

        if (timeUntilExpiration <= 0) {
          console.warn("[AuthHook] Token expired → clearing storage & redirect");
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          router.push("/login");
        } else {
          console.log(`🟢 Token valid for ${Math.round(timeUntilExpiration / 60)} minutes`);
          setTimeout(checkAuth, timeUntilExpiration * 1000);
        }
      } catch (error) {
        console.error("[AuthHook] Token decode error:", error.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);
};

export default useAuth;
