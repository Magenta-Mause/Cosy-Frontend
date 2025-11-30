import { DialogTitle } from "@components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@components/ui/field";
import { Input } from "@components/ui/input";

export default function Step1() {
  return (
    <>
      <DialogTitle>Create Game Server Step 1: Choose Game</DialogTitle>

      <div className="my-4 space-y-2">
        <FieldGroup>
          <FieldSet>
            <Field>
              <FieldLabel htmlFor="template-selection">Select a Game to host</FieldLabel>
              <Input id="template-selection" placeholder="Select a game" required />
              <FieldDescription>Select a game for your server</FieldDescription>
            </Field>
          </FieldSet>
        </FieldGroup>
      </div>
    </>
  );
}
