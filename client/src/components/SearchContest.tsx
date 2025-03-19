import Pagination from '@/components/Pagination';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SolutionCard from '@/components/SolutionCard';
import { containerVariants, ContestsResponse, defaulturl, itemVariants } from '@/utils/constants';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import ContestCard from './ContestCard';

const SearchContest = () => {
  const [page, setPage] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["all"]);
  const [eventType, setEventType] = useState<string>("Upcoming");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isTyping, setIsTyping] = useState(false); // Track user typing

  // Debouncing effect: Update `debouncedQuery` after 500ms of inactivity
  useEffect(() => {
    if (query) setIsTyping(true); // User starts typing

    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsTyping(false); // Stop loading once debouncedQuery updates
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const fetchSolutions = async (page: number, searchQuery: string) => {
    const limit = 9;
   let url2 = `${defaulturl}api/contests/getContests?page=${page}&limit=${limit}&type=${eventType.toLowerCase()}&query=${query.toLowerCase()}&host=${selectedPlatforms.join(",")}`;
    const {data} = await axios.get<ContestsResponse>(url2);
    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['solutions', page, selectedPlatforms, debouncedQuery, eventType], // Runs when `debouncedQuery` changes
    queryFn: () => fetchSolutions(page, debouncedQuery),
    placeholderData: (previousData) => previousData ?? undefined,
    refetchOnWindowFocus: false,
  });

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
    <motion.div 
    className='mt-32 '>
      <div className="hidden fixed inset-0 md:hidden md:dark:flex items-center justify-center pointer-events-none">
        <div className="absolute w-80 h-80 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4"></div>
        <div className="absolute w-64 h-64 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full bottom-1/5 right-1/10"></div>

        {/* <div className="w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.3)_0%,rgba(0,0,0,0.8)_70%)] blur-[120px] rotate-[120deg]"></div> */}
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-2  md:px-36 px-8 ">
        {/* Search Bar with Debounced API Calls */}
        <div className="flex items-center w-full text-gray-400 border  px-4 py-2 rounded-md md:rounded-l-full shadow-md cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search solutions..."
            className="bg-transparent outline-none w-full text-black dark:text-white placeholder-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className='flex md:gap-0 gap-2'>
        {/* Platform Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button className="flex text-xs md:text-lg items-center justify-between  md:w-40 bg-background border text-black hover:bg-background cursor-pointer dark:text-white px-4 py-5 rounded-md md:rounded-none shadow-md">
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
                className="flex items-center px-4 py-2 cursor-pointer  text-black dark:text-white"
              >
                {selectedPlatforms.includes(p) && (
                  <Check size={16} className="mr-2 text-blue-400" />
                )}
                {p === "all" ? "All Platforms" : p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/*Contest Type DropDown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-between md:w-40 text-xs md:text-lg bg-background border text-black hover:bg-background cursor-pointer dark:text-white px-4 py-5 rounded-md md:rounded-r-full shadow-md">
              {eventType}
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-background text-white mt-2 rounded-md shadow-lg">
            {["Live", "Upcoming", "Past"].map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={eventType.includes(p)}
                onCheckedChange={() => setEventType(p)}
                className="flex items-center px-4 py-2 cursor-pointer text-black dark:text-white"
              >
                {eventType.includes(p) && (
                  <Check size={16} className="mr-2 text-blue-400" />
                )}
                { p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        
      </div>

      <div className='flex justify-center flex-col items-center px-5 md:px-10'>
        {/* Show Skeleton UI when user is typing */}
        {(isTyping || isLoading) && (
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

        {/* Show actual data */}
        {!isTyping && !isLoading && (
          <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-4 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 min-h-screen   ">
            {data ?.contests && data?.contests?.length > 0 ? (
              data.contests.map((contest: any) => (
                <motion.div key={contest.id} variants={itemVariants}>

                  <ContestCard key={contest.id} contest={contest} />
                </motion.div>
              ))
            ) : (
              <p>No Contests found.</p>
            )}
          </motion.div>
        )}

        <Pagination
          totalPages={data?.totalPages || 1}
          setPage={setPage}
          page={page}
        />
      </div>
    </motion.div>
  );
};

export default SearchContest;
