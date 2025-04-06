import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import EditUserModal from "./edit-user-modal";
import { User } from "./page";

interface ActionsProps {
  user: User;
}

export default function Actions({ user }: ActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSaveUser = (updatedUser: User) => {
    // Handle saving the updated user data
    console.log("Saving user:", updatedUser);
    // Implement your save logic here
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}
          >
            Edit user
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserModal
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        user={user}
        onSave={handleSaveUser}
        onCancel={handleCancel}
      />
    </>
  );
}
