import { MemoryLimitInput } from "@components/common/MemoryLimitInput.tsx";
import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { FieldError } from "@components/ui/field.tsx";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useCallback, useContext, useEffect } from "react";
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
  maxLimit?: number | string | null;
}) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );

  const isError = attributesTouched[props.attribute] && !attributesValid[props.attribute];

  const validate = useCallback(
    (value: string | number | undefined) => {
      if (value === undefined || value === "") return props.optional;

      // Check max limit if exists
      if (props.maxLimit !== null && props.maxLimit !== undefined) {
        let maxLimit = props.maxLimit;
        if (typeof maxLimit === "string") {
          const lower = maxLimit.toLowerCase();
          const val = parseFloat(lower);
          if (!Number.isNaN(val)) {
            maxLimit = lower.includes("g") ? val * 1024 : val;
          } else {
            // Invalid limit string, ignore constraint or fail safe?
            // If we can't parse the limit, let's treat it as no limit or log error
            // treating as no limit for now to avoid blocking
            maxLimit = Number.MAX_VALUE;
          }
        }

        let numVal = typeof value === "string" ? parseFloat(value) : value;

        if (typeof value === "string" && !Number.isNaN(numVal)) {
          if (value.endsWith("GiB")) {
            numVal = numVal * 1024;
          }
        }

        if (!Number.isNaN(numVal) && numVal > maxLimit) {
          return false;
        }
      }

      return props.validator.safeParse(value).success;
    },
    [props.optional, props.maxLimit, props.validator],
  );

  useEffect(() => {
    if (!props.optional) {
      setAttributeTouched(
        props.attribute,
        creationState.gameServerState[props.attribute] !== undefined,
      );
      setAttributeValid(props.attribute, validate(creationState.gameServerState[props.attribute]));
    }
  }, [
    props.optional,
    creationState.gameServerState,
    props.attribute,
    setAttributeTouched,
    setAttributeValid,
    validate,
  ]);

  useEffect(() => {
    if (props.optional) {
      // If optional, we still need to validate if a value is entered (e.g. against limit)
      const val = creationState.gameServerState[props.attribute];
      if (val !== undefined && val !== "") {
        setAttributeValid(props.attribute, validate(val));
      } else {
        setAttributeValid(props.attribute, true);
      }
      setAttributeTouched(props.attribute, true);
    }
  }, [
    props.optional,
    props.attribute,
    setAttributeValid,
    setAttributeTouched,
    validate,
    creationState.gameServerState,
  ]);

  const updateState = useCallback(
    (newValue: string) => {
      if (newValue === "" && props.defaultValue !== undefined)
        return setGameServerState(props.attribute)(props.defaultValue);
      setGameServerState(props.attribute)(newValue);

      // Always validate
      setAttributeValid(props.attribute, validate(newValue));
      setAttributeTouched(props.attribute, true);
    },
    [
      props.attribute,
      props.defaultValue,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      validate,
    ],
  );

  useEffect(() => {
    if (props.defaultValue !== undefined && !creationState.gameServerState[props.attribute]) {
      updateState(props.defaultValue);
    }
  }, [props.defaultValue, updateState, props.attribute, creationState.gameServerState]);

  const formatLimit = (limit: number | string | null | undefined) => {
    if (limit === null) return "∞";
    if (limit === undefined) return "";
    if (typeof limit === "string") return limit;
    if (limit >= 1024 && limit % 1024 === 0) {
      return `${limit / 1024} GiB`;
    }
    return `${limit} MiB`;
  };

  return (
    <div>
      {props.label && (
        <div className="flex justify-between">
          <label htmlFor={props.attribute}>{props.label}</label>
        </div>
      )}
      <MemoryLimitInput
        id={props.attribute}
        value={creationState.gameServerState[props.attribute] as string | number | undefined}
        onChange={updateState}
        placeholder={props.placeholder}
        isError={isError}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerNextPage();
          }
        }}
      />
      {(props.description || props.maxLimit !== undefined) && (
        <DialogDescription>
          {props.description}
          {props.maxLimit !== undefined && <span> (Limit: {formatLimit(props.maxLimit)})</span>}
        </DialogDescription>
      )}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default MemoryLimitInputField;
