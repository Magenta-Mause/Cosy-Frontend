import LanguageSelector from "@components/display/configurations/HeaderButtonGroup/LanguageSelector/LanguageSelector.tsx";
import UserModalButton from "@components/display/configurations/HeaderButtonGroup/UserModalButton/UserModalButton.tsx";
import { Button } from "@components/ui/button";
import { cn } from "@/lib/utils.ts";

const HeaderButtonGroup = (props: { className?: string }) => {
  return (
    <div className={cn("flex gap-[2vw]", props.className)}>
      <UserModalButton />
      <LanguageSelector />
      <Button variant={"cocoaPrimary"}>Button</Button>
      <Button variant={"cocoaSecondary"}>Button</Button>
      <Button variant={"cocoaDestructive"}>Button</Button>

      <Button variant={"rustPrimary"}>Button</Button>
      <Button variant={"rustSecondary"}>Button</Button>
      <Button variant={"rustDestructive"}>Button</Button>

      <Button variant={"lavenderPrimary"}>Button</Button>
      <Button variant={"lavenderSecondary"}>Button</Button>
      <Button variant={"lavenderDestructive"}>Button</Button>

      <Button variant={"mochaPrimary"}>Button</Button>
      <Button variant={"mochaSecondary"}>Button</Button>
      <Button variant={"mochaDestructive"}>Button</Button>
    </div>
  );
};

export default HeaderButtonGroup;
