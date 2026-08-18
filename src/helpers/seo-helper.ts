/**
 * SEO & Meta Tag Management Helper for CodeBazaar
 * Dynamically synchronizes document title, canonical URL, meta description, OpenGraph, and Twitter tags.
 */

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  schema?: object;
}

const DEFAULT_SEO = {
  title: 'CodeBazaar — Flat ₹50 Code Marketplace | React, Next.js & UI Templates',
  description: 'Download production-ready React, Next.js, and full-stack project templates for flat ₹50. Instant source code ZIP download with commercial license.',
  canonicalUrl: 'https://code-bazaar.vercel.app',
  ogImage: 'https://code-bazaar.vercel.app/codebazaar.png',
};

export function updateSEO({
  title,
  description,
  canonicalPath = '',
  ogImage,
  ogType = 'website',
  schema,
}: SEOProps) {
  const fullTitle = title || DEFAULT_SEO.title;
  const fullDescription = description || DEFAULT_SEO.description;
  const fullUrl = `${DEFAULT_SEO.canonicalUrl}${canonicalPath}`;
  const fullImage = ogImage || DEFAULT_SEO.ogImage;

  // 1. Update Document Title
  document.title = fullTitle;

  // 2. Update Standard Meta Description
  setMetaTag('name', 'description', fullDescription);

  // 3. Update Canonical URL Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullUrl);

  // 4. Update OpenGraph Tags
  setMetaTag('property', 'og:title', fullTitle);
  setMetaTag('property', 'og:description', fullDescription);
  setMetaTag('property', 'og:url', fullUrl);
  setMetaTag('property', 'og:image', fullImage);
  setMetaTag('property', 'og:type', ogType);

  // 5. Update Twitter Card Tags
  setMetaTag('name', 'twitter:title', fullTitle);
  setMetaTag('name', 'twitter:description', fullDescription);
  setMetaTag('name', 'twitter:image', fullImage);

  // 6. Dynamic JSON-LD Schema (if provided)
  let dynamicScript = document.getElementById('dynamic-page-schema') as HTMLScriptElement;
  if (schema) {
    if (!dynamicScript) {
      dynamicScript = document.createElement('script');
      dynamicScript.id = 'dynamic-page-schema';
      dynamicScript.type = 'application/ld+json';
      document.head.appendChild(dynamicScript);
    }
    dynamicScript.textContent = JSON.stringify(schema);
  } else if (dynamicScript) {
    dynamicScript.remove();
  }
}

function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
