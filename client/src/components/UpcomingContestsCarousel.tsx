// import { useState, useEffect } from "react";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import { motion } from "framer-motion"; 
// import { Button } from "@/components/ui/button";
// import { BookmarkCheckIcon, BookmarkIcon, Calendar, Clock, ExternalLink } from "lucide-react";
// import useAuth from "@/hooks/useAuth";

interface UpcomingContestsProps {
  data: any;
  // setSelectedSolution: (value: string | undefined) => void;
}

interface Contest {
  // contest: {
    id: number;
    event: string;
    start: string;
    end: string;
    duration: number; // in seconds
    host: string;
    href: string;
    resource: string;
    contestType: "live" | "upcoming" | "past";
  // };
}

// const UpcomingContestsCarousel: React.FC<UpcomingContestsProps> = ({ data, setSelectedSolution }) => {
//   const totalContests = data.contests.length;
//   const maxSlides = 2; 
//   const slidesToShow = Math.min(maxSlides, totalContests);
//   const { bookmarkedContests, toggleBookmark } = useAuth();
//   const sliderSettings = {
//     dots: true,
//     infinite: totalContests > slidesToShow,
//     speed: 500,
//     slidesToShow: slidesToShow,
//     slidesToScroll: 1,
//     arrows: true,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     responsive: [
//       { breakpoint: 1024, settings: { slidesToShow: Math.min(2, totalContests) } },
//       { breakpoint: 768, settings: { slidesToShow: 1, arrows: false, centerMode: true, centerPadding: "10px" } }, // Center single card on mobile
//     ],
//   };
  
  

//   // Function to get time left in `dd hh:mm:ss` format
//   const getTimeLeft = (contestDateTime: string) => {
//     const now = new Date().getTime();
//     const contestTime = new Date(contestDateTime).getTime();
//     const timeDiff = contestTime - now;

//     if (timeDiff <= 0) return "Contest Started";

//     const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

//     return `${days}d ${hours}h ${minutes}m ${seconds}s`;
//   };

//   // State to track countdown for each contest
//   const [countdowns, setCountdowns] = useState<{ [key: string]: string }>(() => {
//     const initialCountdowns: { [key: string]: string } = {};
//     data.contests.forEach((contest: Contest) => {
//       initialCountdowns[contest.id] = getTimeLeft(contest.contestDateTime);
//     });
//     return initialCountdowns;
//   });



//   // Update countdown every second
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCountdowns(() => {
//         const updatedCountdowns: { [key: string]: string } = {};
//         data.contests.forEach((contest: Contest) => {
//           updatedCountdowns[contest.id] = getTimeLeft(contest.contestDateTime);
//         });
//         return updatedCountdowns;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [data.contests]);

//   return (
//     <div className="relative w-full grid grid-cols-3">
//         {data.contests.map((contest: Contest) =>{ 
//             const isBookmarked = bookmarkedContests.some((b) => b.id === contest.id);
//             return (
//           <motion.div
//             key={contest.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="p-4"
//           >
//             <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg border border-gray-200">
//       <div className="flex justify-between items-center mb-4  text-ellipsis">
//         <h2 className="text-lg font-semibold text-gray-800 max-w-[150px] ">{contest.title}</h2>
//         <div className="flex space-x-2">
//           <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-lg">{contest.platform}</span>
//           <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-lg">Past</span>
//         </div>
//       </div>
      
//       <div className="text-sm text-gray-600 flex items-center space-x-2 mb-3">
//         <Calendar size={16} />
//         <span>Start: {new Date(contest.contestDateTime).toLocaleString()}</span>
//       </div>
      
//       <div className="text-sm text-gray-600 flex items-center space-x-2 mb-4">
//         <Clock size={16} />
//         <span>Duration: {contest.duration} hr</span>
//       </div>
      
//       <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
//         <span className="text-gray-500 text-xs">Starts in</span>
//         <p className="text-lg font-bold text-gray-800">
//           {countdowns[contest.id]}
//         </p>
//       </div>
      
//       <div className="mt-4 flex justify-between items-center">
//         <button className="text-blue-600 text-sm flex items-center space-x-1 hover:underline">
//           <span>Visit</span>
//           <ExternalLink size={16} />
//         </button>
//       </div>
//     </div>
//           </motion.div>
//         )})}
//     </div>
//   );
// };

// export default UpcomingContestsCarousel;



import React, { useEffect, useState } from 'react'
import ContestCard from './ContestCard';
import useAuth from '@/hooks/useAuth';
import NotificationSettings from './NotificationSetting';

const ContestList: React.FC<UpcomingContestsProps> = ({ data }) => {
  const {fetchYtSolutions,setShowSettings,showSettings} = useAuth();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  useEffect(() => {
    if (data && data.length > 0) {
      setIsDataLoaded(true);
    }
  }, [data]);

  useEffect(() => {
    if (isDataLoaded && data[0]?.contestType === "past") {
      console.log("Yoy")
      fetchYtSolutions();
    }
  }, [isDataLoaded]);
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
       {showSettings && (
        <NotificationSettings
          onSave={() => {
            setShowSettings(false);
            // scheduleNotification();
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {data.map((contest:Contest) => (
        <ContestCard key={contest.id} contest={contest} />
        ))}
    </div>
  )
}

export default ContestList