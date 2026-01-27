import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

  const SORT_OPTIONS: SortField[] = ["username", "role", "max_cpu", "max_memory"];

  const getLabel = (field: SortField) =>
    t(`components.userManagement.userTable.sortBy.${field}`);

  return (
    <div className="flex flex-row items-center gap-0.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-r-none">
            {sortField ? getLabel(sortField) : t("components.userManagement.userTable.sort")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {SORT_OPTIONS.map((field) => (
            <DropdownMenuItem key={field} onClick={() => onSortFieldChange(field)}>
              {getLabel(field)}
            </DropdownMenuItem>
          ))}

          {sortField && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
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
