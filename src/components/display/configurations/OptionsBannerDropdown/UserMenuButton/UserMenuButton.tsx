import { Button } from "@components/ui/button.tsx";
import { User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";

const UserMenuButton = () => {
  const [_isUserOpen, setIsUserOpen] = useState(false);

  return (
    <Button
      onClick={() => setIsUserOpen((prev) => !prev)}
      className={cn("h-auto p-[.5vw] aspect-square")}
      aria-label={"Select Language"}
    >
      <User className="!h-[1.5vw] p-0 !w-auto aspect-square" />
    </Button>
  );
};

export default UserMenuButton;
