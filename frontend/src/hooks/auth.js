import { useEffect } from "react";
import { useRouter } from "next/router";
import jwtDecode from "jwt-decode"; // ✅ 修正

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      let token = localStorage.getItem("token");
      console.log("🔍 [AuthHook] Retrieved token from localStorage:", token);

      if (!token) {
        console.error("🚨 [AuthHook] No token found → Redirecting to /login");
        router.push("/login");
        return;
      }

      // `Bearer xxxxxx.yyyyyy.zzzzzz` の形式の可能性があるので修正
      if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }
      console.log("🔍 [AuthHook] Extracted token:", token);

      try {
        const decoded = jwtDecode(token);
        console.log("✅ [AuthHook] Decoded Token:", decoded);

        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiration = decoded.exp - currentTime;

        if (timeUntilExpiration <= 0) {
          console.warn("⚠️ [AuthHook] Token expired → Clearing storage & redirecting");
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          router.push("/login");
        } else {
          console.log(`🟢 [AuthHook] Token valid for ${Math.round(timeUntilExpiration / 60)} minutes`);
          setTimeout(checkAuth, timeUntilExpiration * 1000);
        }
      } catch (error) {
        console.error("❌ [AuthHook] Token decode error:", error);
        console.error("❌ [AuthHook] Token decode failed. Token content:", token);
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);
};

export default useAuth;
