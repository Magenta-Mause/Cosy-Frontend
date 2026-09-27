import DatePicker from "@/components/display/DatePicker/DatePicker";
import Icon from "@/components/ui/Icon.tsx";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import arrowDownIcon from "@/assets/icons/arrowDown.webp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  customRangeFromDays,
  isAllowedForRestrictedViewer,
  PUBLIC_MAX_LOOKBACK_MS,
  TIME_RANGE_PRESETS,
  type TimeRangeSelection,
} from "@/lib/timeRange.ts";

interface TimeRangeDropDownProps {
  readonly className?: string;
  readonly value: TimeRangeSelection;
  readonly onChange: (value: TimeRangeSelection) => void;
  /** Only offer ranges within the public lookback limit. */
  readonly restricted?: boolean;
  readonly buttonVariant?: "primary" | "secondary";
}

const TimeRangeDropDown = (props: TimeRangeDropDownProps) => {
  const { t } = useTranslationPrefix("timerange");
  const [openCustom, setOpenCustom] = useState<boolean>(false);
  const { value, onChange, restricted = false } = props;

  const selectedLabel = useMemo(() => {
    if (value.type === "preset") {
      return t(value.unit, { time: value.value });
    }
    // The stored end is exclusive (start of the day after), show the last included day.
    const lastDay = new Date(value.end.getTime() - 1);
    return `${format(value.start, "LLL dd, y")} - ${format(lastDay, "LLL dd, y")}`;
  }, [value, t]);

  const presets = TIME_RANGE_PRESETS.filter(
    ([time, unit]) =>
      !restricted || isAllowedForRestrictedViewer({ type: "preset", value: time, unit }),
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={props.className}
            variant={props.buttonVariant}
            data-testid="time-range-dropdown"
          >
            {selectedLabel}
            <Icon src={arrowDownIcon} variant={props.buttonVariant} className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-(--radix-dropdown-menu-trigger-width) min-w-48 bg-primary-modal-background"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => setOpenCustom(true)}
              data-testid="time-range-option-custom"
            >
              {t("custom")}
            </DropdownMenuItem>
            {presets.map(([time, unit]) => (
              <DropdownMenuItem
                key={`${time}-${unit}`}
                onSelect={() => onChange({ type: "preset", value: time, unit })}
                data-testid={`time-range-option-${time}-${unit}`}
              >
                {t(unit, { time })}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DatePicker
        open={openCustom}
        onOpenChange={setOpenCustom}
        earliestDate={restricted ? new Date(Date.now() - PUBLIC_MAX_LOOKBACK_MS) : undefined}
        onRangeChange={({ startDate, endDate }) =>
          onChange(customRangeFromDays(startDate, endDate))
        }
      />
    </>
  );
};

export default TimeRangeDropDown;
