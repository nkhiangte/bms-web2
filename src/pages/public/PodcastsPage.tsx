import React from 'react';
import { PodcastEpisode } from '@/types';
import { formatDateForDisplay } from '@/utils';
import { PodcastIcon } from '@/components/Icons';

interface PodcastsPageProps {
  podcasts: PodcastEpisode[];
}

const PodcastsPage: React.FC<PodcastsPageProps> = ({ podcasts }) => {
  const sortedPodcasts = [...podcasts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <PodcastIcon className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Our Podcasts</h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
            Listen to the latest episodes featuring insights, stories, and interviews from our school community.
          </p>
        </div>

        {sortedPodcasts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
            <PodcastIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No podcast episodes available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedPodcasts.map(episode => (
              <div key={episode.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden transition-all flex flex-col">
                {episode.imageUrl ? (
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img src={episode.imageUrl} alt={episode.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-indigo-50 flex items-center justify-center">
                    <PodcastIcon className="w-16 h-16 text-indigo-200" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">{formatDateForDisplay(episode.date)}</span>
                    {episode.duration && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{episode.duration}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{episode.title}</h3>
                  <p className="text-slate-600 mb-6 flex-grow text-sm line-clamp-3">{episode.description}</p>
                  
                  {episode.audioUrl && (
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      {episode.audioUrl.includes('spotify') || episode.audioUrl.includes('soundcloud') ? (
                        <iframe 
                          src={episode.audioUrl} 
                          width="100%" 
                          height="152" 
                          frameBorder="0" 
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          className="rounded-lg"
                        ></iframe>
                      ) : (
                        <audio controls className="w-full h-10 rounded-lg">
                          <source src={episode.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastsPage;
