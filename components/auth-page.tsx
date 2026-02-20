"use client";

import { useState } from "react";
import Link from "next/link";
import OAuthButtons from "@/components/oauth-buttons";
import LoginForm from "@/components/login-form";
import SignupForm from "@/components/signup-form";

interface AuthPageProps {
    mode: "login" | "signup";
}

export default function AuthPage({ mode }: AuthPageProps) {
    const [isLoading] = useState(false);

    return (
        <div className="mx-auto w-full max-w-lg">
            {/* Header */}
            <div className="mb-8 text-center">
                <Link href="/my-journey" className="inline-block">
                    <span className="text-2xl font-bold tracking-tight text-primary">
                        ilmora
                    </span>
                </Link>
                <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground lg:text-2xl text-balance">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
                    {mode === "login"
                        ? "Log in to continue your learning journey."
                        : "Start your learning journey with ilmora."}
                </p>
            </div>

            {/* Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                {/* OAuth buttons */}
                <OAuthButtons isLoading={isLoading} />

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium text-muted-foreground">
                        or continue with email
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                {/* Form */}
                {mode === "login" ? <LoginForm /> : <SignupForm />}
            </div>

            {/* Switch link */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                    <>
                        {"Don't have an account? "}
                        <Link
                            href="/signup"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Log in
                        </Link>
                    </>
                )}
            </p>
        </div>
    );
}