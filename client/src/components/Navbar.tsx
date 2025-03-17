import { Link } from "react-router-dom";
import { UserCircle, Sun, Moon, Menu, X, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import logo from "../assets/tle.png";

const Navbar = () => {
  const { user, isAuthenticated, logout, bookmarkedContests } = useAuth();
  // const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  

  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-lg z-50 bg-transparent text-gray-800 dark:text-gray-100 py-6 md:py-8 px-6 md:px-16 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="hidden md:block text-lg font-bold text-gray-800 dark:text-gray-100">
            TLE Eliminators
          </span>
        </Link>
      </div>

      {/* Mobile Icons: Bookmarks + Theme Toggle */}
      <div className="flex md:hidden items-center gap-4">
        {/* Bookmarks Button */}
        {isAuthenticated && (
          <Link to="/contests/bookmarks" className="relative">
            <Bookmark size={24} className="text-blue-600 dark:text-white" />
            {bookmarkedContests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {bookmarkedContests.length}
              </span>
            )}
          </Link>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-white"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Mobile Menu Button */}
        <button
          className="p-2 rounded-lg bg-gray-200 dark:bg-transparent hover:bg-gray-300 dark:hover:bg-transparent"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-5 items-center">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-white"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Bookmarks Button */}
        {isAuthenticated && (
          <Link to="/contests/bookmarks" className="relative">
            <Bookmark size={24} className="text-blue-600 dark:text-white" />
            {bookmarkedContests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {bookmarkedContests.length}
              </span>
            )}
          </Link>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <UserCircle size={24} />
            <span>{user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-background dark:hover:text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-transparent"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-lg hover:bg-gray-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Full-Screen Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed  min-h-screen inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-lg flex flex-col items-center justify-center gap-6 text-white dark:text-gray-100">
          <button
            className="absolute top-6 right-6 text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={32} />
          </button>

          {isAuthenticated ? (
            <>
              {/* <div className="text-2xl">{user?.name}</div> */}
              <button
                onClick={logout}
                className="px-6 py-3 border rounded-lg text-gray-300 hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-20 py-3 border rounded-lg text-gray-300 hover:border-white transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-20 py-3 bg-white text-black rounded-lg hover:bg-gray-300 transition"
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
