import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import ContestTable from "@/components/ContestTable";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { defaulturl } from "@/utils/constants";
import SolutionModal from "@/components/SolutionModal";
import Pagination from "@/components/Pagination";
import UpcomingContestsCarousel from "@/components/UpcomingContestsCarousel";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

interface Contest {
  id: string;
  title: string;
  contestDateTime: string;
  duration: string;
  link: string;
  platform: string;
  solution?: string;
}

interface ContestsResponse {
  contests: Contest[];
  totalPages: number;
}

Modal.setAppElement("#root");

const ContestList = () => {
  const [page, setPage] = useState<number>(1);
  const [platforms, setPlatforms] = useState<string[]>(["all"]);
  const [selectedSolution, setSelectedSolution] = useState<string | undefined>(undefined);
  const limit: number = 10;
  const navigate = useNavigate();
  const fetchContests = async (type: "upcoming" | "past"): Promise<ContestsResponse> => {
    let url = `${defaulturl}api/contests/getContests?page=${page}&limit=${limit}&type=${type}&platforms=${platforms.join(",")}`;
    const { data } = await axios.get<ContestsResponse>(url);
    return data;
  };

  const { data: upcomingData } = useQuery<ContestsResponse>({
    queryKey: ["contests", "upcoming", page, platforms],
    queryFn: () => fetchContests("upcoming"),
    placeholderData: (previousData) => previousData ?? undefined,
  });

  const { data: pastData } = useQuery<ContestsResponse>({
    queryKey: ["contests", "past", page, platforms],
    queryFn: () => fetchContests("past"),
    placeholderData: (previousData) => previousData ?? undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [platforms]);

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => {
      if (platform === "all") return ["all"];
      return prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev.filter((p) => p !== "all"), platform];
    });
  };

  return (
    <div className="relative flex h-screen bg-background text-white">
      <div className=" fixed inset-0 md: md:dark:flex items-center justify-center pointer-events-none">
      <div className="absolute w-80 h-80 dark:block  bg-gray-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4"></div>
      <div className="absolute w-64 h-64 dark:block  bg-gray-500 opacity-20 blur-3xl rounded-full bottom-1/12 right-1/5"></div>

        {/* <div className="w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.3)_0%,rgba(0,0,0,0.8)_70%)] blur-[120px] rotate-[120deg]"></div> */}
      </div>

      <div className="max-w-5xl mx-auto p-4 mt-28">
      <div 
      className="flex items-center w-full md:w-2/3  bg-gray-200 dark:bg-background/40 border text-black dark:text-white px-4 py-3 rounded-full shadow-md cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 hover:bg-gray-300 "
      onClick={() => navigate("/contests/searchContests")}
    >
      <Search className="text-gray-600 dark:text-gray-400 mr-2" size={18} />
      <span className="text-gray-500 dark:text-gray-400">Search contests...</span>
    </div>
        {/* Filters Section */}
        <div className="flex md:flex-row flex-col md:gap-0 gap-5 justify-between items-center mb-6 mt-5">
          <div className="flex space-x-2">
            {["all", "LC", "CC", "CF"].map((p) => (
              <Button key={p} variant={platforms.includes(p) ? "default" : "outline"} className={`${platforms.includes(p) ?"text-white dark:text-black"  : "text-black dark:text-white"}`}  onClick={() => togglePlatform(p)}>
                {p === "all" ? "All Platforms" : p}
              </Button>
            ))}
          </div>
        </div>

        {/* Upcoming Contests - Cards Layout */}
        {upcomingData && upcomingData?.contests?.length > 0 && (
          <div className="mt-10 md:max-w-screen max-w-sm">
            <h2 className="md:text-xl font-bold mb-2 text-black dark:text-white">Upcoming Contests</h2>
            <UpcomingContestsCarousel setSelectedSolution={setSelectedSolution} data={upcomingData} />
          </div>
        )}

        {/* Past Contests - Table Layout */}
        {pastData && pastData?.contests?.length > 0 && (
          <div className="relative mt-10 pb-10  md:max-w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Past Contests</h2>
          <div className=" overflow-x-auto">
            <ContestTable contests={pastData.contests} isPast={true} type="past" />
          </div>
          <Pagination totalPages={pastData.totalPages || 1} setPage={setPage} page={page} />
        </div>
        
        )}

        {/* Solution Modal */}
        <SolutionModal selectedSolution={selectedSolution} setSelectedSolution={setSelectedSolution} />
      </div>
    </div>
  );
};

export default ContestList;


