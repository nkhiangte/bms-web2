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
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">Connecting...</p>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 w-full overflow-hidden">
        <div className="bg-slate-800 p-4 shrink-0 flex items-center justify-between shadow-md">
            <h1 className="text-slate-100 font-bold text-lg hidden sm:block">Live Podcast Session</h1>
            <button 
                onClick={() => navigate('/podcasts')} 
                className="btn btn-secondary bg-slate-700 text-slate-200 border-none hover:bg-slate-600 ml-auto"
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
                onApiReady={(externalApi) => {
                    // console.log("Jitsi Meet API ready");
                }}
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
