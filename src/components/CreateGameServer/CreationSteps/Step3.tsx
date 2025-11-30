import { DialogDescription, DialogTitle } from "@components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@components/ui/input";
import FieldKeyValueInput from "@components/FieldKeyValueInput/FieldKeyValueInput";
import { useState } from "react";

export default function Step3() {
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([]);
  const [volumeMounts, setVolumeMounts] = useState<Array<{ key: string; value: string }>>([]);

  return (
    <div className="w-full max-w-md">
      <DialogTitle>Create Game Server Step 3: Configure your Server</DialogTitle>
      <DialogDescription>Here you can configure your server.</DialogDescription>
      <div className="my-4 space-y-2">
        <FieldGroup>
          <FieldSet>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="docker-image">Docker image</FieldLabel>
                <Input id="docker-image" placeholder="nginx" required />
                <FieldDescription>Docker image for your server</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="image-tag">Image tag</FieldLabel>
                <Input id="image-tag" placeholder="latest" required />
                <FieldDescription>Tag for the Docker image</FieldDescription>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="port-selection">Port</FieldLabel>
                <Input id="port-selection" placeholder="4433" required />
                <FieldDescription>Port your Server will run on</FieldDescription>
              </Field>
            </div>
            <FieldKeyValueInput
              placeHolderKeyInput="KEY"
              placeHolderValueInput="VALUE"
              separator="="
              fieldLabel="Environment Variable"
              fieldDescription="Environment variables for your Server"
              values={envVars}
              setKeyValue={setEnvVars}
            />
            <Field>
              <FieldLabel htmlFor="execution-command">Execution Command</FieldLabel>
              <Input id="execution-command" placeholder="./start.sh" required />
              <FieldDescription>Command to start your server</FieldDescription>
            </Field>
            <FieldKeyValueInput
              placeHolderKeyInput="Host Path"
              placeHolderValueInput="Container Path"
              separator=":"
              fieldLabel="Volume Mount"
              fieldDescription="Volume mounts for your server"
              values={volumeMounts}
              setKeyValue={setVolumeMounts}
            />
          </FieldSet>
        </FieldGroup>
      </div>
    </div>
  );
}
