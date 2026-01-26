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

  const getSortFieldLabel = (field: SortField) => {
    const fieldMap = {
      username: t("components.userManagement.userTable.sortBy.name"),
      role: t("components.userManagement.userTable.sortBy.role"),
      max_cpu: t("components.userManagement.userTable.sortBy.cpuLimit"),
      max_memory: t("components.userManagement.userTable.sortBy.memoryLimit"),
    };
    return fieldMap[field];
  };

  return (
    <div className="flex flex-row items-center gap-0.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-r-none">
            {sortField ? (
              <span>{getSortFieldLabel(sortField)}</span>
            ) : (
              t("components.userManagement.userTable.sort")
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onSortFieldChange("username")}>
            {t("components.userManagement.userTable.sortBy.name")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortFieldChange("role")}>
            {t("components.userManagement.userTable.sortBy.role")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortFieldChange("max_cpu")}>
            {t("components.userManagement.userTable.sortBy.cpuLimit")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortFieldChange("max_memory")}>
            {t("components.userManagement.userTable.sortBy.memoryLimit")}
          </DropdownMenuItem>

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
