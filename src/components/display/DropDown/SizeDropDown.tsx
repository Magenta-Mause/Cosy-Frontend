import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface SizeDropDownProps {
  edit: boolean | null;
  metric: {
    uuid: string;
    size: string;
  };
  handleWidthSelect: (size: number, uuid: string) => void;
}

const SizeDropDown = (props: SizeDropDownProps) => {
  const { edit, metric, handleWidthSelect } = props;

  return (
    <DropdownMenu open={edit ? undefined : false}>
      <DropdownMenuTrigger asChild>
        <Button className="w-full" disabled={!edit}>
          {metric.size.split("-")[2]}
          <ChevronDown className="-m-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-5 bg-primary-modal-background" align="end">
        <DropdownMenuGroup>
          {[2, 3, 6].map((size) => (
            <DropdownMenuItem key={size} onSelect={() => handleWidthSelect(size, metric.uuid)}>
              {size}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SizeDropDown
