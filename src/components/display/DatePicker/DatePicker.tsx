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

  const today = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(today, -7),
    to: today
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
            disabled={{ after: today }}
          />
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={() => props.onOpenChange(false)}>{t("timerange.cancel")}</Button>
          <Button onClick={() => {
            if (date?.from && date?.to) {
              props.onRangeChange({ startDate: date.from, endDate: date.to });
            }
            props.onOpenChange(false);
          }}
          >{t("timerange.apply")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatePicker;
