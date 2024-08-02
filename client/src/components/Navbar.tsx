import React from "react";
import { motion } from "framer-motion";
import { User, FileText, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "../atom";
import { useAutoSignUp, useLogout } from "../hooks/useUser";

const Navbar: React.FC = () => {
  const user = useRecoilValue(userState);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { isLoading } = useAutoSignUp();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={`/`}>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-gray-500 mr-4" />
              <span className="text-xl font-semibold text-gray-800">
                DocNest
              </span>
            </div>
          </Link>
          <div className="flex items-center">
            {isLoading ? (
              <span className="text-gray-500">Loading...</span>
            ) : user.id ? (
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-6 w-6 mr-2" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to={`/signin`}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <User className="h-6 w-6 mr-2" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
