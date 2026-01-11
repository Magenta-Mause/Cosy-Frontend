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
    if (props.defaultValue !== undefined) {
      changeCallback(props.defaultValue);
    }
  }, [changeCallback, props.defaultValue]);

  return (
    <div>
      {props.label && <label htmlFor={props.attribute}>{props.label}</label>}
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
      {props.description && <DialogDescription>{props.description}</DialogDescription>}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default GenericGameServerCreationInputField;
