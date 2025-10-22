import { Badge } from "@/components/ui/badge";
import { Eye, SatelliteDish, ShieldPlus } from "lucide-react";
import type { UserRole } from "@/app/api/users/types";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const classes: Record<UserRole, string> = {
    ADMIN: "bg-purple-800 text-purple-100 hover:bg-purple-800",
    VIEWER: "bg-gray-800 text-gray-100 hover:bg-gray-800",
    OPERATOR: "bg-green-800 text-green-100 hover:bg-green-800",
  };
  const icons: Record<UserRole, React.ReactNode> = {
    ADMIN: <ShieldPlus className="w-4 h-4" />,
    VIEWER: <Eye className="w-4 h-4" />,
    OPERATOR: <SatelliteDish className="w-4 h-4" />,
  };
  return (
    <Badge
      className={"capitalize inline-flex gap-1 " + classes[role]}
      variant="outline"
    >
      {icons[role]}
      <span>{role.toLowerCase()}</span>
    </Badge>
  );
}
