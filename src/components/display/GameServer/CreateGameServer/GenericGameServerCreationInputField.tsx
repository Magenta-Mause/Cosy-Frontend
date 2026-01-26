import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { FieldError, FieldLabel } from "@components/ui/field.tsx";
import { Input } from "@components/ui/input.tsx";
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
}) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );

  const isError = attributesTouched[props.attribute] && !attributesValid[props.attribute];

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

  const changeCallback = useCallback(
    (value: string) => {
      if (value === "" && props.defaultValue !== undefined)
        return setGameServerState(props.attribute)(props.defaultValue);
      setGameServerState(props.attribute)(value);
      if (!props.optional) {
        setAttributeValid(props.attribute, props.validator.safeParse(value).success);
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
        <FieldLabel htmlFor={props.attribute} className={"text-lg"}>
          {props.label}
        </FieldLabel>
      )}
      <Input
        className={isError ? "border-red-500" : ""}
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
      {props.description && <FieldLabel htmlFor={props.attribute}>{props.description}</FieldLabel>}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default GenericGameServerCreationInputField;
