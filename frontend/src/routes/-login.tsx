import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/-auth-context";
import { ApiError } from "@/lib/api";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Route } from "./login";

type LoginPageProps = {
  // Path to return after sign-in (from ?redirect= search param)
  redirectTo?: string;
};

export function LoginPage({ redirectTo = "/" }: LoginPageProps) {
  const { login, status, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const isLoading = status === "loading";
  const isDisabled = submitting || isLoading;

  // Skip login page if session already restored on mount
  if (status === "authenticated" && user) {
    return <Navigate to={redirectTo} replace></Navigate>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!email && !password) {
        setError("Please provide correct email & password.");
      } else if (!email) {
        setError("Please provide correct email.");
      } else if (!password) {
        setError("Please provide correct password.");
      } else {
        await login(email, password);
        navigate({ to: redirectTo });
      }
    } catch (err) {
      // redirect() throws — rethrow so navigation still works after successful login
      if (err && typeof err === "object" && "isRedirect" in err) {
        throw err;
      }
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-50">
      <Card className="w-full max-w-sm border-slate-800 bg-slate-900/80 ring-slate-700/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-50">
            MASBISA
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <p
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
              >
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isDisabled}
                aria-invalid={error ? true : undefined}
                className="border-slate-700 bg-slate-950 text-slate-50 placeholder:text-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isDisabled}
                aria-invalid={error ? true : undefined}
                className="border-slate-700 bg-slate-950 text-slate-50 placeholder:text-slate-500"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isDisabled}>
              {submitting
                ? "Signing in…"
                : isLoading
                  ? "Checking session…"
                  : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginRoute() {
  const { redirect: redirectTo } = Route.useSearch();
  return <LoginPage redirectTo={redirectTo} />;
}
