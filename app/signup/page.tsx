import AppShell from "@/components/app-shell";
import AuthForm from "@/components/auth-form";
import { ToastProvider } from "@/components/toast";
import AuthPage from "@/components/auth-page";

export default function SignupPage() {
  return (
    <ToastProvider>
      <AppShell>
        <div className="flex min-h-[60dvh] items-center justify-center py-8">
          <AuthPage mode="signup" />
        </div>
      </AppShell>
    </ToastProvider>
  );
}
