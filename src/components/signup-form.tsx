"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { extractErrorMessage, graphqlClient } from "@/lib/graphql";
import { useToast } from "@/components/toast";
import { SIGNUP_MUTATION } from "@/graphQL/accounts";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await graphqlClient.request(SIGNUP_MUTATION, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        provider: "email",
      });
      console.log("Signup response:", response);
      showToast("Account created successfully!", "success");
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Name row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="signup-first-name"
            className="text-sm font-medium text-foreground"
          >
            First name
          </label>
          <input
            id="signup-first-name"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.firstName ? "border-red-400" : "border-border"
              }`}
            {...register("firstName", {
              required: "First name is required",
            })}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="signup-last-name"
            className="text-sm font-medium text-foreground"
          >
            Last name
          </label>
          <input
            id="signup-last-name"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.lastName ? "border-red-400" : "border-border"
              }`}
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.email ? "border-red-400" : "border-border"
            }`}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="signup-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          className={`rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring ${errors.password ? "border-red-400" : "border-border"
            }`}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9.5 text-sm text-primary"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}