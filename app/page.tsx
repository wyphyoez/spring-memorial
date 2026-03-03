'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Flower2,
  HandHeart,
  Home,
  MapPin,
  MessageCircle,
  Search,
  Settings,
  Shield,
  Sun,
  Moon,
  Heart,
  Copy,
  User
} from 'lucide-react';
import { HEROES, QUOTES, type Hero } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type HeroState = { salute: number; flower: number; commentCount: number; saluted: boolean; flowered: boolean };
type HeroComments = Record<string, string[]>;

const roleFilters = ['All', 'PDF/EAO', 'Student', 'CDM', 'Civilian'] as const;
const languages = ['MM', 'EN', 'TH', 'CN', 'KR', 'JP'];

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof roleFilters)[number]>('All');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [quote, setQuote] = useState('');
  const [heroStats, setHeroStats] = useState<Record<string, HeroState>>({});
  const [comments, setComments] = useState<HeroComments>({});
  const [username, setUsername] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
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

  const filteredHeroes = useMemo(() => {
    return HEROES.filter((hero) => {
      const bySearch = [hero.name, hero.location].join(' ').toLowerCase().includes(search.toLowerCase());
      const byFilter = filter === 'All' || hero.role === filter;
      return bySearch && byFilter;
    });
  }, [search, filter]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-4">
      <TopNav search={search} setSearch={setSearch} setDonateOpen={setDonateOpen} setSettingsOpen={setSettingsOpen} username={username} />

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-4 md:px-6">
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
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
            <HeroCard key={hero.id} hero={hero} stats={heroStats[hero.id]} onOpen={() => setSelectedHero(hero)} />
          ))}
        </div>
      </section>

      <MobileBottomNav setDonateOpen={setDonateOpen} setSettingsOpen={setSettingsOpen} />

      {selectedHero && (
        <HeroDialog
          hero={selectedHero}
          open={!!selectedHero}
          onOpenChange={(open) => !open && setSelectedHero(null)}
          data={heroStats[selectedHero.id]}
          comments={comments[selectedHero.id] ?? []}
          username={username}
          onUpdate={(next) =>
            setHeroStats((prev) => ({
              ...prev,
              [selectedHero.id]: { ...defaultHeroState(selectedHero.id, prev), ...next }
            }))
          }
          onCommentAdd={(text) => {
            setComments((prev) => ({ ...prev, [selectedHero.id]: [...(prev[selectedHero.id] ?? []), `${username}: ${text}`] }));
            setHeroStats((prev) => {
              const current = defaultHeroState(selectedHero.id, prev);
              return { ...prev, [selectedHero.id]: { ...current, commentCount: current.commentCount + 1 } };
            });
          }}
          onLogin={(name) => {
            setUsername(name);
            localStorage.setItem('spring-memorial-user', name);
          }}
        />
      )}

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} username={username} onLogout={() => {
        setUsername('');
        localStorage.removeItem('spring-memorial-user');
      }} />
      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
    </main>
  );
}

function defaultHeroState(id: string, current: Record<string, HeroState>) {
  return current[id] ?? { salute: Math.floor(Math.random() * 200) + 20, flower: Math.floor(Math.random() * 50) + 5, commentCount: 0, saluted: false, flowered: false };
}

function TopNav({ search, setSearch, setDonateOpen, setSettingsOpen, username }: { search: string; setSearch: (v: string) => void; setDonateOpen: (v: boolean) => void; setSettingsOpen: (v: boolean) => void; username: string; }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Logo />
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search hero or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="hidden md:inline-flex" onClick={() => setDonateOpen(true)}><HandHeart className="h-4 w-4" />Donate</Button>
          <Button variant="ghost" size="icon" onClick={() => setDonateOpen(true)} className="md:hidden"><HandHeart className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}><Settings className="h-5 w-5" /></Button>
          <Avatar className="hidden md:flex"><AvatarFallback>{username ? username.slice(0, 1).toUpperCase() : <User className="h-4 w-4" />}</AvatarFallback></Avatar>
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

function HeroCard({ hero, stats, onOpen }: { hero: Hero; stats?: HeroState; onOpen: () => void }) {
  const state = stats ?? { salute: 0, flower: 0, commentCount: 0, saluted: false, flowered: false };
  return (
    <button onClick={onOpen} className="overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5">
      <div className="relative h-44 w-full">
        <Image src={hero.image} alt={hero.name} fill className="object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <Badge variant="secondary">{hero.role}</Badge>
        <h3 className="text-lg font-semibold">{hero.name}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><Shield className="h-4 w-4" />{hero.unit}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{hero.location}</p>
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="pointer-events-none"><span>🫡</span>{state.salute}</Button>
          <Button size="sm" variant="outline" className="pointer-events-none"><MessageCircle className="h-4 w-4" />{state.commentCount}</Button>
        </div>
      </div>
    </button>
  );
}

function HeroDialog({ hero, open, onOpenChange, data, comments, username, onUpdate, onCommentAdd, onLogin }: { hero: Hero; open: boolean; onOpenChange: (v: boolean) => void; data?: HeroState; comments: string[]; username: string; onUpdate: (v: Partial<HeroState>) => void; onCommentAdd: (text: string) => void; onLogin: (name: string) => void; }) {
  const state = data ?? { salute: 0, flower: 0, commentCount: comments.length, saluted: false, flowered: false };
  const [text, setText] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [tempName, setTempName] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hero.name}</DialogTitle>
          <DialogDescription>{hero.role} • {hero.date}</DialogDescription>
        </DialogHeader>
        <div className="relative mb-3 h-56 w-full overflow-hidden rounded-lg">
          <Image src={hero.image} alt={hero.name} fill className="object-cover" />
        </div>
        <p className="text-sm text-muted-foreground">{hero.desc}</p>
        <p className="mt-1 text-sm"><Shield className="mr-1 inline h-4 w-4" />{hero.unit} • <MapPin className="mr-1 inline h-4 w-4" />{hero.location}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={state.saluted ? 'default' : 'outline'} onClick={() => onUpdate({ saluted: !state.saluted, salute: Math.max(0, state.salute + (state.saluted ? -1 : 1)) })}>🫡 Salute ({state.salute})</Button>
          <Button variant={state.flowered ? 'default' : 'outline'} onClick={() => onUpdate({ flowered: !state.flowered, flower: Math.max(0, state.flower + (state.flowered ? -1 : 1)) })}>🌸 Offer Flower ({state.flower})</Button>
        </div>

        <div className="mt-5 space-y-3">
          <h4 className="font-semibold">Comments</h4>
          <div className="space-y-2 rounded-md bg-muted p-3">
            {comments.length === 0 ? <p className="text-sm text-muted-foreground">No comments yet.</p> : comments.map((item, idx) => <p key={`${item}-${idx}`} className="text-sm">• {item}</p>)}
          </div>
          {!username ? (
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild><Button>Login to comment</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>Enter your name to leave a comment.</DialogDescription>
                </DialogHeader>
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Your name" />
                <Button className="mt-2" onClick={() => {
                  if (!tempName.trim()) return;
                  onLogin(tempName.trim());
                  setTempName('');
                  setLoginOpen(false);
                }}>Continue</Button>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a respectful message..." />
              <Button onClick={() => {
                if (!text.trim()) return;
                onCommentAdd(text.trim());
                setText('');
              }}>Post</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({ open, onOpenChange, username, onLogout }: { open: boolean; onOpenChange: (v: boolean) => void; username: string; onLogout: () => void; }) {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('EN');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your Spring Memorial experience.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm">
          <div>
            <p className="mb-2 font-semibold">Account</p>
            <p className="mb-2 text-muted-foreground">{username ? `Signed in as ${username}` : 'Not logged in'}</p>
            {username && <Button variant="outline" onClick={onLogout}>Logout</Button>}
          </div>
          <div>
            <p className="mb-2 font-semibold">Theme</p>
            <div className="flex gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}><Sun className="h-4 w-4" />Light</Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}><Moon className="h-4 w-4" />Dark</Button>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold">Language</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => <Button key={lang} size="sm" variant={language === lang ? 'default' : 'outline'} onClick={() => setLanguage(lang)}>{lang}</Button>)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DonateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const methods = [
    { label: 'NUGPay', value: 'springmemorial@nugpay.app' },
    { label: 'KBZPay', value: '09-8800-112233' },
    { label: 'USDT (TRC20)', value: 'TNx8XX5YbrBxAxxxxxMemorial' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Support Spring Memorial Organization</DialogTitle>
          <DialogDescription>Your donation helps preserve stories and support families of fallen heroes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {methods.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(item.value)}><Copy className="h-4 w-4" />Copy</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileBottomNav({ setDonateOpen, setSettingsOpen }: { setDonateOpen: (v: boolean) => void; setSettingsOpen: (v: boolean) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur md:hidden">
      <div className="grid grid-cols-3">
        <Button variant="ghost" className="h-14 rounded-none"><Home className="h-5 w-5" />Home</Button>
        <Button variant="ghost" className="h-14 rounded-none" onClick={() => setDonateOpen(true)}><Heart className="h-5 w-5" />Donate</Button>
        <Button variant="ghost" className="h-14 rounded-none" onClick={() => setSettingsOpen(true)}><Settings className="h-5 w-5" />Settings</Button>
      </div>
    </nav>
  );
}
