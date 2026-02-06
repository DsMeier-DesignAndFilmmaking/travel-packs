import type { CityPack, VersionedSection } from '@/types/cityPack';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

function SectionCard({ section }: { section: VersionedSection }) {
  const { title, description, criticalAlert, summaryStats, tips } = section.payload;

  return (
    <section className="py-12 border-b border-gray-100 last:border-0">
      {/* Title: Bold & Editorial */}
      <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-[#222222]">
        {title}
      </h2>
      
      {/* Critical Alert: Styled like a high-end callout box */}
      {criticalAlert && (
        <div className="bg-[#F7F7F7] border border-gray-200 p-6 rounded-2xl mb-8 flex gap-4">
          <span className="text-xl shrink-0">💡</span>
          <div className="prose prose-sm italic leading-relaxed text-[#484848]">
            <ReactMarkdown>{criticalAlert}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-lg max-w-none text-[#484848] leading-relaxed mb-10">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>

      {/* Stats Grid: Mapping exactly to your JSON structure */}
      {summaryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 my-8 border-y border-gray-100">
          {summaryStats.map((stat, i) => (
            <div key={i} className="flex flex-col border-l border-gray-200 pl-4 first:border-l-0 first:pl-0">
              <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                {stat.label}
              </span>
              <div className="text-lg font-semibold text-[#222222]">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expert Tips: High-contrast list */}
      {tips && tips.length > 0 && (
        <div className="mt-10">
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Pro Tips</h4>
          <ul className="space-y-6">
            {tips.map((tip: string, i: number) => (
              <li key={i} className="flex gap-4 text-[16px] text-[#484848] border-b border-gray-50 pb-4 last:border-0">
                <span className="text-[#FF385C] font-bold">●</span>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{tip}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function CityPackDetailView({ pack }: { pack: CityPack }) {
  if (!pack || !pack.id) return null;

  const sections = pack.sections ? Object.values(pack.sections) : [];

  return (
    <article className="min-h-screen bg-white">
      {/* Main Content Container */}
      <div className="max-w-[850px] mx-auto px-6 pt-20 pb-24">
        
        {/* Header Section */}
        <header className="mb-20">
          <div className="h-[2px] w-16 bg-[#222222] mb-12"></div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#222222] mb-6">
            {pack.city}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-[12px] font-bold uppercase tracking-[0.25em] text-gray-400">
            <span>{pack.country}</span>
            <span className="text-gray-200">/</span>
            <span>{pack.region}</span>
            <span className="text-gray-200">/</span>
            <span className="text-[#222222] border-b-2 border-[#222222] pb-1">
              {pack.currency.symbol} {pack.currency.code}
            </span>
          </div>
        </header>

        {/* Content Section */}
        <main className="space-y-4">
          {sections.map((section, idx) => (
            <SectionCard key={idx} section={section} />
          ))}
        </main>

        {/* Footer info (Timestamp) */}
        <footer className="mt-20 pt-8 border-t border-gray-100 text-[11px] text-gray-400 uppercase tracking-widest">
          Updated {new Date(pack.updatedAt).toLocaleDateString()} • Version {pack.version}
        </footer>
      </div>
    </article>
  );
}