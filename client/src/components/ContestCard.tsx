import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Hourglass,
  BookmarkCheckIcon,
  BookmarkIcon,
  CalendarIcon,
  Bell,
  BellOff,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import leetcode from "../assets/leetcode.svg";
import codechefDark from "../assets/codechef.png";
import codeforces from "../assets/codeforces.svg";
// import toast from "react-hot-toast";
// import NotificationSettings from "./NotificationSetting";

interface ContestProps {
  contest: {
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
  };
}

const platformIcons: Record<string, string> = {
  "leetcode.com": leetcode,
  "codeforces.com": codeforces,
  "codechef.com": codechefDark,
};

const ContestCard: React.FC<ContestProps> = ({ contest }) => {
  const { bookmarkedContests, toggleBookmark, filterVideosByTitle, toggleNotification, notificationEnabled} = useAuth();
  // const [showSettings, setShowSettings] = useState(false);
  // const [isNotified, setIsNotified] = useState(
  //   JSON.parse(localStorage.getItem("notifications") || "{}")[contest.id] || false
  // );
  // console.log("SOlu",solutions)
  if(contest.contestType === "past"){
    const eventName = contest.event.split(" | ")[0]; 
    const words = eventName.split(" ");
    const contestNumber = words.find((word) => /^\d{2,}$/.test(word)); 
    if (contestNumber) {
      const platformName =contest.resource.split(".")[0];
      const searchQuery = `${platformName} ${contestNumber}`;

      // Find the best match
      const solution = filterVideosByTitle(searchQuery)[0]?.url;

      contest.solution = solution;
      console.log(searchQuery, solution);
    }
  }
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (contest.contestType !== "upcoming") return;

    const updateTimer = () => {
      const startTime = new Date(contest.start).getTime();
      const now = new Date().getTime();
      const diff = startTime - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest.start, contest.contestType]);

  const formatDateForGoogleCalendar = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const getGoogleCalendarLink = (contest: ContestProps["contest"]) => {
    const startDate = formatDateForGoogleCalendar(contest.start);
    const endDate = formatDateForGoogleCalendar(contest.end);
    const eventName = encodeURIComponent(contest.event);
    const eventDetails = encodeURIComponent(
      `Hosted by ${contest.host}. Visit: ${contest.href}`
    );

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventName}&dates=${startDate}/${endDate}&details=${eventDetails}&location=Online&sf=true&output=xml`;
  };
  // const scheduleNotification = () => {
  //   if (!("Notification" in window)) return;

  //   const notifyBefore = parseInt(localStorage.getItem("notifyBefore") || "0", 10);
  //   if (!notifyBefore) {
  //     setShowSettings(true); // Show settings modal if no notifyBefore is set
  //     return;
  //   }

  //   const contestTime = new Date(contest.start).getTime();
  //   const notifyTime = contestTime - notifyBefore * 60 * 1000;
  //   const currentTime = new Date().getTime();

  //   if (notifyTime > currentTime) {
  //     setTimeout(() => {
  //       new Notification("Upcoming Contest!", {
  //         body: `Don't forget ${contest.event} is starting soon!`,
  //         icon: "/contest-icon.png",
  //       });
  //       toast.success(`Reminder set! You'll be notified ${notifyBefore} minutes before.`);
  //     }, notifyTime - currentTime);
  //   }
  // };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // const toggleNotification = () => {
  //   if (!localStorage.getItem("notifyBefore")) {
  //     setShowSettings(true); 
  //     return;
  //   }

  //   const notifications = JSON.parse(localStorage.getItem("notifications") || "{}");
  //   if (isNotified) {
  //     delete notifications[contest.id];
  //   } else {
  //     notifications[contest.id] = contest.start;
  //     scheduleNotification();
  //   }
  //   localStorage.setItem("notifications", JSON.stringify(notifications));
  //   setIsNotified(!isNotified);
  // };

  const durationHours = Math.floor(contest.duration / 3600);
  const durationMinutes = Math.floor((contest.duration % 3600) / 60);
  const isBookmarked = bookmarkedContests.some((b: any) => b.id === contest.id);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-5 border rounded-lg shadow-md transition bg-white border-gray-300 text-black dark:bg-background dark:border-gray-700 dark:text-white"
    >
      <div className="flex items-center justify-between">
        {/* Fixed width for contest name with ellipsis for overflow */}
        <h2 className="text-lg font-semibold w-[250px] truncate">
          {contest.event}
        </h2>
        <div className="flex space-x-2">
          {/* <span
            className={`px-2 py-1 text-xs font-bold rounded ${
              contest.contestType === "upcoming"
                ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                : contest.contestType === "live"
                ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {contest.contestType}
          </span> */}
          {/* <Bookmark className="cursor-pointer hover:text-yellow-500" /> */}
          
          <button onClick={()=>toggleNotification(contest)} className="cursor-pointer">
        {notificationEnabled(contest) ? <Bell className="text-blue-500" /> : <BellOff className="text-gray-400" />}
      </button>
          <button
            onClick={() => toggleBookmark(contest as any)}
            className="p-2 rounded text-black dark:text-white dark:hover:text-white transition hover:cursor-pointer"
          >
            {isBookmarked ? (
              <BookmarkCheckIcon size={20} />
            ) : (
              <BookmarkIcon size={20} />
            )}
          </button>
          {platformIcons[contest.resource] && (
            <img
              src={platformIcons[contest.resource]}
              alt={contest.resource}
              className="w-6 h-6 mt-2"
            />
          )}
        </div>
      </div>

      <p className="text-sm mt-2">
        <strong>Start:</strong> {new Date(contest.start).toLocaleString()}
      </p>
      <p className="text-sm">
        <strong>Duration:</strong> {durationHours}h {durationMinutes}m
      </p>

      {/* Timer or Status */}
      <div className="mt-4 p-2 flex items-center space-x-4 border rounded-lg bg-gray-100 dark:bg-muted">
        {contest.contestType === "upcoming" ? (
          <>
            <Hourglass size={18} />
            <span className="font-mono text-lg">{timeLeft.days}d</span>
            <span className="font-mono text-lg">{timeLeft.hours}h</span>
            <span className="font-mono text-lg">{timeLeft.minutes}m</span>
            <span className="font-mono text-lg">{timeLeft.seconds}s</span>
          </>
        ) : contest.contestType === "live" ? (
          <span className="text-red-600 dark:text-red-400 font-bold animate-pulse">
            🔥 Live Now!
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-300 font-bold">
            ⏳ Contest Ended
          </span>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <a
          href={getGoogleCalendarLink(contest)}
          target="_blank"
          rel="noopener noreferrer"
          className=" flex items-center space-x-2 text-green-500 hover:underline"
        >
          <span>Add to Calendar</span>
          <CalendarIcon size={18} />
        </a>
        <div className="flex gap-5">

       {contest.solution && 
       <a
          href={contest.solution}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-500 hover:underline"
        >
          <span>Solution</span>
          <ExternalLink size={16} />
        </a>
         }
        <a
          href={contest.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-500 hover:underline"
        >
          <span>Visit</span>
          <ExternalLink size={16} />
        </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ContestCard;
