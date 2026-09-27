import TimeRangeDropDown from "@/components/display/DropDown/TimeRangeDropDown.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import useServerTimeRange from "@/hooks/useServerTimeRange/useServerTimeRange.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface ServerTimeRangeSelectorProps {
  readonly serverId: string;
  readonly className?: string;
  readonly buttonVariant?: "primary" | "secondary";
}

/** Header control for the time range shared by the dashboard, console and metrics views. */
const ServerTimeRangeSelector = (props: ServerTimeRangeSelectorProps) => {
  const { t } = useTranslationPrefix("timerange");
  const { selection, setSelection, restricted } = useServerTimeRange(props.serverId);

  return (
    <TooltipWrapper tooltip={restricted ? t("restrictedHint") : null}>
      <div className={props.className}>
        <TimeRangeDropDown
          value={selection}
          onChange={setSelection}
          restricted={restricted}
          buttonVariant={props.buttonVariant}
          className="h-10"
        />
      </div>
    </TooltipWrapper>
  );
};

export default ServerTimeRangeSelector;
