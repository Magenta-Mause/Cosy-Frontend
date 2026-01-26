import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto.ts";

export const GameServerCreationPageContext = createContext<GameServerCreationPageContextType>({
  attributesValid: {},
  setAttributeValid: () => {},
  attributesTouched: {},
  setAttributeTouched: () => {},
});

export interface GameServerCreationPageContextType {
  attributesValid: Partial<{
    [K in keyof GameServerCreationDto]: boolean;
  }>;
  setAttributeValid: (attribute: keyof GameServerCreationDto, valid: boolean) => void;
  attributesTouched: Partial<{
    [K in keyof GameServerCreationDto]: boolean;
  }>;
  setAttributeTouched: (attribute: keyof GameServerCreationDto, touched: boolean) => void;
}

const GenericGameServerCreationPage = (props: { children: ReactNode }) => {
  const { setCurrentPageValid } = useContext(GameServerCreationContext);
  const [attributesValid, setAttributesValid] = useState<
    Partial<{
      [K in keyof GameServerCreationDto]: boolean;
    }>
  >({});
  const [attributesTouched, setAttributesTouched] = useState<
    Partial<{
      [K in keyof GameServerCreationDto]: boolean;
    }>
  >({});
  const setAttributeValid = useCallback(
    (attribute: keyof GameServerCreationDto, valid: boolean) => {
      setAttributesValid((prev) => ({ ...prev, [attribute]: valid }));
    },
    [],
  );

  const setAttributeTouched = useCallback(
    (attribute: keyof GameServerCreationDto, touched: boolean) => {
      console.log(attribute, touched);
      setAttributesTouched((prev) => ({ ...prev, [attribute]: touched }));
    },
    [],
  );
  useEffect(() => {
    console.log(attributesValid, attributesTouched);
  }, [attributesValid, attributesTouched]);

  useEffect(() => {
    const allValid = Object.values(attributesValid).every((isValid) => isValid);
    const allTouched = Object.values(attributesTouched).every((isTouched) => isTouched);
    setCurrentPageValid(allValid && allTouched);
  }, [attributesValid, attributesTouched, setCurrentPageValid]);

  return (
    <GameServerCreationPageContext.Provider
      value={{
        attributesValid,
        attributesTouched,
        setAttributeValid,
        setAttributeTouched,
      }}
    >
      {props.children}
    </GameServerCreationPageContext.Provider>
  );
};

export default GenericGameServerCreationPage;
