'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Flower2, MapPin, MessageCircle, Shield } from 'lucide-react';
import { HEROES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type HeroState = { salute: number; flower: number; commentCount: number; saluted: boolean; flowered: boolean };
type HeroComments = Record<string, string[]>;

export default function HeroDetailPage() {
  const params = useParams<{ unit: string; slug: string }>();

  const hero = useMemo(
    () => HEROES.find((h) => h.slug === params.slug && h.unitSlug === params.unit),
    [params.slug, params.unit]
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
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-5 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/">
            <Button size="icon" variant="outline">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Flower2 className="h-5 w-5" />
            <p className="text-xs tracking-[0.2em]">IN MEMORY</p>
          </div>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative h-64 w-full md:h-80">
            <Image src={hero.image} alt={hero.name} fill className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <p className="text-xs uppercase tracking-widest opacity-80">{hero.unit}</p>
              <h1 className="text-2xl font-semibold">{hero.name}</h1>
            </div>
          </div>

          <div className="space-y-4 p-4 md:p-5">
            <p className="text-sm text-muted-foreground">{hero.role} • {hero.date}</p>
            <p className="leading-relaxed text-sm text-foreground/90">{hero.desc}</p>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Shield className="h-4 w-4" /> Served Unit: {hero.unit}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location: {hero.location}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
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
        </article>

        <section className="mt-5 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold">Memories & Comments</h3>
          <div className="space-y-2 rounded-md bg-muted/60 p-3">
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

          <div className="mt-3">
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
          </div>
        </section>
      </section>
    </main>
  );
}
