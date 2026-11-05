import { siteConfig, content } from '../config';
import { projects } from '../data/projects';

type Node = Record<string, unknown>;

export const absolute = (path: string) => new URL(path, siteConfig.url).href;
const personId = absolute('/#person');
const websiteId = absolute('/#website');
const imageUrl = absolute('/og.png');

/** Первое число из строки цены: «от 15 000 ₽» даёт 15000, «По запросу» даёт null. */
const minPrice = (price: string) => {
  const digits = price.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
};

const person: Node = {
  '@type': 'Person',
  '@id': personId,
  name: siteConfig.name,
  alternateName: siteConfig.brand,
  jobTitle: siteConfig.role,
  description: siteConfig.description,
  url: siteConfig.url,
  image: imageUrl,
  address: { '@type': 'PostalAddress', addressLocality: siteConfig.location, addressCountry: siteConfig.country },
  knowsLanguage: 'ru',
  knowsAbout: [...new Set(content.stack.flatMap(group => group.items))],
  sameAs: [siteConfig.github, siteConfig.telegram],
  makesOffer: content.pricing.items.map(item => {
    const price = minPrice(item.price);
    return {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: item.title, description: item.description },
      ...(price === null ? {} : { priceSpecification: { '@type': 'PriceSpecification', minPrice: price, priceCurrency: 'RUB' } }),
    };
  }),
};

const website: Node = {
  '@type': 'WebSite',
  '@id': websiteId,
  url: siteConfig.url,
  name: siteConfig.name,
  alternateName: siteConfig.brand,
  inLanguage: 'ru',
  publisher: { '@id': personId },
};

/** Общий граф разметки: человек, сайт и текущая страница. Дополнительные узлы страницы передаются в extra. */
export function buildGraph(options: { path: string; title: string; description: string; extra?: Node[] }) {
  const { path, title, description, extra = [] } = options;
  const pageUrl = absolute(path);
  const page: Node = {
    '@type': path === '/' ? 'ProfilePage' : 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: 'ru',
    isPartOf: { '@id': websiteId },
    about: { '@id': personId },
    primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl, width: 1200, height: 630 },
    ...(path === '/' ? { mainEntity: { '@id': personId } } : {}),
  };
  return { '@context': 'https://schema.org', '@graph': [person, website, page, ...extra] };
}

/** Хлебные крошки для внутренних страниц. */
export function breadcrumbs(items: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.path) })),
  };
}

/** Список работ для страницы «Все работы». */
export function workList(): Node {
  return {
    '@type': 'ItemList',
    name: content.workPageTitle,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: project.name,
        description: project.description,
        url: absolute(project.demo),
        creator: { '@id': personId },
        dateCreated: project.year,
        keywords: project.technologies.join(', '),
      },
    })),
  };
}
