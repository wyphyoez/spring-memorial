import { redirect } from 'next/navigation';

export default async function LegacyHeroRoutePage({
  params
}: {
  params: Promise<{ role: string; unit: string; slug: string }>;
}) {
  const { unit, slug } = await params;
  redirect(`/${unit}/${slug}`);
}
