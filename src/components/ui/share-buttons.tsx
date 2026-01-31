'use client';

import { Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  domain: string;
  url: string;
}

export function ShareButtons({ domain, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Check out ${domain} - available for just $99 on NotRenewing!`;
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-1">Share:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-[#1DA1F2] hover:bg-gray-100 rounded-lg transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-[#0A66C2] hover:bg-gray-100 rounded-lg transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <button
        onClick={copyToClipboard}
        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
