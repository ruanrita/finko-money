import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        nav: 'absolute right-4',
        month: "space-y-3",
        caption_label: "font-semibold text-brand pl-2",
        button_next: 'fill-brand hover:opacity-100 hover:bg-blue-50 hover:text-brand dark:hover:bg-blue-900/20',
        button_previous: 'fill-brand hover:opacity-100 hover:bg-blue-50 hover:text-brand dark:hover:bg-blue-900/20',
        day: cn("h-9 w-9 text-center p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"),
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
