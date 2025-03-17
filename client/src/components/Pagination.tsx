import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

interface PaginationProps {
  totalPages?: number;
  setPage: (value: number) => void;
  page?: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages = 1, setPage, page = 1 }) => {
  return (
    <div className="flex justify-between items-center mt-4">
      {/* Previous Button */}
      <Button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page <= 1}>
        <ChevronLeft size={16} /> Prev
      </Button>

      {/* Page Info */}
      <span>Page {page} / {totalPages}</span>

      {/* Next Button */}
      <Button onClick={() => setPage(Math.min(page + 1, totalPages))} disabled={page >= totalPages}>
        Next <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;
