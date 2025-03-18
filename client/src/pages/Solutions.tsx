import Pagination from '@/components/Pagination';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SolutionCard from '@/components/SolutionCard';
import { defaulturl } from '@/utils/constants';
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
    <>
      <div className="flex flex-wrap items-center gap-4 mt-32 md:px-24 px-5">
        {/* Search Bar with Debounced API Calls */}
        <div className="flex items-center w-full md:w-96 text-gray-400 border border-gray-700 px-4 py-2 rounded-md shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search contests..."
            className="bg-transparent outline-none w-full text-white placeholder-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Platform Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center justify-between w-40 bg-background border text-black hover:bg-background cursor-pointer dark:text-white px-4 rounded-md shadow-md">
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
        {isTyping && (
          <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="h-64 bg-gray-700 animate-pulse rounded-lg"
              ></motion.div>
            ))}
          </div>
        )}

        {/* Show actual data */}
        {!isTyping && !isLoading && (
          <div className="p-4 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 ">
            {data?.videos?.length > 0 ? (
              data.videos.map((solution: any) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))
            ) : (
              <p>No solutions found.</p>
            )}
          </div>
        )}

        <Pagination
          totalPages={data?.totalPages || 1}
          setPage={setPage}
          page={page}
        />
      </div>
    </>
  );
};

export default Solutions;
