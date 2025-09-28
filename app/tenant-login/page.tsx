export default function TenantLoginPage() {
  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Tenant Login</h1>
      <p className="text-muted-foreground">Log in to your organization workspace. This is a placeholder page.</p>
      <form className="space-y-3">
        <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Tenant ID or Domain" />
        <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Email" type="email" />
        <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Password" type="password" />
        <button className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm">Sign in</button>
      </form>
    </div>
  );
}
