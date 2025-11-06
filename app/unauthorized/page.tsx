// app/unauthorized/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            This page requires specific permissions that your account doesn&apos;t have. 
            Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button asChild variant="default">
            <Link href="/platform">Go to Platform</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/logout">Logout</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
