import { Button } from "@components/ui/button";
import { DialogClose, DialogContent, DialogFooter } from "@components/ui/dialog";
import Step1 from "./CreationSteps/Step1";
import { useState, type Dispatch, type SetStateAction } from "react";
import Step2 from "./CreationSteps/Step2";
import Step3 from "./CreationSteps/Step3";

interface Props {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}

function createStepKey(step: number) {
  return `CreateGameServerModalStep${step + 1}`;
}

export default function CreateGameServerModal({ setModalOpen }: Props) {
  const [step, setStep] = useState(0);
  const CREATION_STEPS = [
    <Step1 key={createStepKey(0)} />,
    <Step2 key={createStepKey(1)} />,
    <Step3 key={createStepKey(2)} />,
  ];
  const isLastStep = step === CREATION_STEPS.length - 1;

  const handleNextStep = () => {
    if (isLastStep) {
      setModalOpen(false);
    }

    setStep((step + 1) % CREATION_STEPS.length);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      {CREATION_STEPS[step]}
      <DialogFooter>
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
          Back
        </Button>
        <Button
          type="submit"
          onClick={handleNextStep}
          className={
            isLastStep
              ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
              : ""
          }
        >
          {isLastStep ? "Create Server" : "Next Step"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
