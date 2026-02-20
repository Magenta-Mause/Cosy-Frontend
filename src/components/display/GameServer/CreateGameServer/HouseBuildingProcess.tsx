import { useTranslation } from "react-i18next";
import type { GameServerDto } from "@/api/generated/model";
import castle1 from "@/assets/gameServerCreation/castles/castle1.webp";
import castle2 from "@/assets/gameServerCreation/castles/castle2.webp";
import castle3 from "@/assets/gameServerCreation/castles/castle3.webp";
import house1 from "@/assets/gameServerCreation/houses/house1.webp";
import house2 from "@/assets/gameServerCreation/houses/house2.webp";
import house3 from "@/assets/gameServerCreation/houses/house3.webp";
import { cn } from "@/lib/utils";

const castles = [castle1, castle2, castle3];
const houses = [house1, house2, house3];
const TOTAL_STEPS = 3;

// Per-image horizontal offset in pixels to compensate for off-center subjects.
// Positive = shift right, negative = shift left.
const IMAGE_X_OFFSETS: Record<"HOUSE" | "CASTLE", [number, number, number]> = {
  HOUSE: [17, 17, 17],
  CASTLE: [41, 38, 38],
};

// Width of the image in pixels per design type.
const IMAGE_WIDTHS: Record<"HOUSE" | "CASTLE", number> = {
  HOUSE: 250,
  CASTLE: 360,
};

const HouseBuildingProcess = (props: {
  houseType: GameServerDto["design"];
  currentStep: number;
}) => {
  const { t } = useTranslation();
  const type = props.houseType === "CASTLE" ? "CASTLE" : "HOUSE";
  const currentImage = type === "HOUSE" ? houses[props.currentStep] : castles[props.currentStep];
  const xOffset = IMAGE_X_OFFSETS[type][props.currentStep];
  const imageWidth = IMAGE_WIDTHS[type];

  const stepTitle = t(`components.CreateGameServer.steps.step${props.currentStep + 1}.title`);

  return (
    <div
      className={"bg-card p-5 rounded-lg border-solid border-2 flex flex-col gap-4 overflow-hidden"}
    >
      <img
        src={currentImage}
        alt={`House building process step ${props.currentStep + 1}`}
        style={{
          width: `${imageWidth}px`,
          imageRendering: "pixelated",
          transform: xOffset !== 0 ? `translateX(${xOffset}px)` : undefined,
        }}
      />

      <div className="flex flex-col items-center gap-3">
        {/* Step indicators */}
        <div className="flex items-center gap-0">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors",
                  i < props.currentStep
                    ? "bg-primary/50 text-primary-foreground"
                    : i === props.currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 transition-colors",
                    i < props.currentStep ? "bg-primary/50" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step title */}
        <p className="text-sm font-medium text-center">{stepTitle}</p>
      </div>
    </div>
  );
};

export default HouseBuildingProcess;
