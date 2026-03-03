'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Flower2, Globe, MapPin, MessageCircle, Search, Settings, Shield, Sun, Moon, User } from 'lucide-react';
import { HEROES, LANGUAGES, QUOTES, heroHref, type Hero } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type HeroState = { salute: number; flower: number; commentCount: number; saluted: boolean; flowered: boolean };

const roleFilters = ['All', 'PDF/EAO', 'Student', 'CDM', 'Civilian'] as const;

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof roleFilters)[number]>('All');
  const [quote, setQuote] = useState('');
  const [heroStats, setHeroStats] = useState<Record<string, HeroState>>({});
  const [username, setUsername] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [language, setLanguage] = useState<string>('EN');

  useEffect(() => {
    setMounted(true);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const savedStats = localStorage.getItem('spring-memorial-stats');
    const savedUser = localStorage.getItem('spring-memorial-user');
    const savedLanguage = localStorage.getItem('spring-memorial-language');
    if (savedStats) setHeroStats(JSON.parse(savedStats));
    if (savedUser) setUsername(savedUser);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-stats', JSON.stringify(heroStats));
  }, [heroStats, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('spring-memorial-language', language);
  }, [language, mounted]);

  const filteredHeroes = useMemo(() => {
    return HEROES.filter((hero) => {
      const bySearch = [hero.name, hero.location, hero.unit].join(' ').toLowerCase().includes(search.toLowerCase());
      const byFilter = filter === 'All' || hero.role === filter;
      return bySearch && byFilter;
    });
  }, [search, filter]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background">
      <TopNav
        search={search}
        setSearch={setSearch}
        setSettingsOpen={setSettingsOpen}
        username={username}
        language={language}
        setLanguage={setLanguage}
      />

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-4 md:px-6">
        <div className="mb-4 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-background p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily Quote</p>
          <p className="mt-1 text-sm md:text-base">“{quote}”</p>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {roleFilters.map((role) => (
            <Button key={role} variant={filter === role ? 'default' : 'outline'} size="sm" onClick={() => setFilter(role)}>
              {role}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredHeroes.map((hero) => (
            <HeroCard key={hero.id} hero={hero} stats={heroStats[hero.id]} />
          ))}
        </div>
      </section>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        username={username}
        language={language}
        onLanguage={setLanguage}
        onLogout={() => {
          setUsername('');
          localStorage.removeItem('spring-memorial-user');
        }}
      />
    </main>
  );
}

function TopNav({
  search,
  setSearch,
  setSettingsOpen,
  username,
  language,
  setLanguage
}: {
  search: string;
  setSearch: (v: string) => void;
  setSettingsOpen: (v: boolean) => void;
  username: string;
  language: string;
  setLanguage: (v: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-6">
        <Logo />
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search hero or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              className="bg-transparent text-xs outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="hidden md:flex">
            <AvatarFallback>{username ? username.slice(0, 1).toUpperCase() : <User className="h-4 w-4" />}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search hero or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Flower2 className="h-8 w-8 text-primary" />
      <div>
        <p className="text-base font-bold leading-none md:text-lg">Spring Memorial</p>
        <p className="text-[9px] tracking-widest text-muted-foreground">IN MEMORY</p>
      </div>
    </div>
  );
}

function HeroCard({ hero, stats }: { hero: Hero; stats?: HeroState }) {
  const state = stats ?? { salute: 0, flower: 0, commentCount: 0, saluted: false, flowered: false };
  return (
    <Link href={heroHref(hero)} className="overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5">
      <div className="relative h-44 w-full">
        <Image src={hero.image} alt={hero.name} fill className="object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <Badge variant="secondary">{hero.role}</Badge>
        <h3 className="text-lg font-semibold">{hero.name}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          {hero.unit}
        </p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {hero.location}
        </p>
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="pointer-events-none">
            <span>🫡</span>
            {state.salute}
          </Button>
          <Button size="sm" variant="outline" className="pointer-events-none">
            <MessageCircle className="h-4 w-4" />
            {state.commentCount}
          </Button>
        </div>
      </div>
    </Link>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
  username,
  onLogout,
  language,
  onLanguage
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  username: string;
  onLogout: () => void;
  language: string;
  onLanguage: (v: string) => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Mobile-first memorial experience preferences.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm">
          <div>
            <p className="mb-2 font-semibold">Account</p>
            <p className="mb-2 text-muted-foreground">{username ? `Signed in as ${username}` : 'Not logged in'}</p>
            {username && (
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            )}
          </div>
          <div>
            <p className="mb-2 font-semibold">Theme</p>
            <div className="flex gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4" />Light
              </Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4" />Dark
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold">Language</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Button key={lang} size="sm" variant={language === lang ? 'default' : 'outline'} onClick={() => onLanguage(lang)}>
                  {lang}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
