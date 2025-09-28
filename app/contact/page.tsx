export default function ContactPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="text-muted-foreground">We'd love to hear from you. This page is a placeholder.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="rounded-md border bg-background p-2 text-sm" placeholder="Name" />
        <input className="rounded-md border bg-background p-2 text-sm" placeholder="Email" type="email" />
        <input className="sm:col-span-2 rounded-md border bg-background p-2 text-sm" placeholder="Subject" />
        <textarea className="sm:col-span-2 rounded-md border bg-background p-2 text-sm" rows={5} placeholder="Message" />
      </div>
      <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm">Send</button>
      <div className="text-sm text-muted-foreground">Or email us at support@example.com</div>
    </div>
  );
}
