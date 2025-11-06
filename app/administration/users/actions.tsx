"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditUserModal } from "./edit-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import type { User } from "@/app/api/users/types";
import { deleteUser, updateUserPermissions } from "@/app/api/users/users-service";

interface ActionsProps {
  user: User;
}

export default function Actions({ user }: ActionsProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSaveUser = async (updatedUser: User) => {
    try {
      await updateUserPermissions(user.id, {
        role: updatedUser.role,
      });
      setEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
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
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setEditDialogOpen(true);
            }}
          >
            Edit user
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteDialogOpen(true);
            }}
          >
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserModal
        dialogOpen={editDialogOpen}
        setDialogOpen={setEditDialogOpen}
        user={user}
        onSave={handleSaveUser}
        onCancel={handleCancelEdit}
      />

      <DeleteUserModal
        dialogOpen={deleteDialogOpen}
        setDialogOpen={setDeleteDialogOpen}
        user={user}
        onDelete={handleDeleteUser}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
