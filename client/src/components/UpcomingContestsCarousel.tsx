import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion"; 
import { Button } from "@/components/ui/button";
import { BookmarkCheckIcon, BookmarkIcon } from "lucide-react";
import useAuth from "@/hooks/useAuth";

interface UpcomingContestsProps {
  data: any;
  setSelectedSolution: (value: string | undefined) => void;
}

interface Contest {
  id: string;
  title: string;
  contestDateTime: string;
  duration: string;
  link: string;
  platform: string;
  solution?: string;
}

const UpcomingContestsCarousel: React.FC<UpcomingContestsProps> = ({ data, setSelectedSolution }) => {
  const totalContests = data.contests.length;
  const maxSlides = 2; 
  const slidesToShow = Math.min(maxSlides, totalContests);
  const { bookmarkedContests, toggleBookmark } = useAuth();
  const sliderSettings = {
    dots: true,
    infinite: totalContests > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, totalContests) } },
      { breakpoint: 768, settings: { slidesToShow: 1, arrows: false, centerMode: true, centerPadding: "10px" } }, // Center single card on mobile
    ],
  };
  
  

  // Function to get time left in `dd hh:mm:ss` format
  const getTimeLeft = (contestDateTime: string) => {
    const now = new Date().getTime();
    const contestTime = new Date(contestDateTime).getTime();
    const timeDiff = contestTime - now;

    if (timeDiff <= 0) return "Contest Started";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // State to track countdown for each contest
  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>(() => {
    const initialCountdowns: { [key: string]: string } = {};
    data.contests.forEach((contest: Contest) => {
      initialCountdowns[contest.id] = getTimeLeft(contest.contestDateTime);
    });
    return initialCountdowns;
  });



  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(() => {
        const updatedCountdowns: { [key: string]: string } = {};
        data.contests.forEach((contest: Contest) => {
          updatedCountdowns[contest.id] = getTimeLeft(contest.contestDateTime);
        });
        return updatedCountdowns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data.contests]);

  return (
    <div className="relative w-full">
      <Slider {...sliderSettings} className="pb-5">
        {data.contests.map((contest: Contest) =>{ 
            const isBookmarked = bookmarkedContests.some((b) => b.id === contest.id);
            return (
          <motion.div
            key={contest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            <div className="relative bg-white/20 dark:bg-black/30 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/30 dark:border-black/50 transition-all hover:scale-105">
              
              {/* Bookmark Icon in Top Right */}
              <button 
                onClick={() => toggleBookmark(contest)}
              className="absolute top-3 right-3 hover:cursor-pointer">
              {isBookmarked ? <BookmarkCheckIcon size={18} /> : <BookmarkIcon size={18} />}
              </button>

              {/* Contest Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate w-[200px]">
                {contest.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400">Platform: {contest.platform}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date: {new Date(contest.contestDateTime).toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {contest.duration}</p>

              {/* Timer Display */}
              <p className="text-md font-medium text-red-500 dark:text-red-400 mt-2">
                Starts in: {countdowns[contest.id]}
              </p>
              
              <div className="mt-3 flex justify-between items-center">
                <a href={contest.link} target="_blank" className="text-blue-500 dark:text-blue-400 hover:underline">
                  Go to Contest
                </a>
                {contest.solution && (
                  <Button size="sm" onClick={() => setSelectedSolution(contest.solution)}>
                    View Solution
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )})}
      </Slider>
    </div>
  );
};

export default UpcomingContestsCarousel;
