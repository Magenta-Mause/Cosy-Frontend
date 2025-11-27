import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [counter, setCounter] = useState(0);
  const navigate = useNavigate();

  const increaseCounter = () => {
    setCounter((c) => ++c);
  };

  const redirectUser = () => {
    navigate({
      to: `/redirected/$counter`,
      params: {
        counter,
      },
    });
  };

  return (
    <div
      className="
      h-screen
      w-screen
      flex
      flex-row
      justify-center
      items-center
    "
    >
      {/*
        (maybe) TODO: change Card component
        s.t. side padding is automatically enforced
      */}
      <Card
        className="
            px-5
            w-fit
            flex
            flex-col
            items-center
            "
      >
        <span>Clicks: {counter}</span>
        <div
          className="
          flex
          flex-row
          gap-5
        "
        >
          <Button onClick={increaseCounter}>Click me!</Button>
          <Button onClick={redirectUser}>Don't click me!</Button>
        </div>
      </Card>
    </div>
  );
}

export default Index;
