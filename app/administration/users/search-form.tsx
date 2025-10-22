"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";

interface SearchFormProps {
  initialQuery: string;
}

export default function SearchForm({ initialQuery }: SearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) {
        params.set("query", value);
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-64">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        className="pl-8"
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  );
}
