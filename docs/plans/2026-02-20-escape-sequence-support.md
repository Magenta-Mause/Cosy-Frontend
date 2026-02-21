# Escape Sequence Support in KeyValueInput Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional escape sequence processing to KeyValueInput component for environment variables requiring newlines and other special characters.

**Architecture:** Add a `processEscapeSequences` boolean prop to KeyValueInput. When enabled, the component processes common escape sequences (`\n`, `\t`, `\r`, `\\`) in value inputs before sending to backend. An info icon with tooltip appears next to value inputs to indicate this feature is available.

**Tech Stack:** React, TypeScript, lucide-react (Info icon), TooltipWrapper component

---

## Task 1: Add Escape Sequence Processing Utility

**Files:**
- Modify: `src/components/display/GameServer/CreateGameServer/util.ts`

**Step 1: Add escape sequence processing function**

Add this function after the `preProcessInputValue` function:

```typescript
/**
 * Processes common escape sequences in a string value.
 * Converts literal escape sequences like \n, \t, \r, \\ into their actual characters.
 */
export function processEscapeSequences(value: string): string {
  return value
    .replace(/\\n/g, '\n')     // newline
    .replace(/\\t/g, '\t')     // tab
    .replace(/\\r/g, '\r')     // carriage return
    .replace(/\\\\/g, '\\');   // backslash (must be last to avoid double-processing)
}
```

**Step 2: Commit**

```bash
git add src/components/display/GameServer/CreateGameServer/util.ts
git commit -m "feat: add escape sequence processing utility function"
```

---

## Task 2: Update KeyValueInput Component

**Files:**
- Modify: `src/components/display/GameServer/CreateGameServer/KeyValueInput.tsx`

**Step 1: Add imports**

Add to the existing import block at the top of the file (around line 1-7):

```typescript
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { Info } from "lucide-react";
```

Update the util import to include the new function:

```typescript
import { type InputType, preProcessInputValue, processEscapeSequences } from "./util";
```

**Step 2: Add processEscapeSequences prop to Props interface**

Add to the Props interface (around line 15-28):

```typescript
interface Props {
  attribute: keyof GameServerCreationFormState;
  placeHolderKeyInput: string;
  placeHolderValueInput: string;
  fieldLabel: string;
  fieldDescription: string;
  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;
  inputType: InputType;
  objectKey: string;
  objectValue: string;
  processEscapeSequences?: boolean; // NEW
}
```

**Step 3: Accept the new prop in the function parameters**

Update the function signature (around line 30-43):

```typescript
function KeyValueInput({
  attribute,
  placeHolderKeyInput,
  placeHolderValueInput,
  fieldLabel,
  fieldDescription,
  keyValidator,
  valueValidator,
  errorLabel,
  required,
  inputType,
  objectKey,
  objectValue,
  processEscapeSequences: shouldProcessEscapeSequences = false, // NEW with default
}: Props) {
```

**Step 4: Update computeValue to process escape sequences**

Modify the `computeValue` function (around line 68-80) to process escape sequences when enabled:

```typescript
const computeValue = useCallback(
  (items: KeyValueItem[]) => {
    const mappedItems: { [objectKey]: string | number; [objectValue]: string | number }[] = [];
    items.forEach((item) => {
      let processedValue = preProcessInputValue(item.value, inputType);

      // Apply escape sequence processing if enabled and value is a string
      if (shouldProcessEscapeSequences && typeof processedValue === 'string') {
        processedValue = processEscapeSequences(processedValue);
      }

      mappedItems.push({
        [objectKey]: preProcessInputValue(item.key, inputType),
        [objectValue]: processedValue,
      });
    });
    return mappedItems as unknown as GameServerCreationFormState[keyof GameServerCreationFormState];
  },
  [inputType, objectKey, objectValue, shouldProcessEscapeSequences],
);
```

**Step 5: Add info icon tooltip to value input**

Modify the value Input element (around line 118-127) to include the tooltip icon:

```typescript
<div className="relative flex items-center gap-1">
  <Input
    className={rowError ? "border-red-500" : ""}
    id={`key-value-input-value-${keyValuePair.uuid}`}
    placeholder={placeHolderValueInput}
    value={(keyValuePair.value as string | undefined) || ""}
    onChange={(e) => {
      changeCallback({ ...keyValuePair, value: e.target.value });
    }}
    type={inputType}
  />
  {shouldProcessEscapeSequences && (
    <TooltipWrapper
      tooltip="Supports escape sequences: \n (newline), \t (tab), \r (carriage return), \\ (backslash)"
      side="top"
      asChild={false}
    >
      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
    </TooltipWrapper>
  )}
</div>
```

**Step 6: Commit**

```bash
git add src/components/display/GameServer/CreateGameServer/KeyValueInput.tsx
git commit -m "feat: add escape sequence processing support to KeyValueInput

- Add processEscapeSequences optional prop
- Process \n, \t, \r, \\ in values when enabled
- Display info icon with tooltip when feature is active"
```

---

## Task 3: Enable Feature for Environment Variables

**Files:**
- Modify: `src/components/display/GameServer/CreateGameServer/CreationSteps/Step3.tsx`

**Step 1: Enable processEscapeSequences for environment variables**

Update the KeyValueInput component (around line 56-68) to enable escape sequence processing:

```typescript
<KeyValueInput
  attribute="environment_variables"
  fieldLabel={t("environmentVariablesSelection.title")}
  fieldDescription={t("environmentVariablesSelection.description")}
  errorLabel={t("environmentVariablesSelection.errorLabel")}
  placeHolderKeyInput="KEY"
  placeHolderValueInput="VALUE"
  keyValidator={z.string().min(1)}
  valueValidator={z.string().min(1)}
  inputType={"text"}
  objectKey="key"
  objectValue="value"
  processEscapeSequences={true}
/>
```

**Step 2: Commit**

```bash
git add src/components/display/GameServer/CreateGameServer/CreationSteps/Step3.tsx
git commit -m "feat: enable escape sequences for environment variables

Allows users to enter \n for newlines in env vars like MODRINTH_PROJECTS"
```

---

## Task 4: Verification

**Manual Testing Steps:**

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test escape sequence processing:**
   - Navigate to Create Game Server modal
   - Go to Step 3 (Docker configuration)
   - In Environment Variables section, notice the info icon (ⓘ) next to value inputs
   - Hover over the info icon - tooltip should display: "Supports escape sequences: \n (newline), \t (tab), \r (carriage return), \\ (backslash)"
   - Add an environment variable:
     - Key: `MODRINTH_PROJECTS`
     - Value: `fabric-api\nsodium\niris`
   - Submit the form and verify the backend receives the value with actual newlines (not literal `\n`)

3. **Test other escape sequences:**
   - Test `\t`: Enter value `column1\tcolumn2` - should send actual tab character
   - Test `\r`: Enter value `line1\rline2` - should send actual carriage return
   - Test `\\`: Enter value `path\\to\\file` - should send single backslashes

4. **Test without escape sequences:**
   - Navigate to other KeyValueInput usages (if any) that don't have `processEscapeSequences` enabled
   - Verify they behave normally without the info icon

5. **Browser Console Check:**
   - Open browser dev tools
   - Create a game server with environment variables containing escape sequences
   - Check the network request payload to verify escape sequences are properly converted

**Expected Results:**
- Info icon appears next to value inputs when `processEscapeSequences={true}`
- Tooltip displays on hover with correct escape sequence information
- Escape sequences are converted to actual special characters before submission
- Other KeyValueInput instances without the prop remain unchanged

---

## Notes

- **DRY:** Reused existing TooltipWrapper component and lucide-react icons
- **YAGNI:** Only implemented the four most common escape sequences as requested
- **Backwards Compatible:** Feature is opt-in via prop, existing usages unaffected
- **UX:** Info icon is subtle but discoverable, tooltip provides clear guidance
