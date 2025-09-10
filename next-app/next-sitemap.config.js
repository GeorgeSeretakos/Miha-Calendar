/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mihabodytecgreece.gr',
  generateRobotsTxt: false, // we already created robots.txt manually
  changefreq: 'weekly',
  priority: 0.7,
  outDir: 'public', // Ensure Netlify serves the files
  trailingSlash: true,

  // TEMP: explicitly list key routes so the sitemap isn't empty.
  // Replace with your actual routes; keep '/' for the homepage.
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/blog'),
    await config.transform(config, '/collab'),
    await config.transform(config, '/company'),
    await config.transform(config, '/contact'),
    await config.transform(config, '/ems'),
    await config.transform(config, '/product'),
    await config.transform(config, '/privacy-policy'),
  ],
};