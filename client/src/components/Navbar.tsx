import { Link } from "react-router-dom";
import { UserCircle, Sun, Moon, Menu, X, Bookmark, Youtube, Code2, LogIn, LogOut, UserPlus, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import logo from "../assets/tle.png";

const Navbar = () => {
  const { user, isAuthenticated, logout, bookmarkedContests, setShowSettings } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav className="fixed top-0 left-0 w-full  z-50 bg-background/40 backdrop-blur-lg text-gray-800 dark:text-gray-100 py-4 px-2 md:px-3 lg:px-16 flex justify-between items-center shadow-md">
      {/* Logo */}
      {/* <div className="absolute w-full backdrop-blur-lg"></div> */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="hidden lg:block text-lg font-bold text-gray-800 dark:text-gray-100">
            TLE Eliminators
          </span>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="hidden md:flex gap-6 items-center md:text-sm text-xs">
        {/* {isAuthenticated && ( */}
          <>
            <Link to="/contests" className="relative flex items-center gap-2">
              <Code2 size={24} className="text-blue-600 dark:text-white" />
              <span>Contests</span>
            </Link>
            <Link to="/contests/solutions" className="relative flex items-center gap-2">
              <Youtube size={24} className="text-blue-600 dark:text-white" />
              <span>Solutions</span>
            </Link>
            <Link to="/contests/bookmarks" className="relative flex items-center gap-2">
              <Bookmark size={24} className="text-blue-600 dark:text-white" />
              {bookmarkedContests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {bookmarkedContests.length}
                </span>
              )}
              <span>Bookmarks</span>
            </Link>
          </>
        {/* // )} */}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-white"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Auth Buttons */}
        {isAuthenticated ? (
          <div className="relative">
          <button
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-muted p-2 rounded-md"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <UserCircle size={24} />
            <span>{user?.name}</span>
            {isDropdownOpen ?<ChevronUp size={18}/> :<ChevronDown size={18} />}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/80  dark:bg-background/80 shadow-md border  rounded-md py-2 backdrop-blur-lg">
                <button
                 onClick={()=>
                  {
                    setShowSettings(true);
                    setIsDropdownOpen(false);
                  }}
                className="block w-full text-left px-4 cursor-pointer py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-muted "
              >
                <Settings size={18} className="inline mr-2" /> Settings
              </button>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-muted cursor-pointer"
              >
                <LogOut size={18} className="inline mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200   flex items-center gap-2"
            >
              <LogIn size={18} />
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <UserPlus size={18} />
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-white"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Mobile Menu Button */}
        <button
          className="p-2 rounded-lg bg-gray-200 dark:bg-transparent hover:bg-gray-300 dark:hover:bg-transparent"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Collapsible Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full border-b bg-background/80 backdrop-blur-lg  text-gray-900 dark:text-gray-100 shadow-lg py-4 flex flex-col gap-4 md:hidden">
          {/* {isAuthenticated && ( */}
            <>
              <Link to="/contests" className="px-6 py-3 flex items-center gap-2 border-b">
                <Code2 size={20} className="text-blue-600 dark:text-white" />
                <span>Contests</span>
              </Link>
              <Link to="/contests/solutions" className="px-6 py-3 flex items-center gap-2 border-b">
                <Youtube size={20} className="text-blue-600 dark:text-white" />
                <span>Solutions</span>
              </Link>
              <Link to="/contests/bookmarks" className="px-6 py-3 flex items-center gap-2 border-b">
                <Bookmark size={20} className="text-blue-600 dark:text-white" />
                {bookmarkedContests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {bookmarkedContests.length}
                  </span>
                )}
                <span>Bookmarks</span>
              </Link>
            </>
          {/* )} */}

          {isAuthenticated ? (
            <>
            <button
              onClick={()=>
                {
                  setShowSettings(true);
                  setIsDropdownOpen(false);
                  setIsMenuOpen(false)
                }}
              className="px-6 py-3 flex items-center gap-2 border rounded-md mx-2 text-gray-700 dark:text-gray-200  border-t"
            >
              <Settings size={18} />
              Settings
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 flex items-center gap-2 border rounded-md mx-2 text-gray-700 dark:text-gray-200  border-t"
            >
              <LogOut size={18} />
              Logout
            </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-3 flex items-center gap-2 border rounded-md mx-2 hover:bg-gray-100 "
              >
                <LogIn size={18} />
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 flex items-center gap-2 border rounded-md mx-2 bg-gray-100 dark:text-black hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <UserPlus size={18} />
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
