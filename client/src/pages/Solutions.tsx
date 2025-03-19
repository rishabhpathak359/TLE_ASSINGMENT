import Pagination from '@/components/Pagination';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SolutionCard from '@/components/SolutionCard';
import { containerVariants, defaulturl, itemVariants } from '@/utils/constants';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Solutions = () => {
  const [page, setPage] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["all"]);
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
    const response = await fetch(`${defaulturl}api/contests/solutions?page=${page}&limit=${limit}&host=${selectedPlatforms.join(",")}&query=${searchQuery}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch solutions');
    }
    
    return response.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['solutions', page, selectedPlatforms, debouncedQuery], // Runs when `debouncedQuery` changes
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
      <div className="flex flex-col md:flex-row md:items-center gap-4  md:px-24 px-5 ">
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

        {/* Platform Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-between w-40 bg-background border text-black hover:bg-background cursor-pointer dark:text-white px-4 py-5 rounded-md md:rounded-r-full shadow-md">
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
      </div>

      <div className='flex justify-center flex-col items-center px-5 md:px-20'>
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
          className="p-4 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 min-h-screen items-center justify-center ">
            {data?.videos?.length > 0 ? (
              data.videos.map((solution: any) => (
                <motion.div key={solution.id} variants={itemVariants}>

                  <SolutionCard key={solution.id} solution={solution} />
                </motion.div>
              ))
            ) : (
              <p>No solutions found.</p>
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

export default Solutions;
