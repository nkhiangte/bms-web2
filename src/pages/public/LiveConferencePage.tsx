import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { User } from '@/types';

const { useParams, useNavigate } = ReactRouterDOM as any;

interface LiveConferencePageProps {
  user: User | null;
}

const LiveConferencePage: React.FC<LiveConferencePageProps> = ({ user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      alert("Please log in to join the live conference.");
      navigate('/login', { state: { returnTo: `/live-conference/${roomId}` } });
    }
  }, [user, navigate, roomId]);

  if (!user || !roomId) {
    return <div className="min-h-screen flex items-center justify-center bg-[#07162B]">
        <p className="text-white font-semibold">Connecting...</p>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#07162B] w-full overflow-hidden">
        <div className="bg-[#0B1F3A] border-b border-[#C9A84C]/40 p-4 shrink-0 flex items-center justify-between shadow-md">
            <h1 className="text-white font-bold text-lg hidden sm:block">Live Podcast Session</h1>
            <button 
                onClick={() => navigate('/podcasts')} 
                className="px-4 py-2 rounded-lg bg-[#C9A84C] text-[#0B1F3A] font-bold text-sm hover:bg-[#DFC06B] transition-colors ml-auto"
            >
                Back to Podcasts
            </button>
        </div>
        <div className="flex-grow w-full relative">
            <JitsiMeeting
                roomName={roomId}
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableModeratorIndicator: true,
                    startScreenSharing: true,
                    enableEmailInStats: false,
                }}
                interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                }}
                userInfo={{
                    displayName: user.displayName || 'Guest User',
                    email: user.email || ''
                }}
                onApiReady={() => {}}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                }}
            />
        </div>
    </div>
  );
};

export default LiveConferencePage;
