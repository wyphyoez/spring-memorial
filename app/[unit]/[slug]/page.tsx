'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, MessageCircle, Shield, UserCircle2 } from 'lucide-react';
import { readAuthUser } from '@/lib/auth';
import { fetchHeroComments, fetchSupabaseHeroByRoute, insertHeroComment } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type HeroState = { salute: number; flower: number; commentCount: number; saluted: boolean; flowered: boolean };
type HeroComments = Record<string, string[]>;

export default function HeroDetailPage() {
  const params = useParams<{ unit: string; slug: string }>();

  const [mounted, setMounted] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [hero, setHero] = useState<null | {
    id: string;
    name: string;
    slug: string;
    role: 'PDF/EAO' | 'Student' | 'CDM' | 'Civilian';
    unit: string;
    unitSlug: string;
    location: string;
    date: string;
    desc: string;
    image: string;
  }>(null);
  const [heroStats, setHeroStats] = useState<Record<string, HeroState>>({});
  const [comments, setComments] = useState<HeroComments>({});
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    setMounted(true);
    const savedStats = localStorage.getItem('spring-memorial-stats');
    const savedComments = localStorage.getItem('spring-memorial-comments');
    const savedUser = readAuthUser()?.identity;
    if (savedStats) setHeroStats(JSON.parse(savedStats));
    if (savedComments) setComments(JSON.parse(savedComments));
    if (savedUser) setUsername(savedUser);

    fetchSupabaseHeroByRoute(params.unit, params.slug).then((row) => { setHero(row); setHeroLoaded(true); });
  }, [params.slug, params.unit]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-stats', JSON.stringify(heroStats));
  }, [heroStats, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-comments', JSON.stringify(comments));
  }, [comments, mounted]);


  useEffect(() => {
    if (!hero) return;
    fetchHeroComments(hero.id)
      .then((rows) => {
        if (rows) setComments((prev) => ({ ...prev, [hero.id]: rows }));
      })
      .catch(() => undefined);
  }, [hero]);
  if (!hero) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4">{heroLoaded ? 'Hero not found.' : 'Loading hero details...'}</p>
        <Link href="/">
          <Button>Back Home</Button>
        </Link>
      </main>
    );
  }

  const state = heroStats[hero.id] ?? { salute: 0, flower: 0, commentCount: (comments[hero.id] ?? []).length, saluted: false, flowered: false };

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-5 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/">
            <Button size="icon" variant="outline">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Image src="/icon.svg" alt="Spring Memorial Logo" width={28} height={28} className="h-7 w-7" />
        </div>

        <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            <div className="relative h-64 min-h-80 md:h-full">
              <Image src={hero.image} alt={hero.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r" />
              <div className="absolute bottom-0 w-full p-5 text-white">
                <p className="text-xs uppercase tracking-widest opacity-80">{hero.unit}</p>
                <h1 className="text-3xl font-semibold">{hero.name}</h1>
                <p className="text-sm opacity-90">{hero.role}</p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <p className="leading-relaxed text-sm text-foreground/90">{hero.desc}</p>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Served Unit: {hero.unit}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location: {hero.location}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Date: {hero.date}
                </p>
              </div>

              <Link href={`/army/${hero.unitSlug}`} className="inline-flex">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4" />
                  Army Details (Wikipedia)
                </Button>
              </Link>

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
              <Link href="/auth">
                <Button>
                  <UserCircle2 className="h-4 w-4" />
                  Login to comment
                </Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a respectful message..." />
                <Button
                  onClick={() => {
                    if (!text.trim()) return;
                    const newComment = `${username}: ${text.trim()}`;
                    setComments((prev) => ({ ...prev, [hero.id]: [...(prev[hero.id] ?? []), newComment] }));
                    insertHeroComment(hero.id, username, text.trim()).catch(() => undefined);
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
