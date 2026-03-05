'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WIKI_MAP: Record<string, string> = {
  'araken-army': 'Arakan_Army',
  'student-armed-force': 'Student_army',
  'peoples-defend-force-mandalay': 'People%27s_Defence_Force'
};

type WikiSummary = {
  title: string;
  extract: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source?: string };
};

export default function ArmyDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<WikiSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const wikiTitle = useMemo(() => WIKI_MAP[slug] ?? slug, [slug]);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`);
        if (!res.ok) throw new Error('Unable to load Wikipedia summary');
        const json = (await res.json()) as WikiSummary;
        if (active) setData(json);
      } catch {
        if (active) setError('Could not fetch data from Wikipedia in this environment.');
      } finally {
        if (active) setLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [wikiTitle]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background px-4 py-6">
      <section className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`https://en.wikipedia.org/wiki/${wikiTitle}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" /> Open on Wikipedia
            </Button>
          </Link>
        </div>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Army Details
          </p>

          {loading ? <p className="text-sm text-muted-foreground">Loading Wikipedia summary...</p> : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          {data ? (
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold">{data.title}</h1>
              {data.thumbnail?.source ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.thumbnail.source} alt={data.title} className="max-h-72 w-full rounded-xl object-cover" />
              ) : null}
              <p className="text-sm leading-relaxed text-foreground/90">{data.extract}</p>
              {data.content_urls?.desktop?.page ? (
                <Link href={data.content_urls.desktop.page} target="_blank" className="text-sm text-primary underline">
                  Read full article
                </Link>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
