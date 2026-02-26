import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { buttonVariants } from "./button";
import { cn } from "../../lib/utils";

function buildRange(currentPage, totalPages, siblingCount, showEdges) {
  const pages = [];
  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  if (showEdges) {
    pages.push(1);
    if (leftSibling > 2) pages.push("ellipsis-left");

    for (let page = Math.max(leftSibling, 2); page <= Math.min(rightSibling, totalPages - 1); page += 1) {
      pages.push(page);
    }

    if (rightSibling < totalPages - 1) pages.push("ellipsis-right");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    pages.push(page);
  }
  return pages;
}

export default function Pagination01({
  page,
  totalItems,
  itemsPerPage = 8,
  siblingCount = 1,
  showEdges = true,
  onPageChange,
  className,
}) {
  if (!totalItems) return null;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const range = buildRange(safePage, totalPages, siblingCount, showEdges);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === safePage) return;
    onPageChange(nextPage);
  };

  return (
    <nav className={cn("mt-8 flex items-center justify-center", className)} aria-label="Pagination Navigation">
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className={buttonVariants({
              variant: "outline",
              className: "gap-1 pl-2.5",
            })}
          >
            <LuChevronLeft className="size-4" />
            <span>Previous</span>
          </button>
        </li>

        {range.map((item, index) => (
          <li key={`${item}-${index}`}>
            {typeof item === "number" ? (
              <button
                type="button"
                onClick={() => goToPage(item)}
                className={buttonVariants({
                  variant: item === safePage ? "default" : "ghost",
                  className: "h-10 min-w-10 px-3",
                })}
                aria-current={item === safePage ? "page" : undefined}
              >
                {item}
              </button>
            ) : (
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm text-slate-500">
                ...
              </span>
            )}
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className={buttonVariants({
              variant: "outline",
              className: "gap-1 pr-2.5",
            })}
          >
            <span>Next</span>
            <LuChevronRight className="size-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
