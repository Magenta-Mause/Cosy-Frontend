import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogMain, DialogTitle } from "@components/ui/dialog";
import { addDays } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRangeChange: (value: { startDate: Date; endDate: Date }) => void;
}
const DatePicker = (props: DatePickerProps) => {
  const { t } = useTranslation();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  });

  const handleSelectRange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;
    setDate(range);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="w-auto">
        <DialogHeader>
          <DialogTitle>{t("datepicker.title")}</DialogTitle>
          <DialogDescription>{t("datepicker.des")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelectRange}
            numberOfMonths={2}
          />
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={() => props.onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (date?.from && date?.to) {
              props.onRangeChange({ startDate: date.from, endDate: date.to });
            }
            props.onOpenChange(false);
          }}
          >Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatePicker;
