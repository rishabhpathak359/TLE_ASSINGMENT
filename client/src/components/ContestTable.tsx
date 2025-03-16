import useAuth from "@/hooks/useAuth";
import { Bookmark, BookMarked, Edit } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

interface Contest {
  id: string;
  title: string;
  contestDateTime: string;
  link: string;
  duration: string;
  solution?: string;
  platform: string;
}

interface ContestTableProps {
  contests: Contest[];
  isPast: boolean;
  type: string;
}

const ContestTable: React.FC<ContestTableProps> = ({ contests, isPast, type }) => {
  // const displayedContests = type === "bookmarks" ? contests = (contests as any).bookmarks.map((bookmark: any) => bookmark.contest) : contests;
  const [bookmarkedContests, setBookmarkedContests] = useState<Contest[]>([]);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const isAdmin = user?.type === "ADMIN"; // Check if user is an admin

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentContest, setCurrentContest] = useState<Contest | null>(null);
  const [newSolution, setNewSolution] = useState("");
  useEffect(() => {
    setNewDisplayedContests(type === "bookmarks" ? bookmarkedContests : contests);
  }, [type, bookmarkedContests, contests]);
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const fetchBookmarks = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/bookmarks?userId=${userId}`);
        const data = await response.json();
        setBookmarkedContests(data.bookmarks.map((bookmark: any) => bookmark.contest));
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    fetchBookmarks();
  }, [userId, isAuthenticated]);

  const toggleBookmark = async (contest: Contest) => {
    if (!isAuthenticated) {
      toast.error("You need to log in to bookmark contests.");
      navigate("/login");
      return;
    }

    const isBookmarked = bookmarkedContests?.some((b) => b.id === contest.id);

    try {
      const response = await fetch("http://localhost:5000/api/user/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, contestId: contest.id }),
      });

      if (!response.ok) throw new Error("Failed to update bookmark");

      setBookmarkedContests((prev) =>
        isBookmarked ? prev?.filter((b) => b.id !== contest.id) : [...prev, contest]
      );
      toast.success(isBookmarked ? "Bookmark removed!" : "Added to bookmarks!");
    } catch (error) {
      console.error("Error updating bookmark:", error);
      toast.error("Failed to update bookmark!");
    }
  };

  const openModal = (contest: Contest) => {
    setCurrentContest(contest);
    setNewSolution(contest.solution || "");
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentContest(null);
  };

  const updateSolution = async () => {
    if (!currentContest) return;

    try {
      const response = await fetch(`http://localhost:5000/api/contests/updateSolution/${currentContest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solution: newSolution }),
      });

      if (!response.ok) throw new Error("Failed to update solution");

      toast.success("Solution updated successfully!");

      // Update contest data locally
      const updatedContests = contests.map((contest) =>
        contest.id === currentContest.id ? { ...contest, solution: newSolution } : contest
      );
      setNewDisplayedContests(updatedContests);

      // Close the modal
      closeModal();
    } catch (error) {
      console.error("Error updating solution:", error);
      toast.error("Failed to update solution!");
    }
  };
//   const newDisplayedContests = type === "bookmarks" ? bookmarkedContests : contests;
  const [newDisplayedContests,setNewDisplayedContests] = useState(type === "bookmarks" ? bookmarkedContests : contests);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-800 text-left">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Date</th>
            {!isPast && <th className="p-3 border">Starts In</th>}
            <th className="p-3 border">Duration</th>
            <th className="p-3 border">Solution</th>
            <th className="p-3 border">Platform</th>
            <th className="p-3 border">Bookmark</th>
            {isAdmin && <th className="p-3 border">Edit Solution</th>}
          </tr>
        </thead>
        <tbody>
          {newDisplayedContests?.map((contest: Contest) => (
            <tr key={contest.id} className="border hover:bg-gray-100 dark:hover:bg-gray-900">
              <td className="p-3 border text-blue-600 underline">
                <a href={contest.link} target="_blank" rel="noopener noreferrer">
                  {contest.title}
                </a>
              </td>
              <td className="p-3 border">{new Date(contest.contestDateTime).toLocaleString()}</td>
              {!isPast && (
                <td className="p-3 border">
                  <CountdownTimer startTime={contest.contestDateTime} />
                </td>
              )}
              <td className="p-3 border">{contest.duration}</td>
              <td className="p-3 border text-blue-600 underline">
                {isPast ? (
                  <a href={contest.solution} target="_blank" rel="noopener noreferrer">
                    View Solution
                  </a>
                ) : (
                  <p>Not yet</p>
                )}
              </td>
              <td className="p-3 border">{contest.platform}</td>
              <td className="p-3 border">
                <button
                  className={`px-3 py-1 rounded-md ${
                    bookmarkedContests?.some((b) => b.id === contest.id)
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                  onClick={() => toggleBookmark(contest)}
                >
                  {bookmarkedContests?.some((b) => b.id === contest.id) ? <BookMarked /> : <Bookmark />}
                </button>
              </td>
              {isAdmin && (
                <td className="p-3 border">
                  <button className="px-3 py-1 bg-green-500 text-white rounded-md hover:cursor-pointer" onClick={() => openModal(contest)}>
                    <Edit />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Solution Edit Modal */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg w-1/3 mx-auto mt-20">
        <h2 className="text-xl font-bold mb-4">Edit Solution</h2>
        <p className="mb-2">Existing Solution: {currentContest?.solution || "Not Available"}</p>
        <input type="text" className="border p-2 w-full mb-4" value={newSolution} onChange={(e) => setNewSolution(e.target.value)} />
        <div className="flex justify-end space-x-2">
          <button className="px-3 py-1 bg-gray-500 text-white rounded-md hover:cursor-pointer" onClick={closeModal}>Cancel</button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:cursor-pointer" onClick={updateSolution}>Update</button>
        </div>
      </Modal>
    </div>
  );
};

const CountdownTimer: React.FC<{ startTime: string }> = ({ startTime }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");
  
    useEffect(() => {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const startTimeMs = new Date(startTime).getTime();
        const diff = startTimeMs - now;
  
        if (diff <= 0) {
          setTimeLeft("Started!");
          return;
        }
  
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
  
        setTimeLeft(
          days > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : `${hours}h ${minutes}m ${seconds}s`
        );
      };
  
      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
  
      return () => clearInterval(timer);
    }, [startTime]);
  
    return <span className="text-red-600 font-semibold">{timeLeft}</span>;
  };
  

export default ContestTable;
