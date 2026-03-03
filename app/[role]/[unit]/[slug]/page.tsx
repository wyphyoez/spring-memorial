'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Flower2, MapPin, MessageCircle, Shield } from 'lucide-react';
import { HEROES, roleToSlug } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type HeroState = { salute: number; flower: number; commentCount: number; saluted: boolean; flowered: boolean };
type HeroComments = Record<string, string[]>;

export default function HeroDetailPage({ params }: { params: { role: string; unit: string; slug: string } }) {
  const hero = useMemo(
    () => HEROES.find((h) => h.slug === params.slug && h.unitSlug === params.unit && roleToSlug(h.role) === params.role),
    [params.slug, params.unit, params.role]
  );

  const [mounted, setMounted] = useState(false);
  const [heroStats, setHeroStats] = useState<Record<string, HeroState>>({});
  const [comments, setComments] = useState<HeroComments>({});
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    setMounted(true);
    const savedStats = localStorage.getItem('spring-memorial-stats');
    const savedComments = localStorage.getItem('spring-memorial-comments');
    const savedUser = localStorage.getItem('spring-memorial-user');
    if (savedStats) setHeroStats(JSON.parse(savedStats));
    if (savedComments) setComments(JSON.parse(savedComments));
    if (savedUser) setUsername(savedUser);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-stats', JSON.stringify(heroStats));
  }, [heroStats, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-comments', JSON.stringify(comments));
  }, [comments, mounted]);

  if (!hero) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4">Hero not found.</p>
        <Link href="/">
          <Button>Back Home</Button>
        </Link>
      </main>
    );
  }

  const state = heroStats[hero.id] ?? { salute: 0, flower: 0, commentCount: (comments[hero.id] ?? []).length, saluted: false, flowered: false };

  return (
    <main className="mx-auto max-w-3xl px-4 py-4 pb-10 md:px-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/">
          <Button size="icon" variant="outline">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Flower2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">Hero Details</h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative h-64 w-full">
          <Image src={hero.image} alt={hero.name} fill className="object-cover" />
        </div>
        <div className="space-y-3 p-4">
          <h2 className="text-2xl font-semibold">{hero.name}</h2>
          <p className="text-sm text-muted-foreground">{hero.role} • {hero.date}</p>
          <p className="text-sm text-muted-foreground">{hero.desc}</p>
          <p className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4" />{hero.unit}</p>
          <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" />{hero.location}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={state.saluted ? 'default' : 'outline'}
              onClick={() =>
                setHeroStats((prev) => {
                  const current = prev[hero.id] ?? state;
                  return {
                    ...prev,
                    [hero.id]: {
                      ...current,
                      saluted: !current.saluted,
                      salute: Math.max(0, current.salute + (current.saluted ? -1 : 1))
                    }
                  };
                })
              }
            >
              🫡 Salute ({state.salute})
            </Button>
            <Button
              variant={state.flowered ? 'default' : 'outline'}
              onClick={() =>
                setHeroStats((prev) => {
                  const current = prev[hero.id] ?? state;
                  return {
                    ...prev,
                    [hero.id]: {
                      ...current,
                      flowered: !current.flowered,
                      flower: Math.max(0, current.flower + (current.flowered ? -1 : 1))
                    }
                  };
                })
              }
            >
              🌸 Offer Flower ({state.flower})
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-5 space-y-3">
        <h3 className="font-semibold">Comments</h3>
        <div className="space-y-2 rounded-md bg-muted p-3">
          {(comments[hero.id] ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            (comments[hero.id] ?? []).map((item, idx) => (
              <p key={`${item}-${idx}`} className="text-sm">
                • {item}
              </p>
            ))
          )}
        </div>

        {!username ? (
          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <Button>Login to comment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>Enter your name to leave a comment.</DialogDescription>
              </DialogHeader>
              <Input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Your name" />
              <Button
                className="mt-2"
                onClick={() => {
                  if (!tempName.trim()) return;
                  const name = tempName.trim();
                  setUsername(name);
                  localStorage.setItem('spring-memorial-user', name);
                  setTempName('');
                  setLoginOpen(false);
                }}
              >
                Continue
              </Button>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a respectful message..." />
            <Button
              onClick={() => {
                if (!text.trim()) return;
                const newComment = `${username}: ${text.trim()}`;
                setComments((prev) => ({ ...prev, [hero.id]: [...(prev[hero.id] ?? []), newComment] }));
                setHeroStats((prev) => {
                  const current = prev[hero.id] ?? state;
                  return { ...prev, [hero.id]: { ...current, commentCount: current.commentCount + 1 } };
                });
                setText('');
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Post
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
