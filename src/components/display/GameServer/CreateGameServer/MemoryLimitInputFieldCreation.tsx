import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { MemoryLimitInput } from "@components/display/MemoryLimit/MemoryLimitInput.tsx";
import { FieldError } from "@components/ui/field.tsx";
import { useCallback, useContext, useEffect, useState } from "react";
import * as z from "zod";

interface MemoryLimitInputFieldCreationProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
}

const MEMORY_LIMIT_MIN_ERROR = "Memory limit must be at least 6 MiB";

const memoryLimitValidator = z.string().min(1).refine(
  (value) => {
    const match = value.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
    if (!match) return false;
    
    const [, numStr, unit] = match;
    const num = parseFloat(numStr);
    
    if (Number.isNaN(num)) return false;
    if (unit === "MiB" && num < 6) return false;
    
    return true;
  },
  { message: "Memory limit must be at least 6MiB" },
);

const MemoryLimitInputFieldCreation = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
}: MemoryLimitInputFieldCreationProps) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );
  const [errorMessage, setErrorMessage] = useState<string>(errorLabel);

  const attribute = "docker_max_memory" as keyof GameServerCreationFormState;
  const isError = attributesTouched[attribute] && !attributesValid[attribute];

  useEffect(() => {
    if (!optional) {
      const value = creationState.gameServerState[attribute];
      setAttributeTouched(attribute, true); // Always mark as touched
      
      let isValid = false;
      let customError = errorLabel;
      
      if (value === "" || value === null || value === undefined) {
        isValid = false;
        customError = errorLabel;
      } else {
        const validationResult = memoryLimitValidator.safeParse(value);
        isValid = validationResult.success;
        
        if (!isValid && typeof value === "string") {
          const match = value.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
          if (match) {
            const [, numStr, unit] = match;
            const num = parseFloat(numStr);
            if (unit === "MiB" && num < 6) {
              customError = MEMORY_LIMIT_MIN_ERROR;
            }
          }
        }
      }
      
      setErrorMessage(customError);
      setAttributeValid(attribute, isValid);
    }
  }, [
    optional,
    creationState.gameServerState,
    attribute,
    setAttributeTouched,
    setAttributeValid,
    errorLabel,
  ]);

  useEffect(() => {
    if (optional) {
      const value = creationState.gameServerState[attribute];
      
      let isValid = true;
      let customError = errorLabel;
      
      if (value !== "" && value !== null && value !== undefined) {
        const validationResult = memoryLimitValidator.safeParse(value);
        isValid = validationResult.success;
        
        if (!isValid && typeof value === "string") {
          const match = value.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
          if (match) {
            const [, numStr, unit] = match;
            const num = parseFloat(numStr);
            if (unit === "MiB" && num < 6) {
              customError = MEMORY_LIMIT_MIN_ERROR;
            }
          }
        }
      }
      
      setErrorMessage(customError);
      setAttributeValid(attribute, isValid);
      setAttributeTouched(attribute, true);
    }
  }, [optional, attribute, setAttributeValid, setAttributeTouched, creationState.gameServerState, errorLabel]);

  const changeCallback = useCallback(
    (value: string) => {
      const valToSend = value === "" ? undefined : value;
      setGameServerState(attribute)(
        valToSend as GameServerCreationFormState[keyof GameServerCreationFormState],
      );
      
      let isValid = false;
      let customError = errorLabel;
      
      if (!optional) {
        if (value === "") {
          isValid = false;
          customError = errorLabel;
        } else {
          const validationResult = memoryLimitValidator.safeParse(value);
          isValid = validationResult.success;
          
          if (!isValid) {
            const match = value.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
            if (match) {
              const [, numStr, unit] = match;
              const num = parseFloat(numStr);
              if (unit === "MiB" && num < 6) {
                customError = MEMORY_LIMIT_MIN_ERROR;
              }
            }
          }
        }
      } else {
        if (value === "") {
          isValid = true;
        } else {
          const validationResult = memoryLimitValidator.safeParse(value);
          isValid = validationResult.success;
          
          if (!isValid) {
            const match = value.match(/^(\d+(?:\.\d+)?)(MiB|GiB)$/);
            if (match) {
              const [, numStr, unit] = match;
              const num = parseFloat(numStr);
              if (unit === "MiB" && num < 6) {
                customError = MEMORY_LIMIT_MIN_ERROR;
              }
            }
          }
        }
      }
      
      setErrorMessage(customError);
      setAttributeValid(attribute, isValid);
      setAttributeTouched(attribute, true);
    },
    [optional, attribute, setAttributeTouched, setAttributeValid, setGameServerState, errorLabel],
  );

  return (
    <div className="py-2">
      <MemoryLimitInput
        id={attribute}
        header={label}
        className={isError ? "border-red-500" : ""}
        placeholder={placeholder}
        value={creationState.gameServerState[attribute] as string | number | undefined}
        onChange={(val) => changeCallback(val)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerNextPage();
          }
        }}
        description={description}
      />
      {isError && <FieldError>{errorMessage}</FieldError>}
    </div>
  );
};

export default MemoryLimitInputFieldCreation;

