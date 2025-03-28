import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode"; // ✅ これを試す

const useAuth = () => {
  const router = useRouter();

  // トークン取得関数
  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  // トークン設定関数
  const setToken = useCallback((token, userId) => {
    localStorage.setItem("token", token);
    if (userId) {
      localStorage.setItem("user_id", userId);
    }
  }, []);

  // トークン削除関数
  const removeToken = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
  }, []);

  // トークンのデコード関数
  const decodeToken = useCallback((token) => {
    try {
      // Bearer プレフィックスがある場合は削除
      if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }, []);

  // 認証エラー処理のためのフック
  const handleAuthError = useCallback((error, setMessage) => {
    if (
      error.response?.status === 403 ||
      error.message?.includes("403") ||
      error.message?.includes("トークンが存在しません")
    ) {
      removeToken();
      if (setMessage) {
        setMessage("⚠️ セッションが切れました。再ログインしてください。");
      }
      setTimeout(() => router.push("/login"), 1000);
    } else if (setMessage) {
      setMessage("⚠️ サーバーエラーが発生しました。");
    }
  }, [router, removeToken]);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const decoded = decodeToken(token);
        if (!decoded) {
          removeToken();
          router.push("/login");
          return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiration = decoded.exp - currentTime;

        if (timeUntilExpiration <= 0) {
          removeToken();
          router.push("/login");
        } else {
          setTimeout(checkAuth, timeUntilExpiration * 1000);
        }
      } catch (error) {
        removeToken();
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, getToken, removeToken, decodeToken]);

  return { 
    handleAuthError,
    getToken,
    setToken,
    removeToken,
    decodeToken
  };
};

export default useAuth;
