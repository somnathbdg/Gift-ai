  });

  products[index] = {
    ...normalized,
    id: products[index].id,
    updatedAt: new Date().toISOString()
  };

  res.json({ product: products[index] });
});

// Approve a single product (Admin Protected)
app.post('/api/admin/products/:id/approve', authenticateAdmin, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[index] = {
    ...products[index],
    status: 'active',
    reviewStatus: 'approved',
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, product: products[index] });
});

// Approve all pending products (Admin Protected)
app.post('/api/admin/products/approve-all', authenticateAdmin, (req, res) => {
  let count = 0;
  products = products.map(p => {
    if (p.status === 'needs_review' || p.reviewStatus === 'needs_review') {
      count++;
      return {
        ...p,
        status: 'active',
        reviewStatus: 'approved',
        updatedAt: new Date().toISOString()
      };
    }
    return p;
  });
  res.json({ success: true, count, totalActive: products.filter(p => p.status === 'active').length });
});

app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const removed = products.splice(index, 1);
  res.json({ success: true, removed: removed[0] });
});

app.post('/api/admin/products/reset', authenticateAdmin, (req, res) => {
  products = [...SEED_PRODUCTS];
  res.json({ success: true, count: products.length });
});

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// ==========================================
// 3. VITE MIDDLEWARE & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
app.get('/sitemap.xml', (_req, res) => {
  // Keep this list in sync with the public, canonical SEO landing pages.
  // Only include routes that are intended to be publicly indexable.
  const baseUrl = 'https://shop.todkart.com';
  const pages = [
    '/',
    '/birthday-gifts',
    '/gifts-for-wife',
    '/gifts-for-husband',
    '/gifts-for-dad',
    '/gifts-for-mom',
    '/anniversary-gifts',
    '/gifts-for-boyfriend',
    '/gifts-for-girlfriend',
    '/gifts-for-friend',
    '/gifts-under-500',
    '/gifts-under-1000',
    '/gifts-under-2000',
    '/gifts-under-5000',
    '/diwali-festive',
    '/housewarming',
    '/just-because',
    '/valentines-day',
  ];

  const escapeXml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${escapeXml(`${baseUrl}${page === '/' ? '/' : page}`)}</loc></url>`).join('
')}
</urlset>`;

  res.status(200).type('application/xml').send(xml);
});
app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint not found', path: req.path });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const numericPort = Number(PORT) || 3000;
  app.listen(numericPort, '0.0.0.0', () => {
    console.log(`Perfect Gift AI server listening on http://0.0.0.0:${numericPort}`);
  });
}
