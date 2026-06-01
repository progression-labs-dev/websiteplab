import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from './experiment/data/siteContent'

const SITE_URL = 'https://www.progressionlabs.com'

// The homepage hosts the dated blog sections, so its freshness tracks the newest
// post date — this keeps the sitemap honest without a hardcoded, stale value.
function latestContentDate(): Date {
  const newest = BLOG_POSTS.reduce<string | null>(
    (acc, post) => (!acc || post.date > acc ? post.date : acc),
    null,
  )
  return newest ? new Date(`${newest}T00:00:00Z`) : new Date()
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: latestContentDate(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/tools/mosaic`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
