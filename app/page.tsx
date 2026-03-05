'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { BadgeCheck, ChevronRight, ImagePlus, LogIn, MapPin, MessageCircle, PlusCircle, Search, Settings, Shield, Sun, Moon, User } from 'lucide-react';
import { LANGUAGES, QUOTES, heroHref, slugify, type Hero } from '@/lib/data';
import { clearAuthUser, readAuthUser } from '@/lib/auth';
import { fetchSupabaseHeroes, insertSupabaseHero } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type HeroState = { salute: number; flower: number; commentCount: number; saluted: boolean; flowered: boolean };

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [quote, setQuote] = useState('');
  const [heroStats, setHeroStats] = useState<Record<string, HeroState>>({});
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [username, setUsername] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [language, setLanguage] = useState<string>('EN');

  useEffect(() => {
    setMounted(true);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const savedStats = localStorage.getItem('spring-memorial-stats');
    const savedUser = readAuthUser()?.identity;
    const savedLanguage = localStorage.getItem('spring-memorial-language');
    if (savedStats) setHeroStats(JSON.parse(savedStats));
    if (savedUser) setUsername(savedUser);
    if (savedLanguage) setLanguage(savedLanguage);

    fetchSupabaseHeroes()
      .then((rows) => setHeroes(rows ?? []))
      .catch(() => setHeroes([]));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-stats', JSON.stringify(heroStats));
  }, [heroStats, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-language', language);
  }, [language, mounted]);

  const armyFilters = useMemo(() => ['All', ...Array.from(new Set(heroes.map((h) => h.unit)))], [heroes]);

  const filteredHeroes = useMemo(() => {
    return heroes.filter((hero) => {
      const bySearch = [hero.name, hero.location, hero.unit].join(' ').toLowerCase().includes(search.toLowerCase());
      const byFilter = filter === 'All' || hero.unit === filter;
      return bySearch && byFilter;
    });
  }, [heroes, search, filter]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <TopNav search={search} setSearch={setSearch} setSettingsOpen={setSettingsOpen} username={username} />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 pt-4 md:grid-cols-[320px_1fr] md:px-6">
        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today&apos;s Memory Quote</p>
            <p className="mt-2 text-sm leading-relaxed">“{quote}”</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-semibold">Filter by Army</p>
            <div className="flex flex-wrap gap-2">
              {armyFilters.map((army) => (
                <Button key={army} variant={filter === army ? 'default' : 'outline'} size="sm" onClick={() => setFilter(army)}>
                  {army}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            {username ? (
              <Button className="w-full" onClick={() => setUploadOpen(true)}>
                <PlusCircle className="h-4 w-4" /> Upload Hero Data
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="w-full">
                  <LogIn className="h-4 w-4" /> Login to Upload Hero
                </Button>
              </Link>
            )}
          </div>
        </aside>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fallen Heroes</h2>
            <p className="text-xs text-muted-foreground">{filteredHeroes.length} remembered</p>
          </div>

          {filteredHeroes.length === 0 ? <p className="text-sm text-muted-foreground">No heroes found from Supabase.</p> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredHeroes.map((hero) => (
              <HeroListCard key={hero.id} hero={hero} stats={heroStats[hero.id]} />
            ))}
          </div>
        </div>
      </section>

      <HeroUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onCreated={(hero) => {
          setHeroes((prev) => [hero, ...prev]);
          setUploadOpen(false);
        }}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        username={username}
        language={language}
        onLanguage={setLanguage}
        onLogout={() => {
          setUsername('');
          clearAuthUser();
        }}
      />
    </main>
  );
}

function TopNav({ search, setSearch, setSettingsOpen, username }: { search: string; setSearch: (v: string) => void; setSettingsOpen: (v: boolean) => void; username: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Image src="/icon.svg" alt="Spring Memorial Logo" width={32} height={32} className="h-8 w-8" />
          <div>
            <p className="text-base font-bold leading-none md:text-lg">Spring Memorial</p>
            <p className="text-[9px] tracking-widest text-muted-foreground">IN MEMORY</p>
          </div>
        </div>
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search hero, location or unit..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="hidden md:flex">
            <AvatarFallback>{username ? username.slice(0, 1).toUpperCase() : <User className="h-4 w-4" />}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="space-y-2 px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search hero, location or unit..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
    </header>
  );
}

function HeroListCard({ hero, stats }: { hero: Hero; stats?: HeroState }) {
  const state = stats ?? { salute: 0, flower: 0, commentCount: 0, saluted: false, flowered: false };

  return (
    <Link href={heroHref(hero)} className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 w-full">
        <Image src={hero.image} alt={hero.name} fill className="object-cover transition group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 w-full p-3 text-white">
          <Badge variant="secondary" className="mb-2 border-0 bg-white/20 text-white backdrop-blur">{hero.role}</Badge>
          <h3 className="line-clamp-1 text-lg font-semibold">{hero.name}</h3>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><Shield className="h-4 w-4" />{hero.unit}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{hero.location}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2 text-xs text-muted-foreground"><span>🫡 {state.salute}</span><span>💬 {state.commentCount}</span></div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">Open <ChevronRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  );
}

function HeroUploadDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (hero: Hero) => void }) {
  const [form, setForm] = useState({ name: '', role: 'PDF/EAO', unit: '', location: '', date: '', desc: '', image: '' });
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.name || !form.unit || !form.location || !form.date || !form.desc || !form.image) {
      setError('Please fill all fields.');
      return;
    }

    try {
      const hero = await insertSupabaseHero({
        name: form.name,
        role: form.role as Hero['role'],
        unit: form.unit,
        unitSlug: slugify(form.unit),
        slug: slugify(form.name),
        location: form.location,
        date: form.date,
        desc: form.desc,
        image: form.image
      });
      onCreated(hero);
      setForm({ name: '', role: 'PDF/EAO', unit: '', location: '', date: '', desc: '', image: '' });
      setError('');
    } catch {
      setError('Could not upload hero data to Supabase.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Hero Data</DialogTitle>
          <DialogDescription>Add a new hero entry to Supabase database.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Input placeholder="Hero Name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
          <Input placeholder="Role (PDF/EAO, Student, CDM, Civilian)" value={form.role} onChange={(e) => setForm((v) => ({ ...v, role: e.target.value }))} />
          <Input placeholder="Army / Unit" value={form.unit} onChange={(e) => setForm((v) => ({ ...v, unit: e.target.value }))} />
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm((v) => ({ ...v, location: e.target.value }))} />
          <Input type="date" value={form.date} onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))} />
          <Input placeholder="Image URL" value={form.image} onChange={(e) => setForm((v) => ({ ...v, image: e.target.value }))} />
          <Input placeholder="Description" value={form.desc} onChange={(e) => setForm((v) => ({ ...v, desc: e.target.value }))} />
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <Button onClick={submit} className="w-full"><ImagePlus className="h-4 w-4" />Upload</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({ open, onOpenChange, username, onLogout, language, onLanguage }: { open: boolean; onOpenChange: (v: boolean) => void; username: string; onLogout: () => void; language: string; onLanguage: (v: string) => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your memorial preferences and account access.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm">
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 font-semibold">Account</p>
            {username ? (
              <div className="flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1 text-muted-foreground"><BadgeCheck className="h-4 w-4 text-primary" />Signed in as {username}</p>
                <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>
              </div>
            ) : (
              <Link href="/auth" onClick={() => onOpenChange(false)}>
                <Button className="w-full"><LogIn className="h-4 w-4" />Login to your account</Button>
              </Link>
            )}
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 font-semibold">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}><Sun className="h-4 w-4" />Light</Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}><Moon className="h-4 w-4" />Dark</Button>
            </div>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 font-semibold">Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => <Button key={lang} size="sm" variant={language === lang ? 'default' : 'outline'} onClick={() => onLanguage(lang)}>{lang}</Button>)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
