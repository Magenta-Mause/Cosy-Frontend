import { DialogDescription, DialogTitle } from "@components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@components/ui/field";
import { Input } from "@components/ui/input";

export default function Step2() {
  return (
    <>
      <DialogTitle>Create Game Server Step 2: Choose Template and Name</DialogTitle>
      <DialogDescription>Choose a template and a name for your server.</DialogDescription>

      <div className="my-4 space-y-2">
        <FieldGroup>
          <FieldSet>
            <Field>
              <FieldLabel htmlFor="template-selection">Template</FieldLabel>
              <Input id="template-selection" placeholder="Select a template" required />
              <FieldDescription>Select a template for your server</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="server-name">Server Name</FieldLabel>
              <Input id="server-name" placeholder="My Game Server" required />
              <FieldDescription>Name your server</FieldDescription>
            </Field>
          </FieldSet>
        </FieldGroup>
      </div>
    </>
  );
}
