import { redirect } from "next/navigation";
import { me } from "./actions/me";

export default async function Page() {
  const session = await me();
  if (!session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
