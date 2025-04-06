import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "./page";

// Define available scopes
const scopes = [
  { value: "global", label: "Global" },
  { value: "organization", label: "Organization" },
  { value: "team", label: "Team" },
  { value: "project", label: "Project" },
  { value: "personal", label: "Personal" },
];

interface EditUserModalProps {
  user: User;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onSave: (user: User) => void;
  onCancel?: () => void;
}

export default function EditUserModal({
  user,
  dialogOpen,
  setDialogOpen,
  onSave,
  onCancel,
}: EditUserModalProps) {
  // Initialize the form with react-hook-form
  const form = useForm<User>({
    defaultValues: user || {
      id: "",
      name: "",
      email: "",
      role: "",
      scope: "",
    },
  });

  // Reset form when user prop changes
  useEffect(() => {
    form.reset(
      user || {
        id: "",
        name: "",
        email: "",
        role: "",
        scope: "",
      }
    );
  }, [user, form]);

  const onSubmit = (data: User) => {
    onSave(data);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to user information and permissions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Scope</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scopes.map((scope) => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This determines the user&apos;s access level across the
                    system
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
