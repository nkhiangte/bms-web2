import React, { useEffect } from 'react';

interface SitemapXmlPageProps {
    sitemapContent: string;
}

const SitemapXmlPage: React.FC<SitemapXmlPageProps> = ({ sitemapContent }) => {

    useEffect(() => {
        // Attempt to set the content type, though this may not be respected by all browsers
        // when served from a client-side route. The primary goal is to have the content available.
        document.title = "Sitemap";
    }, []);

    return (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontFamily: 'monospace' }}>
            {sitemapContent}
        </pre>
    );
};

export default SitemapXmlPage;
