import { Router } from 'express';
import { getAllBlogs } from '../db-blogs';

const router = Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://riq-society-clone.manus.space';
    const blogs = await getAllBlogs();
    const publishedBlogs = blogs.filter((blog: any) => blog.published);

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/application', priority: '0.9', changefreq: 'weekly' },
      { url: '/faq', priority: '0.7', changefreq: 'monthly' },
      { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    ];

    const blogPages = publishedBlogs.map((blog: any) => ({
      url: `/blog/${blog.id}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: blog.updatedAt?.toISOString() || blog.createdAt.toISOString(),
    }));

    const allPages: any[] = [...staticPages, ...blogPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page: any) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;

