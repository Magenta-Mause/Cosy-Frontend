import { useTranslation } from "react-i18next";
import type { GameServerDto } from "@/api/generated/model";
import castle1 from "@/assets/gameServerCreation/castles/castle1.webp";
import castle2 from "@/assets/gameServerCreation/castles/castle2.webp";
import castle3 from "@/assets/gameServerCreation/castles/castle3.webp";
import house1 from "@/assets/gameServerCreation/houses/house1.webp";
import house2 from "@/assets/gameServerCreation/houses/house2.webp";
import house3 from "@/assets/gameServerCreation/houses/house3.webp";
import { cn } from "@/lib/utils";
import NameAndStatusBanner from "../NameAndStatusBanner/NameAndStatusBanner";

const castles = [castle1, castle2, castle3];
const houses = [house1, house2, house3];
const TOTAL_STEPS = 3;

// Per-image horizontal offset in pixels to compensate for off-center subjects.
// Positive = shift right, negative = shift left.
const IMAGE_X_OFFSETS: Record<"HOUSE" | "CASTLE", [number, number, number]> = {
  HOUSE: [70, 70, 70],
  CASTLE: [35, 38, 38],
};

// Width of the image in pixels per design type.
const IMAGE_WIDTHS: Record<"HOUSE" | "CASTLE", number> = {
  HOUSE: 250,
  CASTLE: 360,
};

const HouseBuildingProcess = (props: {
  houseType: GameServerDto["design"];
  currentStep: number;
  serverName?: string;
  stepLabel?: string;
}) => {
  const { t } = useTranslation();
  const type = props.houseType === "CASTLE" ? "CASTLE" : "HOUSE";
  const currentImage = type === "HOUSE" ? houses[props.currentStep] : castles[props.currentStep];
  const xOffset = IMAGE_X_OFFSETS[type][props.currentStep];
  const imageWidth = IMAGE_WIDTHS[type];
  const displayName = props.serverName || t("components.CreateGameServer.serverNamePlaceholder");

  return (
    <div
      className={
        "bg-background p-5 rounded-lg border-solid border-2 flex flex-col gap-6 overflow-hidden min-w-100"
      }
    >
      <div className="relative">
        <img
          src={currentImage}
          alt={`House building process step ${props.currentStep + 1}`}
          style={{
            width: `${imageWidth}px`,
            imageRendering: "pixelated",
            transform: xOffset !== 0 ? `translateX(${xOffset}px)` : undefined,
          }}
        />
        <NameAndStatusBanner
          className="bottom-[50%] left-1/2 -translate-x-1/2"
          classNameTextChildren="py-[8%] text-[2vw] leading-none pt-[12%]"
          hideStatus
        >
          {displayName}
        </NameAndStatusBanner>
      </div>

      <Stepper step={props.currentStep} label={props.stepLabel} />
    </div>
  );
};

const Stepper = (props: { step: number; label?: string }) => {
  const { t } = useTranslation();
  const stepTitle = props.label ?? t(`components.CreateGameServer.steps.step${props.step + 1}.title`);
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: array indices is a valid key here
          <div key={i} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full text-[23px] font-semibold transition-colors border-button-primary-default border-2",
                i < props.step
                  ? "bg-button-primary-default/60 text-card"
                  : i === props.step
                    ? "bg-button-primary-default text-card"
                    : "bg-card text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 transition-colors",
                  i < props.step ? "bg-button-primary-default" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current step title */}
      <p className="text-xl font-bold text-center">{stepTitle}</p>
    </div>
  );
};

export default HouseBuildingProcess;
