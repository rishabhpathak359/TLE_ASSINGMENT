
import Modal from "react-modal";
import { Button } from "./ui/button";
import { X } from "lucide-react";
interface SolutionModalProps {
    selectedSolution: string | undefined;
    setSelectedSolution: (value: string | undefined) => void;
  }
const SolutionModal: React.FC<SolutionModalProps>  = ({selectedSolution , setSelectedSolution}) => {
  return (
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
  )
}

export default SolutionModal