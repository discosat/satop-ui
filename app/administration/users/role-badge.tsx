import { Badge } from "@/components/ui/badge";
import { Eye, SatelliteDish, ShieldPlus, TestTubeDiagonal } from "lucide-react";
import { UserRole } from "./page";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const classes = {
    admin: "bg-purple-800 text-purple-100 hover:bg-purple-800",
    scientist: "bg-blue-800 text-blue-100 hover:bg-blue-800",
    viewer: "bg-gray-800 text-gray-100 hover:bg-gray-800",
    Operator: "bg-green-800 text-green-100 hover:bg-green-800",
  };
  const icons = {
    admin: <ShieldPlus className="w-4 h-4" />,
    scientist: <TestTubeDiagonal className="w-4 h-4" />,
    viewer: <Eye className="w-4 h-4" />,
    Operator: <SatelliteDish className="w-4 h-4" />,
  };
  return (
    <Badge
      className={"capitalize inline-flex gap-1 " + classes[role]}
      variant="outline"
    >
      {icons[role]}
      <span>{role}</span>
    </Badge>
  );
}
