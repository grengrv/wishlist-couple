import { memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Tạo mảng các page numbers có ellipsis.
 * Luôn hiển thị: trang 1, trang cuối, và 2 trang xung quanh trang hiện tại.
 * @param {number} current
 * @param {number} total
 * @returns {(number|'...')[]}
 */
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2; // số trang xung quanh current
  const range = [];
  const rangeSet = new Set();

  // Always include first and last
  [1, total].forEach((p) => rangeSet.add(p));

  // Pages around current
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    rangeSet.add(i);
  }

  const sorted = [...rangeSet].sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    range.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      range.push("...");
    }
  }

  return range;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 mt-8 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-9 h-9 rounded-xl bg-bg-secondary/60 border border-border-primary/30" />
      ))}
    </div>
  );
}

// ── Nav Button ───────────────────────────────────────────────────────────────

const NavButton = memo(function NavButton({ onClick, disabled, children, label }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-[14px] text-[12px] font-black
        uppercase tracking-wider transition-all duration-300 select-none
        ${disabled
          ? "opacity-30 cursor-not-allowed text-text-muted bg-bg-secondary/40 border border-border-primary/30"
          : "text-text-primary bg-bg-secondary/80 border border-border-primary/60 hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
        }
      `}
    >
      {children}
    </motion.button>
  );
});

// ── Page Button ───────────────────────────────────────────────────────────────

const PageButton = memo(function PageButton({ page, isCurrent, onClick }) {
  return (
    <motion.button
      key={page}
      whileHover={isCurrent ? {} : { scale: 1.1, y: -2 }}
      whileTap={isCurrent ? {} : { scale: 0.92 }}
      onClick={() => !isCurrent && onClick(page)}
      aria-label={`Trang ${page}`}
      aria-current={isCurrent ? "page" : undefined}
      className={`
        w-9 h-9 rounded-[12px] text-[13px] font-black transition-all duration-300 select-none
        ${isCurrent
          ? "bg-pink-500 text-white shadow-[0_4px_16px_rgba(236,72,153,0.4)] scale-110 cursor-default"
          : "text-text-primary bg-bg-secondary/80 border border-border-primary/50 hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:shadow-[0_4px_12px_rgba(236,72,153,0.25)]"
        }
      `}
    >
      {page}
    </motion.button>
  );
});

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * WishlistPagination - Component điều hướng phân trang
 *
 * @param {number} currentPage - Trang hiện tại (1-indexed)
 * @param {number} totalPages - Tổng số trang
 * @param {number} totalCount - Tổng số item
 * @param {boolean} isLoading - Đang fetch
 * @param {Function} goToPage - Callback chuyển trang
 * @param {Function} goNext - Callback sang trang kế
 * @param {Function} goPrev - Callback về trang trước
 */
const WishlistPagination = memo(function WishlistPagination({
  currentPage,
  totalPages,
  totalCount,
  isLoading,
  goToPage,
  goNext,
  goPrev,
}) {
  const pageRange = useMemo(
    () => buildPageRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePage = useCallback((p) => {
    if (typeof p === "number") goToPage(p);
  }, [goToPage]);

  if (isLoading) return <PaginationSkeleton />;
  if (totalPages <= 1) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        key={currentPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        aria-label="Phân trang wishlist"
        className="flex flex-col items-center gap-3 mt-10 mb-4 select-none"
      >
        {/* Info text */}
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-[1.5px]">
          Trang {currentPage} / {totalPages}
          {totalCount > 0 && (
            <span className="ml-2 opacity-60">· {totalCount} items</span>
          )}
        </p>

        {/* ── Mobile: compact mode ── */}
        <div className="flex sm:hidden items-center gap-3">
          <NavButton
            onClick={goPrev}
            disabled={currentPage === 1}
            label="Trang trước"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Prev
          </NavButton>

          <div className="px-4 py-2 rounded-[14px] bg-pink-500/10 border border-pink-500/30 text-pink-500 text-[13px] font-black">
            {currentPage} / {totalPages}
          </div>

          <NavButton
            onClick={goNext}
            disabled={currentPage === totalPages}
            label="Trang tiếp"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </NavButton>
        </div>

        {/* ── Desktop: full page number display ── */}
        <div className="hidden sm:flex items-center gap-1.5">
          {/* Prev */}
          <NavButton
            onClick={goPrev}
            disabled={currentPage === 1}
            label="Trang trước"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </NavButton>

          {/* Page numbers + ellipsis */}
          <div className="flex items-center gap-1" role="list">
            {pageRange.map((p, idx) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-text-muted/50 text-[13px] font-black"
                  aria-hidden="true"
                >
                  ···
                </span>
              ) : (
                <div key={p} role="listitem">
                  <PageButton
                    page={p}
                    isCurrent={p === currentPage}
                    onClick={handlePage}
                  />
                </div>
              )
            )}
          </div>

          {/* Next */}
          <NavButton
            onClick={goNext}
            disabled={currentPage === totalPages}
            label="Trang tiếp"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </NavButton>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
});

export default WishlistPagination;
