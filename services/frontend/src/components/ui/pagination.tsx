import * as React from "react"
import { cn } from "@/lib/utils"

export const Pagination = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center justify-center space-x-2", className)}
      {...props}
    />
  )
}

export const PaginationContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
)

export const PaginationItem = ({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("", className)} {...props} />
)

export const PaginationLink = ({
  className,
  isActive,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) => (
  <a
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
      isActive && "bg-accent text-accent-foreground",
      className
    )}
    {...props}
  />
)

export const PaginationPrevious = ({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <PaginationLink className={cn("px-2.5", className)} {...props}>
    <span className="sr-only">Previous</span>
    ‹
  </PaginationLink>
)

export const PaginationNext = ({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <PaginationLink className={cn("px-2.5", className)} {...props}>
    <span className="sr-only">Next</span>
    ›
  </PaginationLink>
)
