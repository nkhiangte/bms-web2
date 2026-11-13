import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PodcastEpisode } from '@/types';
import { formatDateForDisplay } from '@/utils';
import { PodcastIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

interface PodcastsPageProps {
  podcasts: PodcastEpisode[];
}

const PodcastsPage: React.FC<PodcastsPageProps> = ({ podcasts }) => {
  const sortedPodcasts = [...podcasts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-[#F4F7FB] min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0B1F3A] border-2 border-[#C9A84C] flex items-center justify-center shadow-md">
              <PodcastIcon className="w-9 h-9 text-[#DFC06B]" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1F3A] tracking-tight">Our Podcasts</h1>
          <p className="mt-3 text-base sm:text-xl text-[#132D52]/80 max-w-2xl mx-auto">
            Listen to the latest episodes featuring insights, stories, and interviews from our school community.
          </p>
        </div>

        {sortedPodcasts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#0B1F3A]/15">
            <PodcastIcon className="w-12 h-12 text-[#0B1F3A]/30 mx-auto mb-4" />
            <p className="text-[#132D52]/70 text-lg">No podcast episodes available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedPodcasts.map(episode => (
              <div key={episode.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] overflow-hidden transition-all flex flex-col">
                {episode.imageUrl ? (
                  <div className="aspect-video relative overflow-hidden bg-[#F4F7FB]">
                    <img
                      src={episode.imageUrl}
                      alt={episode.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/campus.jpg'; }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-[#0B1F3A] flex items-center justify-center">
                    <PodcastIcon className="w-16 h-16 text-[#DFC06B]" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8E6D1B] font-tabular">{formatDateForDisplay(episode.date)}</span>
                    {episode.duration && (
                      <span className="text-xs font-semibold text-[#0B1F3A] bg-[#FBF6E8] border border-[#C9A84C]/50 px-2.5 py-0.5 rounded-full font-tabular">{episode.duration}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">{episode.title}</h3>
                  <p className="text-[#132D52]/80 mb-6 flex-grow text-sm line-clamp-3">{episode.description}</p>
                  
                  {episode.isLiveConference && episode.meetingRoomId ? (
                    <div className="mt-auto pt-4 border-t border-[#0B1F3A]/10 flex justify-center">
                        <Link 
                            to={`/live-conference/${episode.meetingRoomId}`} 
                            className="bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] w-full py-3 rounded-xl font-extrabold text-center transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[48px]"
                        >
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B1F3A] opacity-60"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0B1F3A]"></span>
                            </span>
                            Join Live Conference
                        </Link>
                    </div>
                  ) : episode.audioUrl ? (
                    <div className="mt-auto pt-4 border-t border-[#0B1F3A]/10">
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
                  ) : null}
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
