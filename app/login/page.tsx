import AppShell from "@/components/app-shell";
import AuthForm from "@/components/auth-form";
import { ToastProvider } from "@/components/toast";
import LoginForm from "@/components/login-form";
import AuthPage from "@/components/auth-page";

export default function LoginPage() {
  return (
    <ToastProvider>
      <AppShell>
        <div className="flex min-h-[60dvh] items-center justify-center py-8">
          <AuthPage mode="login" />
        </div>
      </AppShell>
    </ToastProvider>
  );
}
