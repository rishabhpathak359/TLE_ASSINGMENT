import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Timer, Calendar, PlayCircle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";

// Define types for contest data
interface Contest {
  id: string;
  title: string;
  contestDateTime: string;
  duration: string;
  link: string;
  platform: string;
  solutionLink?: string; // Solution YouTube link for past contests
}

interface ContestsResponse {
  contests: Contest[];
  totalPages: number;
}

Modal.setAppElement("#root"); // Ensure accessibility

const ContestList = () => {
  const [page, setPage] = useState<number>(1);
  const [type, setType] = useState<"upcoming" | "past">("upcoming");
  const [platforms, setPlatforms] = useState<string[]>(["all"]);
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);
  const limit: number = 10;

  const fetchContests = async (): Promise<ContestsResponse> => {
    const { data } = await axios.get<ContestsResponse>(
      `http://localhost:5000/api/contests/getContests?page=${page}&limit=${limit}&type=${type}&platforms=${platforms.join(",")}`
    );
    return data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["contests", page, type, platforms],
    queryFn: fetchContests,
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [type, platforms]);

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev.filter((p) => p !== "all"), platform]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Filters Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Button variant={type === "upcoming" ? "default" : "outline"} onClick={() => setType("upcoming")}>
            Upcoming
          </Button>
          <Button variant={type === "past" ? "default" : "outline"} onClick={() => setType("past")}>
            Past
          </Button>
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
      {type === "upcoming" && data?.contests.length ? (
        <div className="bg-gray-100 p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-3">Upcoming Contests</h2>
          <div className="grid gap-4">
            {data?.contests.map((contest) => (
              <div
                key={contest.id}
                className="border rounded-lg p-4 shadow-md flex justify-between items-center hover:shadow-lg transition bg-white"
              >
                <div>
                  <h3 className="text-lg font-semibold">{contest.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={16} /> {new Date(contest.contestDateTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Timer size={16} /> {contest.duration}
                  </p>
                </div>
                <a href={contest.link} target="_blank" className="text-blue-500 hover:underline">
                  View Contest
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Past Contests Section */}
      {type === "past" && data?.contests.length ? (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Past Contests</h2>
          <div className="space-y-4">
            {data?.contests.map((contest) => (
              <div
                key={contest.id}
                className="border rounded-lg p-4 shadow-md flex justify-between items-center hover:shadow-lg transition"
              >
                <div>
                  <h3 className="text-lg font-semibold">{contest.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={16} /> {new Date(contest.contestDateTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Timer size={16} /> {contest.duration}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <a href={contest.link} target="_blank" className="text-blue-500 hover:underline">
                    View Contest
                  </a>
                  {contest.solution && (
                    <Button variant="outline" onClick={() => setSelectedSolution(contest.solution)}>
                      <PlayCircle size={16} className="mr-1" /> View Solution
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          <ChevronLeft size={16} /> Prev
        </Button>
        <span>Page {page} / {data?.totalPages || 1}</span>
        <Button onClick={() => setPage((prev) => prev + 1)} disabled={page >= (data?.totalPages || 1)}>
          Next <ChevronRight size={16} />
        </Button>
      </div>

      {/* Solution Modal */}
      <Modal
        isOpen={!!selectedSolution}
        onRequestClose={() => setSelectedSolution(null)}
        className="bg-white rounded-lg shadow-xl max-w-lg mx-auto p-4 relative"
        // overlayClassName="fixed inset-0  bg-opacity-50 flex items-center justify-center"
      >
        <button
          className="absolute top-2 right-2 p-1 text-gray-600 hover:text-black"
          onClick={() => setSelectedSolution(null)}
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
          <Button variant="outline" onClick={() => setSelectedSolution(null)}>Close</Button>
          <a href={selectedSolution} target="_blank" className="text-blue-500 hover:underline">
            Open in New Tab
          </a>
        </div>
      </Modal>
    </div>
  );
};

export default ContestList;
