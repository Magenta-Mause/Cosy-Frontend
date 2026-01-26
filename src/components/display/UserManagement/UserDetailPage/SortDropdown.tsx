import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpWideNarrow } from "lucide-react";
import { useTranslation } from "react-i18next";

export type SortField = "username" | "role" | "max_cpu" | "max_memory";

interface SortControlProps {
  sortField: SortField | null;
  isAscending: boolean;
  onSortFieldChange: (field: SortField | null) => void;
  onSortDirectionToggle: () => void;
}

const SortDropdown = ({
  sortField,
  isAscending,
  onSortFieldChange,
  onSortDirectionToggle,
}: SortControlProps) => {
  const { t } = useTranslation();

  const sortOptions: { field: SortField; labelKey: string }[] = [
    { field: "username", labelKey: "name" },
    { field: "role", labelKey: "role" },
    { field: "max_cpu", labelKey: "cpuLimit" },
    { field: "max_memory", labelKey: "memoryLimit" },
  ];

  const getLabel = (field: SortField) => {
    const option = sortOptions.find((o) => o.field === field);
    return option ? t(`components.userManagement.userTable.sortBy.${option.labelKey}`) : "";
  };

  return (
    <div className="flex flex-row items-center gap-0.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-r-none">
            {sortField ? getLabel(sortField) : t("components.userManagement.userTable.sort")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {sortOptions.map(({ field, labelKey }) => (
            <DropdownMenuItem key={field} onClick={() => onSortFieldChange(field)}>
              {t(`components.userManagement.userTable.sortBy.${labelKey}`)}
            </DropdownMenuItem>
          ))}

          {sortField && (
            <>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onSortFieldChange(null)}
              >
                {t("components.userManagement.userTable.clearSort")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        disabled={!sortField}
        onClick={onSortDirectionToggle}
        className="rounded-l-none"
      >
        {!sortField ? (
          <ArrowUpDown className="size-6" />
        ) : isAscending ? (
          <ArrowDownWideNarrow className="size-6" />
        ) : (
          <ArrowUpWideNarrow className="size-6" />
        )}
      </Button>
    </div>
  );
};

export default SortDropdown;
