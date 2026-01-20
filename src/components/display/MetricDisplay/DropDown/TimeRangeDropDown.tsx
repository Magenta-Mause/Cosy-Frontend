import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { v7 as generateUuid } from "uuid";
import { getMetrics } from "@/api/generated/backend-api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { gameServerMetricsSliceActions } from "@/stores/slices/gameServerMetrics";

const TimeRangeDropDown = (props: { className?: string; gameServerUuid: string, setUnit: (unit: "min" | "hour" | "day") => void }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [time, setTime] = useState<Date | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>(t("timerange.button"));

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
    setTime(timeAgo(time, unit));
    setSelectedLabel(t(`timerange.${unit}`, { time: time }));
    props.setUnit(unit);
  };

  useEffect(() => {
    if (!time) return;

    const fetchMetrics = async () => {
      dispatch(
        gameServerMetricsSliceActions.setState({
          gameServerUuid: props.gameServerUuid,
          state: "loading",
        })
      );

      const metrics = await getMetrics(
        props.gameServerUuid,
        { start: time.toISOString() }
      );

      dispatch(
        gameServerMetricsSliceActions.setGameServerMetrics({
          gameServerUuid: props.gameServerUuid,
          metrics: metrics.map(m => ({ ...m, uuid: generateUuid() })),
        })
      );

      dispatch(
        gameServerMetricsSliceActions.setState({
          gameServerUuid: props.gameServerUuid,
          state: "idle",
        })
      );
    };

    fetchMetrics();
  }, [time, props.gameServerUuid, dispatch]);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`${props.className}`}>{selectedLabel}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30 bg-primary-modal-background" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setSelectedLabel(t("timerange.custom"))}>
            {t("timerange.custom")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(15, "min")}>
            {t("timerange.min", { time: 15 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(30, "min")}>
            {t("timerange.min", { time: 30 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(1, "hour")}>
            {t("timerange.hour", { time: 1 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(3, "hour")}>
            {t("timerange.hour", { time: 3 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(6, "hour")}>
            {t("timerange.hour", { time: 6 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(12, "hour")}>
            {t("timerange.hour", { time: 12 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(24, "hour")}>
            {t("timerange.hour", { time: 24 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(7, "day")}>
            {t("timerange.day", { time: 7 })}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelect(30, "day")}>
            {t("timerange.day", { time: 30 })}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>);
};

export default TimeRangeDropDown;
