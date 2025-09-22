import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScopeBadgeProps {
  scopes: string[] | undefined;
}

export function ScopeBadge({ scopes }: ScopeBadgeProps) {
  return (
    <>
      {scopes && scopes.length > 0 && (
        <Tooltip>
          <TooltipTrigger>
            <Badge className="bg-gray-800 text-gray-300 hover:bg-gray-800">
              +{scopes.length} scopes
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{scopes.join(", ")}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
