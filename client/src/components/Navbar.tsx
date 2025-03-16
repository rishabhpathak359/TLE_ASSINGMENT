import { Link, useNavigate } from "react-router-dom";
import { UserCircle, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // State to manage theme
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Apply saved theme on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 flex justify-between shadow-md">
      <div className="text-2xl font-bold">
        <Link to="/">TLE Eliminators</Link>
      </div>

      <div className="flex gap-4 items-center">
        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <UserCircle size={24} />
            <span>{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-hover-dark">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
