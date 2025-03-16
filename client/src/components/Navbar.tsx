import { Link, useNavigate } from "react-router-dom";
import { UserCircle, Sun, Moon, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Mobile Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Apply Saved Theme on Mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Logout Handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="text-2xl font-bold">
        <Link to="/">TLE Eliminators</Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-4 items-center">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
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
            <Link
              to="/login"
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-hover-dark"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-16 right-4 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-4 md:hidden">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            <span>Toggle Theme</span>
          </button>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <UserCircle size={24} />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-hover-dark text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
