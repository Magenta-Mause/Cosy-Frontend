import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import filterIcon from "@/assets/icons/filter.svg";
import sortDownIcon from "@/assets/icons/sortDown.svg";
import sortUpIcon from "@/assets/icons/sortUp.svg";

export type SortField = "username" | "role" | "docker_max_cpu_cores" | "docker_memory_limit";

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

  const SORT_OPTIONS: SortField[] = [
    "username",
    "role",
    "docker_max_cpu_cores",
    "docker_memory_limit",
  ];

  const getLabel = (field: SortField) => t(`components.userManagement.userTable.sortBy.${field}`);

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
      <Button disabled={!sortField} onClick={onSortDirectionToggle} className="rounded-l-none">
        {!sortField ? (
          <img src={filterIcon} alt="Filter Icon" className="aspect-square" />
        ) : isAscending ? (
          <img src={sortDownIcon} alt="Sort Down Icon" className="aspect-square" />
        ) : (
          <img src={sortUpIcon} alt="Sort Up Icon" className="aspect-square" />
        )}
      </Button>
    </div>
  );
};

export default SortDropdown;
