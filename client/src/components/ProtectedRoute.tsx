import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "../atom";
import { useAutoSignUp } from "../hooks/useUser";
import Spinner from "./Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const { isLoading } = useAutoSignUp();

  useEffect(() => {
    if (!isLoading && user.id === "") {
      navigate("/signin");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <Spinner />;
  }

  return user.id !== "" ? <>{children}</> : null;
};

export default ProtectedRoute;
