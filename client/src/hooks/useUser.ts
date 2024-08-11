import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { userState } from "../atom";
import { User } from "../types";

interface SignUpData {
  username: string;
  email: string;
  password: string;
}
interface LoginData {
  email: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const useAutoSignUp = () => {
  const setUserState = useSetRecoilState(userState);
  const [isLoading, setIsLoading] = useState(true);

  const autoSignUp = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/user/me`, {
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
        `${API_URL}/api/user/`,
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
      console.log(`${API_URL}/api/user/me/`);
      const user = await axios.post(
        `${API_URL}/api/user/me/`,
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
        `${API_URL}/api/user/`,
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

const useGetUserById = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User>({ id: "", username: "", email: "" });

  const getUserById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/user/id/${id}/`, {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { getUserById, user, loading, error };
};

export { useSignUp, useAutoSignUp, useLogin, useLogout, useGetUserById };
