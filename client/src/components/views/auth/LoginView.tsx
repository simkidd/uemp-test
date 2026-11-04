"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api/auth.api";
import { ROLE_DASHBOARD_ROUTES } from "@/constants";
import { toast } from "sonner";
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldError,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Please enter your Email, Matric Number, or Staff ID")
    .trim(),
  password: z.string().min(1, "Please enter your portal password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "Password123!",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormData) =>
      authApi.login({
        identifier: values.identifier.trim(),
        password: values.password,
      }),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success(
        `Welcome back, ${data.user.firstName} ${data.user.lastName}!`,
        {
          description: `Signed in as ${data.user.role.replace("_", " ")}`,
        },
      );

      const redirectParam = searchParams.get("redirect");
      let targetRoute = ROLE_DASHBOARD_ROUTES[data.user.role] || "/student";

      if (redirectParam && redirectParam.startsWith("/")) {
        if (
          data.user.role === "STUDENT" &&
          redirectParam.startsWith("/student")
        ) {
          targetRoute = redirectParam;
        } else if (
          data.user.role === "LECTURER" &&
          redirectParam.startsWith("/lecturer")
        ) {
          targetRoute = redirectParam;
        } else if (
          data.user.role === "DEPARTMENT_ADMIN" &&
          redirectParam.startsWith("/dept-admin")
        ) {
          targetRoute = redirectParam;
        } else if (
          data.user.role === "SUPER_ADMIN" &&
          redirectParam.startsWith("/admin")
        ) {
          targetRoute = redirectParam;
        }
      }

      router.push(targetRoute);
    },
    onError: (err: unknown) => {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMsg =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Invalid credentials provided.";
      toast.error("Authentication Failed", {
        description: errorMsg,
      });
    },
  });

  const onSubmit = (values: LoginFormData) => {
    loginMutation.mutate(values);
  };

  const isBusy = loginMutation.isPending || isSubmitting;

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Portal Sign In
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Sign in with your institutional email, matric number, or staff ID.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldSet disabled={isBusy}>
            <FieldGroup className="gap-4">
              {/* Identifier Input */}
              <Field data-invalid={!!errors.identifier} className="gap-1.5">
                <FieldLabel htmlFor="identifier" className="text-xs font-medium">
                  Institutional Identifier
                </FieldLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Email, Matric No, or Staff ID"
                    {...register("identifier")}
                    className={`pl-9.5 h-10 ${
                      errors.identifier
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={isBusy}
                    autoComplete="username"
                  />
                </div>
                {errors.identifier && (
                  <FieldError className="text-[11px]">
                    {errors.identifier.message}
                  </FieldError>
                )}
              </Field>

              {/* Password Input */}
              <Field data-invalid={!!errors.password} className="gap-1.5">
                <FieldLabel htmlFor="password" className="text-xs font-medium">
                  Password
                </FieldLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    {...register("password")}
                    className={`pl-9.5 pr-10 h-10 ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={isBusy}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <FieldError className="text-[11px]">
                    {errors.password.message}
                  </FieldError>
                )}
              </Field>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isBusy}
                className="w-full h-10 text-xs font-semibold bg-burgundy-700 hover:bg-burgundy-800 text-white shadow-xs transition-colors cursor-pointer mt-2"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  );
}
