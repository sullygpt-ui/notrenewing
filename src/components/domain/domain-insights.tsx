'use client';

import { Calendar, Clock, Globe, History, Link2, TrendingUp } from 'lucide-react';

interface DomainInsightsProps {
  domainName: string;
  domainAgeMonths: number | null;
  expirationDate: string | null;
  registrar: string | null;
  aiScore: number | null;
  aiTier: string | null;
}

export function DomainInsights({ 
  domainName, 
  domainAgeMonths, 
  expirationDate, 
  registrar,
  aiScore,
  aiTier
}: DomainInsightsProps) {
  
  const formatAge = (months: number | null) => {
    if (!months) return 'Unknown';
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  const getDaysUntilExpiry = (date: string | null) => {
    if (!date) return null;
    const expDate = new Date(date);
    const now = new Date();
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiry = getDaysUntilExpiry(expirationDate);
  const waybackUrl = `https://web.archive.org/web/*/${domainName}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary-500" />
        Domain Insights
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Domain Age */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Domain Age</p>
            <p className="text-gray-900 font-medium">{formatAge(domainAgeMonths)}</p>
          </div>
        </div>

        {/* Days Until Expiry */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Expires In</p>
            <p className={`font-medium ${daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-gray-900'}`}>
              {daysUntilExpiry ? `${daysUntilExpiry} days` : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Registrar */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Globe className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Registrar</p>
            <p className="text-gray-900 font-medium">{registrar || 'Unknown'}</p>
          </div>
        </div>

        {/* AI Score */}
        {aiScore && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Interest Score</p>
              <p className="text-gray-900 font-medium">{Math.round(aiScore)}/100</p>
            </div>
          </div>
        )}
      </div>

      {/* External Links */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Research Links</p>
        <div className="flex flex-wrap gap-2">
          <a 
            href={waybackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary-600 bg-gray-50 px-2 py-1 rounded"
          >
            <History className="w-3 h-3" />
            Wayback Machine
          </a>
          <a 
            href={`https://who.is/whois/${domainName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary-600 bg-gray-50 px-2 py-1 rounded"
          >
            <Link2 className="w-3 h-3" />
            WHOIS
          </a>
          <a 
            href={`https://www.google.com/search?q=site:${domainName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary-600 bg-gray-50 px-2 py-1 rounded"
          >
            <Globe className="w-3 h-3" />
            Google Index
          </a>
        </div>
      </div>
    </div>
  );
}
