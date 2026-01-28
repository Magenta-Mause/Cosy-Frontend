import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { FieldError } from "@components/ui/field.tsx";
import { Input } from "@components/ui/input.tsx";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useCallback, useContext, useEffect } from "react";
import type { ZodType } from "zod";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto.ts";

const GenericGameServerCreationInputField = (props: {
  attribute: keyof GameServerCreationDto;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
  maxLimit?: number | null;
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
        const numVal = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isNaN(numVal) && numVal > props.maxLimit) {
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

  const changeCallback = useCallback(
    (value: string) => {
      if (value === "" && props.defaultValue !== undefined)
        return setGameServerState(props.attribute)(props.defaultValue);
      setGameServerState(props.attribute)(value);

      // Always validate, regardless of optional status, if user is typing
      setAttributeValid(props.attribute, validate(value));
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
    // Only set default value if there's no existing value in the context
    if (
      props.defaultValue !== undefined &&
      creationState.gameServerState[props.attribute] === undefined
    ) {
      changeCallback(props.defaultValue);
    }
  }, [changeCallback, props.defaultValue, props.attribute, creationState.gameServerState]);

  return (
    <div>
      {props.label && (
        <div className="flex justify-between">
          <label htmlFor={props.attribute}>{props.label}</label>
        </div>
      )}
      <Input
        className={isError ? "border-red-500" : ""}
        description={props.description}
        header={props.label}
        placeholder={props.placeholder}
        onChange={(e) => changeCallback(e.target.value)}
        id={props.attribute}
        value={creationState.gameServerState[props.attribute] as string | number | undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerNextPage();
          }
        }}
      />
      {(props.description || props.maxLimit !== undefined) && (
        <DialogDescription>
          {props.description}
          {props.maxLimit !== undefined && (
            <span> (Limit: {props.maxLimit !== null ? props.maxLimit : "∞"})</span>
          )}
        </DialogDescription>
      )}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default GenericGameServerCreationInputField;
