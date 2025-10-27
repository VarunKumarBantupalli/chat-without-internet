// client/src/components/CallPanel.jsx
import React, { useEffect, useRef, useState } from 'react';
import useCall from '../hooks/useCall';
import useSystemState from '../hooks/useSystemState';

export default function CallPanel({ meId, targetUser }) {
  const {
    state, remoteUser, localStream, remoteStream,
    incomingOffer, incomingHasVideo,
    callAudio, callVideo, accept, decline, hangup,
    toggleMute, toggleCamera
  } = useCall(meId);

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true); // only affects if video was negotiated
  const { running } = useSystemState();

  // Attach streams
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
      localRef.current.muted = true;
      localRef.current.play().catch(() => {});
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
      remoteRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">Call state: <b>{state}</b></div>

      {/* Outgoing controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
  className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50"
  onClick={() => callAudio(targetUser)}
  disabled={!running || !targetUser || state !== 'idle'}
        >
          Audio Call
        </button>

        <button
          className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          onClick={() => callVideo(targetUser)}
          disabled={!running || !targetUser || state !== 'idle'}
        >
          Video Call
        </button>

        <button
          className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          onClick={hangup}
          disabled={state === 'idle'}
        >
          Hang up
        </button>

        <button
          className="px-3 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          onClick={() => { const next = !muted; setMuted(next); toggleMute(next); }}
          disabled={state === 'idle'}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>

        <button
          className="px-3 py-2 bg-blue-700 text-white rounded disabled:opacity-50"
          onClick={() => { const next = !camOn; setCamOn(next); toggleCamera(next); }}
          disabled={state === 'idle'}
          title="Pause/Resume camera (if negotiated)"
        >
          {camOn ? 'Camera Off' : 'Camera On'}
        </button>
      </div>

      {/* Incoming call banner */}
      {state === 'incoming' && remoteUser && (
        <div className="p-3 border rounded bg-yellow-50 flex items-center justify-between">
          <div>
            Incoming {incomingHasVideo ? 'video' : 'audio'} call from <b>{remoteUser.userId}</b>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded" onClick={accept}>Accept</button>
            <button className="px-3 py-1.5 bg-gray-300 rounded" onClick={decline}>Decline</button>
          </div>
        </div>
      )}

      {/* Media */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">Me</div>
          <video ref={localRef} autoPlay playsInline muted className="w-full rounded bg-black" />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Remote</div>
          <video ref={remoteRef} autoPlay playsInline className="w-full rounded bg-black" />
        </div>
      </div>
    </div>
  );
}
