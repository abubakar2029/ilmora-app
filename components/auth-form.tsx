"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { graphqlClient, UNIFIED_AUTH_MUTATION, extractErrorMessage } from "@/lib/graphql";
import { useToast } from "@/components/toast";
import OAuthButtons from "@/components/oauth-buttons";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const variables: any = {
        provider: "email",
        email: data.email,
        password: data.password,
      };
      
      if (!isLogin) {
        variables.firstName = data.firstName;
        variables.lastName = data.lastName;
      }
      const response = await graphqlClient.request(UNIFIED_AUTH_MUTATION, variables);
      if (isLogin) {
        showToast("Logged in successfully!", "success");
      } else {
        showToast("Account created successfully!", "success");
        setIsLogin(true);
        reset();
      }
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold tracking-tight text-primary">ilmora</span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground lg:text-2xl text-balance">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
          {isLogin ? "Log in to continue your learning journey." : "Start your learning journey with ilmora."}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <OAuthButtons isLoading={isLoading} />
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">or continue with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="signup-first-name" className="text-sm font-medium text-foreground">First name</label>
                <input
                  id="signup-first-name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.firstName ? "border-red-400" : "border-border"}`}
                  {...register("firstName", {
                    required: !isLogin ? "First name is required" : false,
                  })}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="signup-last-name" className="text-sm font-medium text-foreground">Last name</label>
                <input
                  id="signup-last-name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.lastName ? "border-red-400" : "border-border"}`}
                  {...register("lastName", {
                    required: !isLogin ? "Last name is required" : false,
                  })}
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-sm font-medium text-foreground">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.email ? "border-red-400" : "border-border"}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="text-sm font-medium text-foreground">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
              className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.password ? "border-red-400" : "border-border"}`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isLogin ? "Logging in..." : "Creating account..."}
              </>
            ) : (
              isLogin ? "Log in" : "Create account"
            )}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              {"Don't have an account? "}
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => setIsLogin(false)}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => setIsLogin(true)}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
