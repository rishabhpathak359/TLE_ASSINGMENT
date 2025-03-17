import { Contest, defaulturl } from "@/utils/constants";
import { createContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-hot-toast";

interface User {
  name: string;
  email: string;
  id: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  bookmarkedContests: Contest[];
  toggleBookmark: (contest: Contest) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [bookmarkedContests, setBookmarkedContests] = useState<Contest[]>([]);

  useEffect(() => {
    if (token) {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    }
  }, [token]);

  useEffect(() => {
    if (user?.id) {
      fetchBookmarks();
    }
  }, [user?.id]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setBookmarkedContests([]);
  };

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`${defaulturl}api/user/bookmarks?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch bookmarks");

      const data = await response.json();
      setBookmarkedContests(data.bookmarks.map((bookmark: any) => bookmark.contest));
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const toggleBookmark = async (contest: Contest) => {
    const isBookmarked = bookmarkedContests?.some((b) => b.id === contest.id);

    try {
      const response = await fetch(`${defaulturl}api/user/bookmarks`, {
        method: isBookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, contestId: contest.id }),
      });

      if (!response.ok) throw new Error("Failed to update bookmark");

      setBookmarkedContests((prev) =>
        isBookmarked ? prev?.filter((b) => b.id !== contest.id) : [...prev, contest]
      );

      toast.success(isBookmarked ? "Bookmark removed!" : "Added to bookmarks!");
    } catch (error) {
      console.error("Error updating bookmark:", error);
      toast.error("Failed to update bookmark!");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        bookmarkedContests,
        toggleBookmark,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
