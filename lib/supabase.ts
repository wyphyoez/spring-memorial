import { slugify, type Hero } from '@/lib/data';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function hasConfig() {
  return Boolean(url && key);
}

function headers() {
  return {
    apikey: key ?? '',
    Authorization: `Bearer ${key ?? ''}`,
    'Content-Type': 'application/json'
  };
}

export async function fetchSupabaseHeroes() {
  if (!hasConfig()) return null;
  const res = await fetch(`${url}/rest/v1/heroes?select=*&order=date.desc`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) throw new Error('heroes fetch failed');
  return (await res.json()) as Hero[];
}

export async function fetchSupabaseHeroByRoute(unitSlug: string, slug: string) {
  if (!hasConfig()) return null;
  const res = await fetch(`${url}/rest/v1/heroes?unitSlug=eq.${unitSlug}&slug=eq.${slug}&select=*&limit=1`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Hero[];
  return rows[0] ?? null;
}

export async function insertSupabaseHero(input: Omit<Hero, 'id' | 'slug' | 'unitSlug'> & { slug?: string; unitSlug?: string }) {
  if (!hasConfig()) throw new Error('Supabase config missing');

  const payload = {
    ...input,
    slug: input.slug?.trim() || slugify(input.name),
    unitSlug: input.unitSlug?.trim() || slugify(input.unit)
  };

  const res = await fetch(`${url}/rest/v1/heroes`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('hero insert failed');
  const rows = (await res.json()) as Hero[];
  return rows[0];
}

export async function signInWithSupabase(identity: string, password: string) {
  if (!hasConfig()) throw new Error('Supabase config missing');
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email: identity, password })
  });

  if (res.ok) return await res.json();

  const signup = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email: identity, password })
  });

  if (!signup.ok) throw new Error('Auth failed');
  return await signup.json();
}

export async function fetchHeroComments(heroId: string) {
  if (!hasConfig()) return null;
  const res = await fetch(`${url}/rest/v1/hero_comments?hero_id=eq.${heroId}&select=content,username,created_at&order=created_at.asc`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as { username: string; content: string }[];
  return rows.map((r) => `${r.username}: ${r.content}`);
}

export async function insertHeroComment(heroId: string, username: string, content: string) {
  if (!hasConfig()) return false;
  const res = await fetch(`${url}/rest/v1/hero_comments`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify({ hero_id: heroId, username, content })
  });
  return res.ok;
}
