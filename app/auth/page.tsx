'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Flower2, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { readAuthUser, writeAuthUser } from '@/lib/auth';

export default function AuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const existing = readAuthUser();
    if (existing) {
      setIdentity(existing.identity);
      setPassword(existing.password);
    }
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identity.trim() || !password.trim()) {
      setError('Email/Username and Password are required.');
      return;
    }

    writeAuthUser({ identity: identity.trim(), password: password.trim() });
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-primary">
          <Flower2 className="h-7 w-7" />
          <div>
            <p className="text-lg font-bold leading-none">Spring Memorial</p>
            <p className="text-[10px] tracking-widest text-muted-foreground">IN MEMORY</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold">Account Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">Login with your Email/Username and Password to comment and interact.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Email / Username</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="pl-9"
                placeholder="you@example.com or username"
              />
            </div>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="pl-9"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <Button type="submit" className="w-full">
            <Mail className="h-4 w-4" />
            Continue
          </Button>

          <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
            Back to memorial wall
          </Link>
        </form>
      </section>
    </main>
  );
}
