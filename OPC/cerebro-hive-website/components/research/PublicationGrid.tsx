"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { allResearchData } from '@/lib/content/research';
import { ResearchCategory, ResearchDomain } from '@/lib/content/research/types';
import { PublicationCard } from './PublicationCard';
import { SectionHeading } from '../ui/SectionHeading';
import { Search, Filter, X } from 'lucide-react';

const ALL_CATEGORIES = Array.from(new Set(allResearchData.map(r => r.category)));
const ALL_DOMAINS = Array.from(new Set(allResearchData.map(r => r.domain)));

export const PublicationGrid = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('type'));
  const [selectedDomain, setSelectedDomain] = useState<string | null>(searchParams.get('domain'));

  // Update URL state when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');

    if (selectedCategory) params.set('type', selectedCategory);
    else params.delete('type');

    if (selectedDomain) params.set('domain', selectedDomain);
    else params.delete('domain');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedCategory, selectedDomain, pathname, router]);

  const filteredData = useMemo(() => {
    return allResearchData.filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pub.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            pub.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory ? pub.category === selectedCategory : true;
      const matchesDomain = selectedDomain ? pub.domain === selectedDomain : true;
      
      return matchesSearch && matchesCategory && matchesDomain;
    });
  }, [searchQuery, selectedCategory, selectedDomain]);

  return (
    <section id="publications" className="section-pad border-b border-border bg-surface-elevated">
      <div className="container-wide">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="flex-1">
            <SectionHeading 
              label="Library" 
              title="Research Publications" 
              description="Explore our complete library of original research, reference architectures, and enterprise frameworks." 
            />
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-[400px] relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text"
              placeholder="Search research, topics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-full py-3 pl-12 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary-accent transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-8">
            <div>
              <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-primary mb-4 flex items-center gap-2">
                <Filter size={14} /> Filter by Domain
              </h4>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setSelectedDomain(null)}
                  className={`text-left text-sm py-1.5 px-3 rounded ${!selectedDomain ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                >
                  All Domains
                </button>
                {ALL_DOMAINS.map(domain => (
                  <button 
                    key={domain}
                    onClick={() => setSelectedDomain(domain)}
                    className={`text-left text-sm py-1.5 px-3 rounded ${selectedDomain === domain ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-primary mb-4 flex items-center gap-2">
                <Filter size={14} /> Content Type
              </h4>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left text-sm py-1.5 px-3 rounded ${!selectedCategory ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                >
                  All Types
                </button>
                {ALL_CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left text-sm py-1.5 px-3 rounded capitalize ${selectedCategory === cat ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                  >
                    {cat.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="col-span-1 lg:col-span-9">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted">{filteredData.length} Results Found</span>
              {(selectedCategory || selectedDomain || searchQuery) && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setSelectedDomain(null);
                  }}
                  className="text-xs font-bold text-primary-accent hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredData.map(pub => (
                  <PublicationCard key={pub.id} pub={pub} />
                ))}
              </div>
            ) : (
              <div className="w-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl">
                <Search size={32} className="text-text-muted mb-4 opacity-50" />
                <h3 className="text-lg font-space font-bold text-text-primary mb-2">No publications found</h3>
                <p className="text-sm text-text-secondary max-w-md">Try adjusting your filters or search query to find what you're looking for.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
