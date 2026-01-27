import DatePicker from "@components/display/DatePicker/DatePicker";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimeRangeProps {
  className?: string;
  onChange: (value: { timeUnit: string; startTime: Date; endTime?: Date }) => void;
}

const TIME_RANGE_PRESETS: [number, "min" | "hour" | "day"][] = [
  [15, "min"],
  [30, "min"],
  [1, "hour"],
  [6, "hour"],
  [12, "hour"],
  [1, "day"],
  [7, "day"],
  [30, "day"],
]

const TimeRangeDropDown = (props: TimeRangeProps) => {
  const { t } = useTranslation();
  const [selectedLabel, setSelectedLabel] = useState<string>(t("timerange.button"));
  const [openCustom, setOpenCustom] = useState<boolean>(false);

  const timeAgo = (value: number, unit: string): Date => {
    const ms =
      unit === "min"
        ? value * 60 * 1000
        : unit === "hour"
          ? value * 60 * 60 * 1000
          : value * 24 * 60 * 60 * 1000;

    return new Date(Date.now() - ms);
  };

  const handleSelect = (time: number, unit: "min" | "hour" | "day") => {
    setSelectedLabel(t(`timerange.${unit}`, { time: time }));
    props.onChange({ timeUnit: unit, startTime: timeAgo(time, unit) });
  };

  const handleCustomRange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    setSelectedLabel(`${format(startDate, "LLL dd, y")} - ${format(endDate, "LLL dd, y")}`);
    props.onChange({ timeUnit: "day", startTime: startDate, endTime: endDate });
  };

  useEffect(() => {
    setSelectedLabel(t("timerange.button"));
  }, [t]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={`${props.className}`}>
            {selectedLabel}
            <ChevronDown className="-m-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-30 bg-primary-modal-background" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setOpenCustom(true)}>
              {t("timerange.custom")}
            </DropdownMenuItem>
            {TIME_RANGE_PRESETS.map(([time, unit]) => (
              <DropdownMenuItem key={`${time}-${unit}`} onSelect={() => handleSelect(time, unit)}>
                {t(`timerange.${unit}`, { time: time })}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DatePicker
        open={openCustom}
        onOpenChange={setOpenCustom}
        onRangeChange={handleCustomRange}
      />
    </>
  );
};

export default TimeRangeDropDown;
