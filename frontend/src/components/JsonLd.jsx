import { useLocation } from 'react-router-dom';
import {
  organizationJsonLd,
  webSiteJsonLd,
  breadcrumbJsonLd,
  buildBreadcrumbTrail,
  localBusinessJsonLd,
  productJsonLd,
  courseJsonLd,
  normalizePath,
} from '../lib/seo';
import { useSeoContext } from './SeoContext';

function JsonLdBlock({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Injects route-aware structured data — Organization + WebSite on every page */
export default function JsonLd({ extra = [] }) {
  const { pathname } = useLocation();
  const { pageSeo } = useSeoContext();
  const ctx = pageSeo || {};
  const path = normalizePath(pathname);

  const schemas = [organizationJsonLd(), webSiteJsonLd()];

  const crumbs = buildBreadcrumbTrail(pathname, ctx);
  if (crumbs.length > 1) {
    const crumbSchema = breadcrumbJsonLd(crumbs);
    if (crumbSchema) schemas.push(crumbSchema);
  }

  if (path.startsWith('/vendor/') && ctx.vendor) {
    const biz = localBusinessJsonLd(ctx.vendor);
    if (biz) schemas.push(biz);
  }

  if (path.startsWith('/listing/') && ctx.listing) {
    const product = productJsonLd(ctx.listing, {
      vendor: ctx.vendor,
      itemType: ctx.listingType,
    });
    if (product) schemas.push(product);
  }

  if (path.startsWith('/courses/') && ctx.course) {
    const course = courseJsonLd(ctx.course);
    if (course) schemas.push(course);
  }

  if (ctx.jsonLd) {
    const pageExtra = Array.isArray(ctx.jsonLd) ? ctx.jsonLd : [ctx.jsonLd];
    schemas.push(...pageExtra.filter(Boolean));
  }

  if (extra?.length) {
    schemas.push(...extra.filter(Boolean));
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <JsonLdBlock key={`${schema['@type']}-${index}`} data={schema} />
      ))}
    </>
  );
}