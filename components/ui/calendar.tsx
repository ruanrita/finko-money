import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center mb-1",
        caption_label: "text-sm font-semibold text-brand",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-blue-50 hover:text-brand dark:hover:bg-blue-900/20 border-0"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex mb-1",
        head_cell:
          "text-zinc-600 rounded-md w-9 font-medium text-[0.75rem] dark:text-zinc-400 uppercase",
        row: "flex w-full mt-0.5",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-brand text-white hover:bg-blue-700 hover:text-white focus:bg-brand focus:text-white dark:bg-brand dark:text-white dark:hover:bg-blue-700 dark:hover:text-white dark:focus:bg-brand dark:focus:text-white rounded-md font-medium",
        day_today: "bg-blue-50 text-brand font-semibold dark:bg-blue-900/30 dark:text-brand rounded-md",
        day_outside:
          "day-outside text-zinc-400 opacity-40 aria-selected:bg-zinc-100/50 aria-selected:text-zinc-500 dark:text-zinc-600 dark:aria-selected:bg-zinc-800/50",
        day_disabled: "text-zinc-300 opacity-50 dark:text-zinc-700 cursor-not-allowed hover:bg-transparent",
        day_range_middle:
          "aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
