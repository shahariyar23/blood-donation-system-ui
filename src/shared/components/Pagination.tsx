import { Icons } from "../icons/Icons";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl bg-[#1a1d24] px-4 py-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">

      {/* Showing X - Y of Z */}
      <p className="text-sm text-zinc-400">
        Showing{" "}
        <span className="font-semibold text-zinc-100">{startItem}–{endItem}</span>
        {" "}of{" "}
        <span className="font-semibold text-zinc-100">{totalItems}</span>
        {" "}results
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-2">

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
            ${currentPage === 1
              ? "cursor-not-allowed border border-white/10 text-zinc-600"
              : "border border-white/15 bg-white/5 text-zinc-200 hover:border-rose-400/60 hover:bg-rose-500/15 hover:text-white"
            }`}
          aria-label="Previous page"
        >
          <Icons.ArrowForward size={14} className="rotate-180" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-zinc-500 text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200
                ${currentPage === page
                  ? "bg-rose-500 text-white shadow-[0_10px_20px_rgba(244,63,94,0.35)] scale-105"
                  : "border border-white/15 bg-white/5 text-zinc-200 hover:border-rose-400/60 hover:bg-rose-500/15 hover:text-white"
                }`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
            ${currentPage === totalPages
              ? "cursor-not-allowed border border-white/10 text-zinc-600"
              : "border border-white/15 bg-white/5 text-zinc-200 hover:border-rose-400/60 hover:bg-rose-500/15 hover:text-white"
            }`}
          aria-label="Next page"
        >
          <Icons.ArrowForward size={14} />
        </button>

      </div>
    </div>
  );
};

export default Pagination;