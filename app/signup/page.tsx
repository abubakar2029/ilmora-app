import AppShell from "@/components/app-shell";
import AuthPage from "@/components/auth-page";
import { ToastProvider } from "@/components/toast";

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
