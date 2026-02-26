import DatePicker from "@components/display/DatePicker/DatePicker";
import Icon from "@components/ui/Icon.tsx";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import arrowDownIcon from "@/assets/icons/arrowDown.svg?raw";
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
  defaultLabel?: string;
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
];

type Selection =
  | { type: "default" }
  | { type: "preset"; time: number; unit: "min" | "hour" | "day" }
  | { type: "custom"; startDate: Date; endDate: Date };

const TimeRangeDropDown = (props: TimeRangeProps) => {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<Selection>({ type: "default" });
  const [openCustom, setOpenCustom] = useState<boolean>(false);

  const selectedLabel = useMemo(() => {
    switch (selection.type) {
      case "default":
        return props.defaultLabel ?? t("timerange.button");
      case "preset":
        return t(`timerange.${selection.unit}`, { time: selection.time });
      case "custom":
        return `${format(selection.startDate, "LLL dd, y")} - ${format(selection.endDate, "LLL dd, y")}`;
    }
  }, [selection, t, props.defaultLabel]);

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
    setSelection({ type: "preset", time, unit });
    props.onChange({ timeUnit: unit, startTime: timeAgo(time, unit) });
  };

  const handleCustomRange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    setSelection({ type: "custom", startDate, endDate });
    props.onChange({ timeUnit: "day", startTime: startDate, endTime: endDate });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={`${props.className}`}>
            {selectedLabel}
            <Icon src={arrowDownIcon} className="size-4" />
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
