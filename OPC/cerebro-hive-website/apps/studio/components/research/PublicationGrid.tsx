"use client";

import React, { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { allResearchData } from '@/lib/content/research';
import { PublicationCard } from './PublicationCard';
import { SectionHeading } from '../cerebro/SectionHeading';
import { Search, Filter, X } from 'lucide-react';
import { TrackedButton } from '../cerebro/TrackedButton';

const ALL_CATEGORIES = Array.from(new Set(allResearchData.map(r => r.category)));
const ALL_DOMAINS = Array.from(new Set(allResearchData.map(r => r.domain)));

export const PublicationGrid = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchQuery = searchParams.get('q') ?? '';
  const selectedCategory = searchParams.get('type');
  const selectedDomain = searchParams.get('domain');

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

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
              onChange={(e) => updateFilters({ q: e.target.value })}
              className="w-full bg-background border border-border rounded-full py-3 pl-12 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary-accent transition-colors"
            />
            {searchQuery && (
              <TrackedButton
                eventCategory="research"
                eventLabel="Clear search"
                onClick={() => updateFilters({ q: null })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </TrackedButton>
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
                <TrackedButton
                  eventCategory="research"
                  eventLabel="All Domains"
                  eventAction="domain_filter"
                  onClick={() => updateFilters({ domain: null })}
                  className={`text-left text-sm py-1.5 px-3 rounded ${!selectedDomain ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                >
                  All Domains
                </TrackedButton>
                {ALL_DOMAINS.map(domain => (
                  <TrackedButton
                    key={domain}
                    eventCategory="research"
                    eventLabel={domain}
                    eventAction="domain_filter"
                    onClick={() => updateFilters({ domain })}
                    className={`text-left text-sm py-1.5 px-3 rounded ${selectedDomain === domain ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                  >
                    {domain}
                  </TrackedButton>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-primary mb-4 flex items-center gap-2">
                <Filter size={14} /> Content Type
              </h4>
              <div className="flex flex-col gap-2">
                <TrackedButton
                  eventCategory="research"
                  eventLabel="All Types"
                  eventAction="category_filter"
                  onClick={() => updateFilters({ type: null })}
                  className={`text-left text-sm py-1.5 px-3 rounded ${!selectedCategory ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                >
                  All Types
                </TrackedButton>
                {ALL_CATEGORIES.map(cat => (
                  <TrackedButton
                    key={cat}
                    eventCategory="research"
                    eventLabel={cat.replace('-', ' ')}
                    eventAction="category_filter"
                    onClick={() => updateFilters({ type: cat })}
                    className={`text-left text-sm py-1.5 px-3 rounded capitalize ${selectedCategory === cat ? 'bg-primary-accent/10 text-primary-accent font-bold' : 'text-text-secondary hover:bg-surface'}`}
                  >
                    {cat.replace('-', ' ')}
                  </TrackedButton>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="col-span-1 lg:col-span-9">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted">{filteredData.length} Results Found</span>
              {(selectedCategory || selectedDomain || searchQuery) && (
                <TrackedButton
                  eventCategory="research"
                  eventLabel="Clear all filters"
                  onClick={() => {
                    updateFilters({ q: null, type: null, domain: null });
                  }}
                  className="text-xs font-bold text-primary-accent hover:underline"
                >
                  Clear all filters
                </TrackedButton>
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
                <p className="text-sm text-text-secondary max-w-md">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
