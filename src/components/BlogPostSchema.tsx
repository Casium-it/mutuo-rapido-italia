import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BlogArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  author: string;
  publishedDate?: string;
  modifiedDate?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
}

const BlogArticleSchema: React.FC<BlogArticleSchemaProps> = ({ 
  title, 
  description, 
  url, 
  author,
  publishedDate,
  modifiedDate,
  featuredImage,
  category,
  tags,
  readingTime 
}) => {
  const organizationSchema = {
    "@type": "Organization",
    "@id": "https://gomutuo.it/#organization",
    "name": "GoMutuo",
    "url": "https://gomutuo.it",
    "logo": {
      "@type": "ImageObject",
      "url": "https://gomutuo.it/favicon.png"
    },
    "description": "Piattaforma per trovare il mutuo giusto in Italia con simulazioni avanzate e processo di richiesta completamente online"
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url + "#article",
    "headline": title,
    "description": description,
    "url": url,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": organizationSchema,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    ...(publishedDate && { "datePublished": publishedDate }),
    ...(modifiedDate && { "dateModified": modifiedDate }),
    ...(featuredImage && {
      "image": {
        "@type": "ImageObject",
        "url": featuredImage
      }
    }),
    ...(category && { "articleSection": category }),
    ...(tags && tags.length > 0 && { "keywords": tags.join(", ") }),
    ...(readingTime && { "timeRequired": `PT${readingTime}M` }),
    "inLanguage": "it-IT"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify([organizationSchema, articleSchema])}
      </script>
    </Helmet>
  );
};

export default BlogArticleSchema;