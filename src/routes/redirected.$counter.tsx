import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/redirected/$counter")({
  component: Redirected,
});

function Redirected() {
  const navigate = useNavigate();

  const { counter } = Route.useParams();

  const goBack = () => {
    navigate({
      to: "/",
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
      <Card
        className="
        px-5
      "
      >
        {counter > 0 ? (
          <p className="text-center">
            I told you not to click!
            <br />
            That cost you all your {counter} clicks!
          </p>
        ) : (
          <p className="text-center">
            I told you not to click!
            <br />
            You didn't even have any clicks to repay your wrongdoings!
          </p>
        )}
        <Button onClick={goBack}>Earn some more clicks</Button>
      </Card>
    </div>
  );
}

export default Redirected;
