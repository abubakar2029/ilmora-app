export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}
