import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discosat: Platform Overview",
  description:
    "Comprehensive satellite operations and flight planning platform",
};

export default function Page() {
  return (
     <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Home</h1>
          <p className="text-muted-foreground">
            Overview of satellite operations and platform status
          </p>
        </div>
      </div>
    </div>
  );
}
