import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { Input } from "@components/ui/input.tsx";
import { useCallback, useContext, useEffect } from "react";
import type { ZodType } from "zod";

const GenericGameServerCreationInputField = (props: {
  attribute: keyof GameServerCreationFormState;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
  inputType?: React.ComponentProps<"input">["type"];
  inputMode?: React.ComponentProps<"input">["inputMode"];
  step?: React.ComponentProps<"input">["step"];
}) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );

  const isError = attributesTouched[props.attribute] && !attributesValid[props.attribute];

  useEffect(() => {
    if (!props.optional) {
      const value = creationState.gameServerState[props.attribute];
      setAttributeTouched(props.attribute, value !== undefined);
      const isValid =
        value === "" || value === null || value === undefined
          ? false
          : props.validator.safeParse(value).success;
      setAttributeValid(props.attribute, isValid);
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
        const isValid = value === "" ? false : props.validator.safeParse(value).success;
        setAttributeValid(props.attribute, isValid);
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
      <Input
        error={isError ? props.errorLabel : undefined}
        description={props.description}
        header={props.label}
        placeholder={props.placeholder}
        type={props.inputType}
        inputMode={props.inputMode}
        step={props.step}
        onChange={(e) => changeCallback(e.target.value)}
        id={props.attribute}
        value={creationState.gameServerState[props.attribute] as string | number | undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerNextPage();
          }
        }}
      />
    </div>
  );
};

export default GenericGameServerCreationInputField;
