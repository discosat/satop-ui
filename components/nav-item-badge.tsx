import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

interface NavItemBadge {
  value: number | (() => Promise<number>) | undefined;
}

export default function NavItemBadge({ value }: NavItemBadge) {
  const state = useRef<"init" | "loading" | "done">("init");
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (state.current !== "init") return;
    if (typeof value === "number") {
      state.current = "done";
      setVal(value);
      return;
    }
    if (!value) {
      return;
    }

    state.current = "loading";
    value().then((num) => setVal(num));
    state.current = "done";
  }, [value, state]);
  if (val === 0) {
    return;
  }

  return (
    val && (
      <Badge variant="destructive" className="ml-0 transition-all">
        {val}
      </Badge>
    )
  );
}
