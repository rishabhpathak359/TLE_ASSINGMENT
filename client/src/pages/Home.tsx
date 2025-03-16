import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import ContestTable from "@/components/ContestTable";
import useAuth from "@/hooks/useAuth";

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
  totalPages: string;
}

Modal.setAppElement("#root"); 

const ContestList = () => {
  const [page, setPage] = useState<number>(1);
  const [type, setType] = useState<"upcoming" | "past" | "bookmarks">("upcoming");
  const [platforms, setPlatforms] = useState<string[]>(["all"]);
  const [selectedSolution, setSelectedSolution] = useState<string | undefined>(undefined);
  const limit: number = 10;
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  const fetchContests = async (): Promise<ContestsResponse> => {
    let url1  = `https://tle-assingment.onrender.com/api/contests/getContests?page=${page}&limit=${limit}&type=${type}&platforms=${platforms.join(",")}`;
    let url2  =  `https://tle-assingment.onrender.com/api/user/bookmarks?userId=${userId}&platforms=${platforms.join(",")}`; 
    const { data } = await axios.get<ContestsResponse>(
     type === "bookmarks" ? url2 : url1
    );
    // console.log(data);
    return  data;
  };

  const { data } = useQuery<ContestsResponse>({
    queryKey: ["contests", page, type, platforms],
    queryFn: fetchContests,
    placeholderData: previousData => previousData ?? undefined
  });

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [type, platforms]);

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => {
      if (platform === "all") return ["all"];
      return prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev.filter((p) => p !== "all"), platform];
    });
  };

  // const totalPages = data?.totalPages ?? 1;
  // const someValue: string | undefined = someNullableValue ?? undefined;


  

  return (
    <div className="max-w-4xl mx-auto p-4 mt-20">
      {/* Filters Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Button variant={type === "upcoming" ? "default" : "outline"} onClick={() => setType("upcoming")}>
            Upcoming
          </Button>
          <Button variant={type === "past" ? "default" : "outline"} onClick={() => setType("past")}>
            Past
          </Button>
          { isAuthenticated &&
            <Button variant={type === "bookmarks" ? "default" : "outline"} onClick={() => setType("bookmarks")}>
            Bookmarks
          </Button>
          }
        </div>
        <div className="flex space-x-2">
          {["all", "LC", "CC", "CF"].map((p) => (
            <Button
              key={p}
              variant={platforms.includes(p) ? "default" : "outline"}
              onClick={() => togglePlatform(p)}
            >
              {p === "all" ? "All Platforms" : p}
            </Button>
          ))}
        </div>
      </div>

      {/* Upcoming Contests Section */}
      {type === "upcoming" && 
      (data as any)?.contests?.length ? 
      (
           <ContestTable contests={(data as any)?.contests} isPast={false} type={type} />
      ) 
      : null
      }

      {/* Past Contests Section */}
      {type === "past" && 
      (data as any)?.contests.length ? 
      (

        <ContestTable contests={(data as any)?.contests} isPast={true}  type={type}/>
      ) 
      : null}

      {
        type === "bookmarks" &&
        (data as any)?.bookmarks?.length ? (
          <ContestTable contests={data as any} isPast={true} type={type} />
        ) : null
      }

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          <ChevronLeft size={16} /> Prev
        </Button>
        <span>Page {page} / {(data as any)?.totalPages || 1}</span>
        <Button onClick={() => setPage((prev) => prev + 1)} disabled={page >= ((data as any)?.totalPages || 1)}>
          Next <ChevronRight size={16} />
        </Button>
      </div>

      {/* Solution Modal */}
      <Modal
        isOpen={!!selectedSolution}
        onRequestClose={() => setSelectedSolution(undefined)}
        className="bg-white rounded-lg shadow-xl max-w-lg mx-auto p-4 relative"
        // overlayClassName="fixed inset-0  bg-opacity-50 flex items-center justify-center"
      >
        <button
          className="absolute top-2 right-2 p-1 text-gray-600 hover:text-black"
          onClick={() => setSelectedSolution(undefined)}
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-3">Solution Video</h2>
        <iframe
          src={selectedSolution}
          className="w-full h-64 rounded-lg"
          allowFullScreen
        />
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setSelectedSolution(undefined)}>Close</Button>
          <a href={selectedSolution} target="_blank" className="text-blue-500 hover:underline">
            Open in New Tab
          </a>
        </div>
      </Modal>
    </div>
  );
};

export default ContestList;
