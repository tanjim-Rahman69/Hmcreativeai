// Source of truth: HM_Creative_AI_Service_Details.xlsx (6 categories, 22 services)
export type Service = { name: string; deliverables: string }
export type Category = { id: string; no: string; title: string; goal: string; accent: string; services: Service[] }

export const CATEGORIES: Category[] = [
  { id: 'digital-marketing', no: '01', title: 'Digital Marketing & Advertising', accent: '#ff2e5b',
    goal: 'Drive targeted traffic, generate leads, and maximize ROAS.',
    services: [
      { name: 'Social Media Marketing (SMM)', deliverables: 'Content calendars, page management, and community engagement' },
      { name: 'Paid Advertising (PPC)', deliverables: 'Meta Ads (Facebook & Instagram), Google Ads, TikTok Ads' },
      { name: 'Search Engine Optimization (SEO)', deliverables: 'On-page, off-page, and technical SEO' },
      { name: 'Email & SMS Marketing', deliverables: 'Automated retention & lead generation campaigns' },
    ] },
  { id: 'graphic-design', no: '02', title: 'Graphic Design & Branding', accent: '#ee0039',
    goal: 'Build strong brand recognition and stop-scroll visual appeal.',
    services: [
      { name: 'Brand Identity Design', deliverables: 'Logos, color palettes, typography, and brand guidelines' },
      { name: 'Social Media Creatives', deliverables: '1:1 promotional banners, 9:16 stories, carousels, and ad visuals' },
      { name: 'Marketing Collateral & Print', deliverables: 'Brochures, catalogs, product packaging, and labels' },
      { name: 'Product Manipulation & Retouching', deliverables: 'High-res commercial product staging' },
    ] },
  { id: 'video-production', no: '03', title: 'Video Production & Motion Graphics', accent: '#ff6a3d',
    goal: 'Boost audience engagement, watch time, and ad conversion rates.',
    services: [
      { name: 'Short-Form Vertical Videos', deliverables: 'Reels, YouTube Shorts, and TikTok edits' },
      { name: 'Promotional & Commercial Ads', deliverables: 'Product video ads and corporate documentaries' },
      { name: 'Motion Graphics & Explainers', deliverables: '2D/3D animated explainers and logo animations' },
      { name: 'AI Video & Voiceover Production', deliverables: 'AI-generated visuals, voiceovers, and sound design' },
    ] },
  { id: 'web-development', no: '04', title: 'Web Design & Development', accent: '#d4143f',
    goal: 'Establish a 24/7 digital storefront and seamless user experience.',
    services: [
      { name: 'E-commerce Store Development', deliverables: 'Shopify, WooCommerce, and custom e-commerce builds' },
      { name: 'Corporate & Portfolio Websites', deliverables: 'Responsive UI/UX design and business websites' },
      { name: 'High-Converting Landing Pages', deliverables: 'Single-product sales funnels' },
      { name: 'Maintenance & Technical Support', deliverables: 'Speed optimization, security updates, and bug fixes' },
    ] },
  { id: 'ecommerce-growth', no: '05', title: 'E-commerce Operations & Growth', accent: '#ff3d71',
    goal: 'Streamline online store operations and turn visitors into buyers.',
    services: [
      { name: 'Marketplace Store Management', deliverables: 'Daraz, Amazon, and local marketplace store setup' },
      { name: 'Catalog & Inventory Management', deliverables: 'Product listing, pricing updates, and feed syncing' },
      { name: 'Conversion Rate Optimization', deliverables: 'A/B testing checkout flows and product pages' },
      { name: 'Analytics & Tracking Setup', deliverables: 'Meta Pixel, CAPI, and Google Analytics 4 setup' },
    ] },
  { id: 'ai-automation', no: '06', title: 'AI & Automation Solutions', accent: '#c1002e',
    goal: 'Reduce production turnaround time and lower operational costs.',
    services: [
      { name: 'AI Content & Visual Generation', deliverables: 'AI-assisted commercial imagery and multilingual voiceovers' },
      { name: 'Chatbot & Inbox Automation', deliverables: 'Automated Messenger/WhatsApp customer support bots' },
      { name: 'Workflow Automation', deliverables: 'CRM integration and automated order/lead tracking' },
    ] },
]
