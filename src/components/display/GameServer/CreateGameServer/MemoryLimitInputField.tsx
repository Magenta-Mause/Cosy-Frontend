import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { FieldError } from "@components/ui/field.tsx";
import { Input } from "@components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select.tsx";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useCallback, useContext, useEffect, useState } from "react";
import type { ZodType } from "zod";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto.ts";

const MemoryLimitInputField = (props: {
  attribute: keyof GameServerCreationDto;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
}) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );

  const [unit, setUnit] = useState<"MB" | "GB">("MB");
  const [localInputValue, setLocalInputValue] = useState("");

  const isError = attributesTouched[props.attribute] && !attributesValid[props.attribute];

  // Initialize from context on mount
  useEffect(() => {
    const rawValue = creationState.gameServerState[props.attribute] as string | undefined;
    if (rawValue && !isNaN(parseFloat(rawValue))) {
        const val = parseFloat(rawValue);
        if (val >= 1024 && val % 1024 === 0) {
            setUnit("GB");
            setLocalInputValue((val / 1024).toString());
        } else {
            setUnit("MB");
            setLocalInputValue(val.toString());
        }
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (!props.optional) {
      setAttributeTouched(
        props.attribute,
        creationState.gameServerState[props.attribute] !== undefined,
      );
      setAttributeValid(
        props.attribute,
        props.validator.safeParse(creationState.gameServerState[props.attribute]).success,
      );
    }
  }, [
    props.optional,
    creationState.gameServerState,
    props.attribute,
    setAttributeTouched,
    setAttributeValid,
    props.validator,
  ]);

  useEffect(() => {
    if (props.optional) {
      setAttributeValid(props.attribute, true);
      setAttributeTouched(props.attribute, true);
    }
  }, [props.optional, props.attribute, setAttributeValid, setAttributeTouched]);

  const updateState = useCallback(
    (newValue: string) => {
        if (newValue === "" && props.defaultValue !== undefined)
            return setGameServerState(props.attribute)(props.defaultValue);
        setGameServerState(props.attribute)(newValue);
        if (!props.optional) {
            setAttributeValid(props.attribute, props.validator.safeParse(newValue).success);
            setAttributeTouched(props.attribute, true);
        }
    },
    [
        props.optional,
        props.attribute,
        props.validator,
        props.defaultValue,
        setAttributeTouched,
        setAttributeValid,
        setGameServerState,
    ]
  );

  const handleInputChange = (inputValue: string) => {
    setLocalInputValue(inputValue);
    
    // If empty, just pass empty
    if (inputValue === "") {
        updateState("");
        return;
    }

    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) {
        // If not a number, pass it as is (let validator handle it)
        updateState(inputValue);
        return;
    }

    const multiplier = unit === "GB" ? 1024 : 1;
    const finalValue = Math.round(numericValue * multiplier); 
    updateState(finalValue.toString());
  };

  const handleUnitChange = (newUnit: "MB" | "GB") => {
    // Convert current visible value to new unit, keeping the physical value same.
    const currentVal = parseFloat(localInputValue);
    if (isNaN(currentVal)) {
        setUnit(newUnit);
        return;
    }

    const currentMultiplier = unit === "GB" ? 1024 : 1;
    const physicalMb = currentVal * currentMultiplier;
    
    const newMultiplier = newUnit === "GB" ? 1024 : 1;
    const newDisplayVal = physicalMb / newMultiplier;
    
    setLocalInputValue(newDisplayVal.toString());
    setUnit(newUnit);
    // Global state (physical MB) remains same, so no updateState needed.
  };

  useEffect(() => {
    if (props.defaultValue !== undefined && !creationState.gameServerState[props.attribute]) {
       // Only apply default if state is empty
       // And also update local state
       const val = parseFloat(props.defaultValue);
       if (!isNaN(val)) {
            // Default assumes MB?
             if (val >= 1024 && val % 1024 === 0) {
                setUnit("GB");
                setLocalInputValue((val / 1024).toString());
            } else {
                setUnit("MB");
                setLocalInputValue(val.toString());
            }
       }
       updateState(props.defaultValue);
    }
  }, [props.defaultValue, updateState, props.attribute, creationState.gameServerState]); 

  const unitSelector = (
    <div className="pointer-events-auto h-full flex items-center">
      <Select value={unit} onValueChange={(v) => handleUnitChange(v as "MB" | "GB")}>
        <SelectTrigger className="h-6 w-fit border-none shadow-none bg-transparent focus:ring-0 px-1 gap-1 text-muted-foreground hover:bg-transparent">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MB">MB</SelectItem>
          <SelectItem value="GB">GB</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      {props.label && <label htmlFor={props.attribute}>{props.label}</label>}
      <Input
        className={isError ? "border-red-500 pr-16" : "pr-16"}
        placeholder={props.placeholder}
        onChange={(e) => handleInputChange(e.target.value)}
        id={props.attribute}
        value={localInputValue}
        type="number"
        endDecorator={unitSelector}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerNextPage();
          }
        }}
      />
      {props.description && <DialogDescription>{props.description}</DialogDescription>}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default MemoryLimitInputField;
