import { Contest, defaulturl } from "@/utils/constants";
import axios from "axios";
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
  filterVideosByTitle :(title: string) => Video[];
  fetchYtSolutions : () => Promise<Video[] >;
  solutions : Video[];
  scheduleNotification : (contest : ContestProps) =>void;
  toggleNotification : (contest : ContestProps) =>void;
  isNotified:boolean | undefined;
  showSettings:boolean;
  setShowSettings:(value: boolean) => void;
  toggleNotificationForContest:(contest : ContestProps) =>boolean;
}


interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  uploadedAt: string;
}

// interface Playlists {
//   [key: string]: string;
// }
interface ContestProps {
  // contest: {
    id: number;
    event: string;
    start: string;
    end: string;
    duration: number; // in seconds
    host: string;
    href: string;
    resource: string;
    solution?:string;
    contestType: "live" | "upcoming" | "past";
  // };
}
// const playlists: Playlists = {
//   leetcode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
//   codechef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
//   codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
// };
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [bookmarkedContests, setBookmarkedContests] = useState<Contest[]>([]);
  const [solutions, setSolutions] = useState<Video[]>([]);
  const [showSettings, setShowSettings] = useState(false);
   const [isNotified, setIsNotified] = useState<boolean>();

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
    localStorage.removeItem("notifyBefore");
    localStorage.removeItem("notifications");
    setToken(null);
    setUser(null);
    setBookmarkedContests([]);
  };

  const fetchBookmarks = async () => {
    if(!token){
      return ;
    }
    try {
      const response = await fetch(`${defaulturl}api/user/bookmarks?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch bookmarks");

      const data = await response.json();
      setBookmarkedContests(data.contests);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const toggleBookmark = async (contest: Contest) => {
    if(!token){
      toast.error("You need to have an account to bookmark contests");
      return;
    }
    // console.log(contest , bookmarkedContests)
    const isBookmarked = bookmarkedContests?.some((b) => b.id === contest.id);

    try {
      const response = await fetch(`${defaulturl}api/user/bookmarks`, {
        method: isBookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: (user?.id), contestId: contest.id.toString() }),
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

  const playlists = {
    leetcode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
    codechef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
    codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
  };
  
  const fetchSolutionVideos = async (playlistId: string): Promise<Video[]> => {
    let allVideos: Video[] = [];
    let nextPageToken = "";
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    try {
      do {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
          params: {
            part: "snippet",
            maxResults: 50,
            playlistId,
            pageToken: nextPageToken,
            key: API_KEY,
          },
        });
  
        const videos: Video[] = response.data.items
          .filter((video: any) => video.snippet?.resourceId?.videoId)
          .map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails?.default?.url || "",
            url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
            uploadedAt: video.snippet.publishedAt,
          }));
  
        allVideos = [...allVideos, ...videos];
        nextPageToken = response.data.nextPageToken || "";
      } while (nextPageToken);
  
      return allVideos;
    } catch (error) {
      console.error(`❌ Error fetching videos for playlist ${playlistId}:`, error);
      return [];
    }
  };
  
  const fetchYtSolutions = async (): Promise<Video[] > => {
    let allVideos: Video[] = [];
    let platformList;
    platformList = Object.keys(playlists);
    console.log("YEs")

    for (const platform of platformList) {
      const videos = await fetchSolutionVideos((playlists as any)[platform]);
      allVideos = [...allVideos, ...videos];
    }
    setSolutions(allVideos);
    return allVideos;
  };
  
  const filterVideosByTitle = (title: string): Video[] => {
      const platform = title.split(" ")[0];
      const code = title.split(" ")[1];
      console.log(solutions)
      let filteredResults = solutions.filter((video) =>
        video.title.toLowerCase().includes(platform));
      filteredResults = filteredResults.filter((video)=>{
        return video.title.toLowerCase().includes(code)
      })
  
    // // Step 3: Further refine results by word-based filtering
    // filteredResults = filteredResults.filter((video) => {
    //   const sanitizedTitle = video.title.toLowerCase().replace(/[^a-z0-9\s]/gi, "");
    //   return searchWords.every(word => sanitizedTitle.includes(word));
    // });
   console.log(title , filteredResults)
    return filteredResults;
  };
  
 const toggleNotification = (contest:ContestProps) => {
    if (!localStorage.getItem("notifyBefore")) {
      setShowSettings(true); 
      return;
    }

    const notifications = JSON.parse(localStorage.getItem("notifications") || "{}");
    if (isNotified) {
      delete notifications[contest.id];
    } else {
      notifications[contest.id] = contest.start;
      scheduleNotification(contest);
    }
    localStorage.setItem("notifications", JSON.stringify(notifications));
    setIsNotified(!isNotified);
  };
    const scheduleNotification = (contest:ContestProps) => {
      if (!("Notification" in window)) return;
  
      const notifyBefore = parseInt(localStorage.getItem("notifyBefore") || "0", 10);
      if (!notifyBefore) {
        setShowSettings(true); // Show settings modal if no notifyBefore is set
        return;
      }
  
      const contestTime = new Date(contest.start).getTime();
      const notifyTime = contestTime - notifyBefore * 60 * 1000;
      const currentTime = new Date().getTime();
  
      if (notifyTime > currentTime) {
        setTimeout(() => {
          new Notification("Upcoming Contest!", {
            body: `Don't forget ${contest.event} is starting soon!`,
            icon: "/contest-icon.png",
          });
          toast.success(`Reminder set! You'll be notified ${notifyBefore} minutes before.`);
        }, notifyTime - currentTime);
      }
      console.log("Hello")
    };
 const toggleNotificationForContest = (contest:ContestProps) => {
  return JSON.parse(localStorage.getItem("notifications") || "{}")[contest.id] || false;
 }
//  const toggleBrowserNotifications = (contest:ContestProps) => {
//   if (Notification.permission !== "granted") {
//     Notification.requestPermission();
//   }
//   if(!JSON.parse(localStorage.getItem("notifyBefore") || "{}")){
//     localStorage.setItem("notifyBefore","10");
//     toast.success("Notifications enabled now you'll receive notifications prior to contest")
//   }else{
//     localStorage.removeItem("notifyBefore");
//   }
//  }
  
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
        filterVideosByTitle,
        fetchYtSolutions,
        solutions,
        scheduleNotification,
        toggleNotification,
        isNotified,
        showSettings,
        setShowSettings,
        toggleNotificationForContest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
