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
  const { bookmarkedContests, toggleBookmark, filterVideosByTitle, toggleNotification, toggleNotificationForContest} = useAuth();
  // const [showSettings, setShowSettings] = useState(false);
  // const [isNotified, setIsNotified] = useState(
  //   JSON.parse(localStorage.getItem("notifications") || "{}")[contest.id] || false
  // );
  // console.log("SOlu",solutions)
  let solution;
  if(contest.contestType === "past"){
    const eventName = contest.event.split(" | ")[0]; 
    const words = eventName.split(" ");
    const contestNumber = words.find((word) => /^\d{2,}$/.test(word)); 
    // const mutableContest = { ...contest };
    if (contestNumber) {
      const platformName =contest.resource.split(".")[0];
      const searchQuery = `${platformName} ${contestNumber}`;

      // Find the best match
      const solutionF = filterVideosByTitle(searchQuery)[0]?.url;

      solution = solutionF;
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
      const startTimeIST = getISTTime(contest.start).getTime(); // Get IST time
      const nowIST = new Date().getTime(); // Get current IST time
      const diff = startTimeIST - nowIST;
  
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

  // const formatDateForGoogleCalendar = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toISOString().replace(/-|:|\.\d+/g, "");
  // };

  const getGoogleCalendarLink = (contest: ContestProps["contest"]) => {
    const startIST = getISTTime(contest.start);
    const endIST = getISTTime(contest.end);
    const startDate = startIST.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
    const endDate = endIST.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
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
  const getISTTime = (utcDateString: string) => {
    const utcDate = new Date(utcDateString);
    return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)); // Convert UTC to IST
  };
  const durationHours = Math.floor(contest.duration / 3600);
  const durationMinutes = Math.floor((contest.duration % 3600) / 60);
  const isBookmarked = bookmarkedContests.some((b: any) => b.id === contest.id);

  return (
    <motion.div
    // initial={{ opacity: 0, y: 50, scale: 0.9 }}
    // animate={{ opacity: 1, y: 0, scale: 1 }}
    // exit={{ opacity: 0, y: 50, scale: 0.9 }}
    // transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="p-5 border rounded-lg shadow-md transition bg-white border-gray-300 text-black dark:bg-background dark:border-gray-700 dark:text-white"
    >
      <div className="flex items-center justify-between">
        {/* Fixed width for contest name with ellipsis for overflow */}
        <h2 className="text-lg font-semibold w-[250px] truncate">
          {contest.event}
        </h2>
        <div className="flex space-x-2">
          <button onClick={()=>toggleNotification(contest)} className="cursor-pointer">
        {toggleNotificationForContest(contest) ? <Bell className="text-blue-500" /> : <BellOff className="text-gray-400" />}
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
        <strong>Start:</strong> {getISTTime(contest.start).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
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
        {contest.contestType === "upcoming" ?
        <a
          href={getGoogleCalendarLink(contest)}
          target="_blank"
          rel="noopener noreferrer"
          className=" flex items-center space-x-2 text-green-500 hover:underline"
        >
          <span>Add to Calendar</span>
          <CalendarIcon size={18} />
        </a>
        :

        solution && 
        <a
           href={solution}
           target="_blank"
           rel="noopener noreferrer"
           className="flex items-center space-x-1 text-blue-500 hover:underline"
         >
           <span>Solution</span>
           <ExternalLink size={16} />
         </a>
          
        
      }
        {/* <div className="flex gap-5"> */}

        <a
          href={contest.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-500 hover:underline"
        >
          <span>Visit</span>
          <ExternalLink size={16} />
        </a>
        {/* </div> */}
      </div>
    </motion.div>
  );
};

export default ContestCard;
