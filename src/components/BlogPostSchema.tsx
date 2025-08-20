import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BlogPostSchemaProps {
  title: string;
  description: string;
  url: string;
}

const BlogPostSchema: React.FC<BlogPostSchemaProps> = ({ title, description, url }) => {
  const schema = {
    "@context": "http://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "GoMutuo",
      "url": "https://gomutuo.it"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default BlogPostSchema;