import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Spring Memorial',
    short_name: 'Memorial',
    description: 'A memorial web app honoring fallen heroes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e11d48',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ]
  };
}
