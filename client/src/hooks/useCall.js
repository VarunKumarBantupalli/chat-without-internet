// client/src/hooks/useCall.js
import { useEffect, useRef, useState } from 'react';
import { connectSocket, getSocket } from '../lib/socket';

// MVP: no TURN. Works best on same AP. (We'll add TURN later.)
export default function useCall(meId) {
  // idle | calling | incoming | connecting | in_call
  const [state, setState] = useState('idle');
  const [remoteUser, setRemoteUser] = useState(null);        // { userId }
  const [incomingOffer, setIncomingOffer] = useState(null);  // RTCSessionDescriptionInit
  const [incomingHasVideo, setIncomingHasVideo] = useState(false);

  const localStreamRef = useRef(null);               // MediaStream
  const remoteStreamRef = useRef(new MediaStream()); // MediaStream
  const pcRef = useRef(null);                        // RTCPeerConnection

  const ensureSocket = () => getSocket() || connectSocket();

  // --- utils ---
  const sdpHasVideo = (desc) =>
    typeof desc?.sdp === 'string' && /m=video/.test(desc.sdp);

  const ensurePc = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [] }); // TURN later

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const to = remoteUser?.userId || remoteUser;
      if (!to) return;
      ensureSocket().emit('call:ice', { to, candidate: e.candidate });
    };

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((t) => {
        remoteStreamRef.current.addTrack(t);
      });
    };

    pc.onconnectionstatechange = () => {
      console.log('[pc] connectionState:', pc.connectionState);
      if (pc.connectionState === 'connected') setState('in_call');
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[pc] iceConnectionState:', pc.iceConnectionState);
    };

    pcRef.current = pc;
    return pc;
  };

  // Create/replace local media; add to PC
  const startLocalMedia = async (withVideo) => {
    // stop previous tracks if any
    if (localStreamRef.current) {
      try { localStreamRef.current.getTracks().forEach((t) => t.stop()); } catch {}
    }

    const constraints = withVideo
      ? { audio: true, video: { width: 640, height: 360, frameRate: 24 } }
      : { audio: true, video: false };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;

    const pc = ensurePc();
    // Remove any old senders before adding new tracks
    pc.getSenders().forEach((s) => { try { pc.removeTrack(s); } catch {} });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    return stream;
  };

  const cleanup = () => {
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;

    try { localStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    localStreamRef.current = null;

    remoteStreamRef.current = new MediaStream();
    setRemoteUser(null);
    setIncomingOffer(null);
    setIncomingHasVideo(false);
    setState('idle');
  };

  // --- signaling listeners ---
  useEffect(() => {
    const s = ensureSocket();

    const onRing = ({ from, offer }) => {
      console.log('[sig] incoming offer from', from);
      setRemoteUser({ userId: from });
      setIncomingOffer(offer);
      setIncomingHasVideo(sdpHasVideo(offer));
      setState('incoming');
    };

    const onAnswer = async ({ from, answer }) => {
      console.log('[sig] got answer from', from);
      await ensurePc().setRemoteDescription(new RTCSessionDescription(answer));
      setState('connecting');
    };

    const onIce = async ({ from, candidate }) => {
      try {
        await ensurePc().addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[sig] addIceCandidate error', err?.message);
      }
    };

    const onEnd = ({ from, reason }) => {
      console.log('[sig] call:end', reason || '');
      cleanup();
    };

    s.on('call:ring', onRing);
    s.on('call:answer', onAnswer);
    s.on('call:ice', onIce);
    s.on('call:end', onEnd);

    return () => {
      s.off('call:ring', onRing);
      s.off('call:answer', onAnswer);
      s.off('call:ice', onIce);
      s.off('call:end', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- actions ---
  // Start an AUDIO call
  const callAudio = async (toUser) => callUserInternal(toUser, false);

  // Start a VIDEO call
  const callVideo = async (toUser) => callUserInternal(toUser, true);

  const callUserInternal = async (toUser, withVideo) => {
    const to = toUser?.userId || toUser;
    if (!to) return;

    setRemoteUser({ userId: to });
    setState('calling');

    await startLocalMedia(withVideo);
    const pc = ensurePc();

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: withVideo, // invite remote video if we send video
    });
    await pc.setLocalDescription(offer);

    ensureSocket().emit('call:ring', { to, offer }, (ack) => {
      if (!ack?.ok) {
        console.warn('[sig] call:ring failed', ack?.error);
        cleanup();
      }
    });
  };

  // Accept incoming (match remote offer media)
  const accept = async () => {
    if (!incomingOffer || !remoteUser) return;

    const needVideo = incomingHasVideo;
    await startLocalMedia(needVideo);
    const pc = ensurePc();

    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    ensureSocket().emit('call:answer', { to: remoteUser.userId, answer });
    setIncomingOffer(null);
    setState('connecting');
  };

  const decline = () => {
    if (remoteUser) {
      ensureSocket().emit('call:end', { to: remoteUser.userId, reason: 'decline' });
    }
    cleanup();
  };

  const hangup = () => {
    if (remoteUser) {
      ensureSocket().emit('call:end', { to: remoteUser.userId, reason: 'hangup' });
    }
    cleanup();
  };

  // Controls during call (no renegotiation; we just pause/resume tracks)
  const toggleMute = (mute) => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !mute));
  };

  const toggleCamera = (on) => {
    const v = localStreamRef.current?.getVideoTracks?.()[0];
    if (v) v.enabled = on; // pause/resume video without renegotiation
  };

  return {
    // state
    state,
    remoteUser,
    incomingOffer,
    incomingHasVideo,

    // media
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,

    // actions
    callAudio,
    callVideo,
    accept,
    decline,
    hangup,

    // controls
    toggleMute,
    toggleCamera,
  };
}
