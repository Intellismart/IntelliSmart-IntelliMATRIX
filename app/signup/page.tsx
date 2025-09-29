"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accountType, setAccountType] = useState<"consumer" | "business">("business");
    const [company, setCompany] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    accountType,
                    company: accountType === "business" ? company : undefined
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Sign up failed");
            // redirect to portal onboarding
            router.push("/portal");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Sign up failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            <header>
                <h1 className="text-3xl font-bold">Create your account</h1>
                <p className="text-muted-foreground">Start a 14‑day free trial. No credit card required.</p>
            </header>

            <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="flex gap-2">
                    <button type="button"
                            className={`flex-1 rounded-md border p-2 text-sm ${accountType === "business" ? "bg-primary text-primary-foreground" : "bg-background"}`}
                            onClick={() => setAccountType("business")}>Business
                    </button>
                    <button type="button"
                            className={`flex-1 rounded-md border p-2 text-sm ${accountType === "consumer" ? "bg-primary text-primary-foreground" : "bg-background"}`}
                            onClick={() => setAccountType("consumer")}>Consumer
                    </button>
                </div>
                <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Full name"
                       value={name} onChange={(e) => setName(e.target.value)}/>
                <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Email" type="email"
                       value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Password"
                       type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                {accountType === "business" && (
                    <input className="w-full rounded-md border bg-background p-2 text-sm" placeholder="Company name"
                           value={company} onChange={(e) => setCompany(e.target.value)}/>
                )}
                {error && <div className="text-sm text-red-500">{error}</div>}
                <Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
            </form>

            <div className="text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="underline">Sign in</Link>
            </div>

            <div className="rounded-xl border p-4 bg-card text-card-foreground">
                <div className="font-medium mb-1">Explore first</div>
                <p className="text-sm text-muted-foreground mb-3">You can browse the marketplace before creating an
                    account.</p>
                <div className="flex gap-2">
                    <Link href="/store"><Button size="sm" variant="outline">Explore Marketplace</Button></Link>
                    <Link href="/login"><Button size="sm">Quick Login (Demo)</Button></Link>
                </div>
            </div>
        </div>
    );
}
