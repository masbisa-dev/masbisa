import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/-auth-context";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  workspace: string;
}

export function HomePage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<HealthStatus>("/api/health")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-50">
      <p className="text-sm text-slate-400">Signed in as {user?.email}</p>
      <Button onClick={() => logout()}>Log Out</Button>
    </div>
  );
}
