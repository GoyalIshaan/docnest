import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { userState } from "../atom";

interface SignUpData {
  username: string;
  email: string;
  password: string;
}
interface LoginData {
  email: string;
  password: string;
}

const LOCALHOST = "http://localhost:8000";

const useAutoSignUp = () => {
  const setUserState = useSetRecoilState(userState);
  const [isLoading, setIsLoading] = useState(true);

  const autoSignUp = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${LOCALHOST}/api/user/me`, {
        withCredentials: true,
      });
      setUserState(response.data.user);
    } catch (error) {
      console.error(error);
      setUserState({ id: "", username: "", email: "" });
    } finally {
      setIsLoading(false);
    }
  }, [setUserState]);

  useEffect(() => {
    autoSignUp();
  }, [autoSignUp]);

  return { isLoading };
};

const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUserState = useSetRecoilState(userState);

  const signup = async ({ username, email, password }: SignUpData) => {
    try {
      setLoading(true);
      setError(null);
      const user = await axios.post(
        `${LOCALHOST}/api/user/`,
        {
          username,
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserState(user.data.user);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};
const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUserState = useSetRecoilState(userState);

  const login = async ({ email, password }: LoginData) => {
    try {
      setLoading(true);
      setError(null);
      const user = await axios.post(
        `${LOCALHOST}/api/user/me/`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserState(user.data.user);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

const useLogout = () => {
  const setUserState = useSetRecoilState(userState);

  const logout = async () => {
    try {
      await axios.put(
        `${LOCALHOST}/api/user/`,
        {},
        {
          withCredentials: true,
        }
      );
      setUserState({ id: "", username: "", email: "" });
    } catch (error) {
      console.error(error);
    }
  };

  return { logout };
};

export { useSignUp, useAutoSignUp, useLogin, useLogout };
