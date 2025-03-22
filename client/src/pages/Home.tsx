import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import { defaulturl } from "@/utils/constants";
import SolutionModal from "@/components/SolutionModal";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Check, Frown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@/components/Pagination";
import ContestList from "@/components/UpcomingContestsCarousel";
import { motion } from "framer-motion";
import Calendar from "@/components/Calendar";

interface Contest {
  id: number;
  event: string;
  start: string;
  end: string;
  duration: number; // in seconds
  problems:Array<any>;
  host: string;
  href: string;
  resource: string;
  contestType: "live" | "upcoming" | "past";
}

interface ContestsResponse {
  contests: Contest[];
  totalPages: number;
}

// const contestMapping = {
//   LC: "Leetcode",
//   CC: "Codechef",
//   CF: "Codeforces",
// };
const contestTypeHeadings = {
  upcoming: "Upcoming Contests",
  live: "Live Contests",
  past: "Past Contests",
  calendar: "",
};

Modal.setAppElement("#root");

const Home = () => {
  const [page, setPage] = useState<number>(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["all"]);
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "live" | "calendar"
  >("upcoming");
  const [selectedSolution, setSelectedSolution] = useState<string | undefined>(
    undefined
  );
  const [isDelayedLoading, setIsDelayedLoading] = useState(true);

  useEffect(() => {
    setIsDelayedLoading(true);
    const timer = setTimeout(() => {
      setIsDelayedLoading(false);
    }, 1000); // 1-second delay to show skeleton UI

    return () => clearTimeout(timer);
  }, [activeTab, selectedPlatforms, page]);

  const navigate = useNavigate();
  const limit: number = 9;

  const fetchContests =
    useCallback(async (): Promise<ContestsResponse | null> => {
      // let url1 = `${defaulturl}api/contests/getContests?page=${page}&limit=${activeTab === "calendar" ? 25:limit}&category=${activeTab==="calendar" ? "calendar" : "api"}&type=${
      //   activeTab === "calendar" ? "all" : "past"
      // }&host=${selectedPlatforms.join(",")}`;
      // let url2 = `${defaulturl}api/contests/getContests?page=${page}&limit=10&query=""&host=${selectedPlatforms.join(",")}`;
      const url = `${defaulturl}api/contests/getContests?page=${page}&limit=${activeTab === "calendar" ? 25:limit}&category=${activeTab==="calendar" ? "calendar" : "api"}&type=${
        activeTab === "calendar" ? "all" : activeTab
      }&host=${selectedPlatforms.join(",")}`;
      const { data } = await axios.get<ContestsResponse>(url);
      return data;
    }, [page, activeTab, selectedPlatforms]);

  const { data: contestData, isLoading } = useQuery<ContestsResponse | null>({
    queryKey: ["contests", activeTab, page, selectedPlatforms],
    queryFn: fetchContests,
    placeholderData: (previousData) => previousData ?? undefined,
    enabled: !isDelayedLoading,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setPage(1);
  }, [selectedPlatforms, activeTab]);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (platform === "all") return ["all"];
      const updated = prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev.filter((p) => p !== "all"), platform];
      return updated.length === 0 ? ["all"] : updated;
    });
  };

  return (
    <div className="relative flex flex-col items-start min-h-screen bg-background text-white px-6 md:px-12 lg:px-24 mt-20 md:mt-28">
       <div className="hidden fixed inset-0 md:hidden md:dark:flex items-center justify-center pointer-events-none">
        <div className="absolute w-80 h-80 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4"></div>
        <div className="absolute w-64 h-64 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full bottom-1/5 right-1/10"></div>

        {/* <div className="w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.3)_0%,rgba(0,0,0,0.8)_70%)] blur-[120px] rotate-[120deg]"></div> */}
      </div>
      <motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="flex gap-2 bg-gray-100 dark:bg-muted rounded-lg p-1 mt-6"
>
  {["Upcoming", "Live", "Past", "Calendar"].map((tab) => (
    <motion.button
      key={tab}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-3 md:px-6 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
        activeTab.toLowerCase() === tab.toLowerCase()
          ? "dark:bg-black dark:text-white text-black bg-white"
          : "text-gray-400 dark:text-gray-300 hover:cursor-pointer"
      }`}
      onClick={() => setActiveTab(tab.toLowerCase() as "upcoming" | "past")}
    >
      {tab}
    </motion.button>
  ))}
</motion.div>


      {/* Search Bar & Platform Filter */}
      <div
        className={` flex flex-col md:flex-row  md:items-center gap-4 md:gap-1 mt-6 w-full`}
      >
        {/* Search Bar */}
        <motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="flex items-center w-full text-gray-400 border px-4 py-2 rounded-md md:rounded-l-full shadow-md cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500"
  onClick={() => navigate("/contests/searchContests")}
>
  <Search className="text-gray-400 mr-2" size={18} />
  <span>Search contests...</span>
</motion.div>


        {/* Platform Dropdown */}
       {
      //  activeTab!=="calendar" &&

        (
          <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
        <DropdownMenu >
          <DropdownMenuTrigger asChild>
            <Button className={`flex items-center justify-between w-40 bg-background border text-black hover:bg-background cursor-pointer dark:text-white px-4 py-5 rounded-md ${activeTab !=="calendar" && "md:rounded-r-full"} shadow-md`}>
              {selectedPlatforms.includes("all")
                ? "Platform"
                : selectedPlatforms.length > 1
                ? `${selectedPlatforms.length} selected`
                : selectedPlatforms.join(", ")}
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-background text-white mt-2 rounded-md shadow-lg">
            {["all", "leetcode", "codechef", "codeforces"].map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={selectedPlatforms.includes(p)}
                onCheckedChange={() => handlePlatformChange(p)}
                className="flex items-center px-4 py-2 cursor-pointer text-black dark:text-white"
              >
                {selectedPlatforms.includes(p) && (
                  <Check size={16} className="mr-2 text-blue-400" />
                )}
                {p === "all" ? "All Platforms" : p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </motion.div>
        )}
      </div>

      {/* Loading State (Skeleton UI) */}
      {activeTab !== "calendar" && isLoading && (
        <div className="mt-10 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="h-64 bg-gray-300 dark:bg-muted animate-pulse rounded-lg"
            ></motion.div>
          ))}
        </div>
      )}

      {/* No Contests Available */}
      {!isLoading && contestData?.contests?.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mt-16 text-center"
        >
          <Frown size={40} className="text-gray-400" />
          <p className="text-lg text-gray-400 mt-2">
            No contests available at the moment.
          </p>
        </motion.div>
      )}

      {/* Contests Display */}
      {!isLoading &&
        contestData &&
        activeTab !== "calendar" &&
        contestData?.contests?.length > 0 && (
          <div className="mt-10 w-full">
            <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
              {contestTypeHeadings[activeTab]}
            </h2>
            <ContestList data={contestData.contests} />
            <Pagination
              totalPages={contestData.totalPages || 1}
              setPage={setPage}
              page={page}
            />
          </div>
        )}
      {activeTab === "calendar" && (
        <div className="w-full mt-10">
          <Calendar contests={contestData?.contests} />
        </div>
      )}
      {/* Solution Modal */}
      <SolutionModal
        selectedSolution={selectedSolution}
        setSelectedSolution={setSelectedSolution}
      />
    </div>
  );
};

export default Home;
