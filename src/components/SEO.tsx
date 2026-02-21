"use client";

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Play Chess Online with Friends | Chess Game Online Free No Download | ChessMaster',
  description = 'Play chess online with friends free! Best browser chess game free - no download, no login. AI chess game online for beginners. Chess game online free. Join 10K+ players!',
  canonical = 'https://chessmasterss.vercel.app/',
  type = 'website',
  image = 'https://chessmasterss.vercel.app/og-image.png'
}) => {
  if (typeof window === 'undefined') {
    return null;
  }
  const fullTitle = title.includes('ChessMaster') ? title : `${title} | ChessMaster`;
  
  // Target keywords for SEO
  const keywords = 'play chess online with friends, chess game online no download, browser chess game free, AI chess game online, chess game online free, free chess game without login, chess game for beginners, play chess free, online chess multiplayer, chess vs computer';
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;


