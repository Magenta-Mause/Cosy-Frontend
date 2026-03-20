import { CpuLimitInput } from "@components/display/CpuLimit/CpuLimitInput";
import { MemoryLimitInput } from "@components/display/MemoryLimit/MemoryLimitInput";
import { Button } from "@components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { CPU_LIMIT_POSITIVE_ERROR, cpuLimitValidator } from "@/lib/validators/cpuLimitValidator";
import {
  MEMORY_LIMIT_MIN_ERROR,
  memoryLimitValidator,
} from "@/lib/validators/memoryLimitValidator";

const ResourceLimitsPage = ({
  user,
  onUnsavedChange,
}: {
  user: UserEntityDto;
  onUnsavedChange?: (dirty: boolean) => void;
}) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.updateDockerLimitsDialog");
  const { t: tModal } = useTranslationPrefix("userSettingsModal");
  const { updateDockerLimits } = useDataInteractions();

  const [cpu, setCpu] = useState<string>(
    user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "",
  );
  const [memory, setMemory] = useState<string>(
    user.docker_hardware_limits?.docker_memory_limit ?? "",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cpuError, setCpuError] = useState<string | undefined>(undefined);
  const [memoryError, setMemoryError] = useState<string | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setCpu(user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "");
    setMemory(user.docker_hardware_limits?.docker_memory_limit ?? "");
    setSubmitError(null);
    setCpuError(undefined);
    setMemoryError(undefined);
  }, [user]);

  const originalCpu = user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "";
  const originalMemory = user.docker_hardware_limits?.docker_memory_limit ?? "";
  const hasChanges = cpu !== originalCpu || memory !== originalMemory;

  useEffect(() => {
    onUnsavedChange?.(hasChanges);
  }, [hasChanges, onUnsavedChange]);

  const handleCpuChange = (val: string) => {
    setCpu(val);
    if (val === "") {
      setCpuError(undefined);
      return;
    }
    const result = cpuLimitValidator.safeParse(val);
    setCpuError(result.success ? undefined : CPU_LIMIT_POSITIVE_ERROR);
  };

  const handleMemoryChange = (val: string) => {
    setMemory(val);
    if (val === "") {
      setMemoryError(undefined);
      return;
    }
    const result = memoryLimitValidator.safeParse(val);
    setMemoryError(result.success ? undefined : MEMORY_LIMIT_MIN_ERROR);
  };

  const handleRevert = () => {
    setCpu(originalCpu);
    setMemory(originalMemory);
    setSubmitError(null);
    setCpuError(undefined);
    setMemoryError(undefined);
  };

  const handleSubmit = async () => {
    if (!user.uuid) return;

    const cpuValue = cpu !== "" ? parseFloat(cpu) : undefined;
    if (cpu !== "" && (Number.isNaN(cpuValue) || cpuValue === undefined)) {
      setCpuError(CPU_LIMIT_POSITIVE_ERROR);
      return;
    }

    setSubmitError(null);
    setIsPending(true);
    try {
      await updateDockerLimits(user.uuid, {
        docker_hardware_limits: {
          docker_max_cpu_cores: cpuValue,
          docker_memory_limit: memory !== "" ? memory : undefined,
        },
      });
    } catch {
      setSubmitError(tModal("submitError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pt-8 pr-5 pl-2">
      <div className="space-y-6 grow min-h-full">
        <div>
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <p className="text-foreground/70 text-sm mt-1">{t("description")}</p>
        </div>

        <div className="flex justify-between gap-5">
          <div className="w-[45%]">
            <CpuLimitInput
              header={t("cpuLabel")}
              description={t("cpuDescription")}
              id="docker-cpu-limit"
              placeholder={t("placeholder")}
              value={cpu}
              onChange={handleCpuChange}
              error={cpuError}
              className="no-spinner"
            />
          </div>
          <div className="w-[50%]">
            <MemoryLimitInput
              id="docker-memory-limit"
              header={t("memoryLabel")}
              description={t("memoryDescription")}
              placeholder={t("placeholder")}
              value={memory}
              onChange={handleMemoryChange}
              error={memoryError}
              className="no-spinner"
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto">
        {submitError && <p className="text-base text-destructive">{submitError}</p>}
        <Button variant="secondary" onClick={handleRevert} disabled={isPending || !hasChanges}>
          {tModal("revert")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !hasChanges || !!cpuError || !!memoryError}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tModal("save")}
        </Button>
      </div>
    </div>
  );
};

export default ResourceLimitsPage;
