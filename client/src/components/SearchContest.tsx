import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import ContestTable from "@/components/ContestTable";
import { defaulturl } from "@/utils/constants";

const SearchContest = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchContests(searchTerm);
      } else {
        setResults([]);
        setNoResults(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchContests = async (query: string) => {
    setLoading(true);
    setNoResults(false);

    try {
      const response = await fetch(
        `${defaulturl}api/contests/searchContest?query=${query}`
      );
      const data = await response.json();

      if (data.success && data.contests.length > 0) {
        setResults(data.contests);
      } else {
        setResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      setResults([]);
      setNoResults(true);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center w-full mt-28">
      <div className="hidden fixed inset-0 md:hidden md:dark:flex items-center justify-center pointer-events-none">
      <div className="absolute w-80 h-80 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4"></div>
      <div className="absolute w-64 h-64 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full bottom-1/4 right-1/4"></div>

        {/* <div className="w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.3)_0%,rgba(0,0,0,0.8)_70%)] blur-[120px] rotate-[120deg]"></div> */}
      </div>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search contests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex items-center w-full md:w-2/3  bg-gray-200 dark:bg-background/40 border text-black dark:text-white px-4 py-3 rounded-full shadow-md cursor-pointer transition-all duration-200 focus-within:ring-2  hover:bg-gray-300 "
        />

      {/* Loader */}
      {loading && (
        <div className="mt-2">
          <LoaderCircle className="animate-spin text-blue-500" size={24} />
        </div>
      )}

      {/* Search Results Dropdown */}
      {results.length > 0 && (
        <ul className="w-1/2 md:w-2/3 mt-2 text-white bg-background/40 backdrop-blur-lg border border-gray-700 rounded-md">
          {results.map((contest) => (
            <li
              key={(contest as any).id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-700"
              onClick={() => setSelectedContest(contest)}
            >
              {(contest as any).title}
            </li>
          ))}
        </ul>
      )}

      {/* No Results Message */}
      {noResults && !loading && (
        <p className="mt-2 text-red-500">No contests found.</p>
      )}

      {/* Render Selected Contest */}
      {selectedContest && <ContestTable contests={[selectedContest]} isPast={true} type="upcoming" />}
    </div>
  );
};

export default SearchContest;
