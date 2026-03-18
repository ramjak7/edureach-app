"use client";

/**
 * Shared virtual classroom UI for student and tutor.
 * Uses @100mslive/hms-video-store (vanilla JS SDK) — compatible with React 19.
 * Role "tutor" gets screen share capability; "student" does not.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import {
  HMSReactiveStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectPeers,
  selectIsConnectedToRoom,
} from "@100mslive/hms-video-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Users } from "lucide-react";

// Module-level singleton so it survives re-renders
let hmsManager: HMSReactiveStore | null = null;

function getHmsManager(): HMSReactiveStore {
  if (!hmsManager) {
    hmsManager = new HMSReactiveStore();
    hmsManager.triggerOnSubscribe();
  }
  return hmsManager;
}

interface Peer {
  id: string;
  name: string;
  isLocal: boolean;
  videoTrack?: string;
  audioTrack?: string;
}

interface ClassroomProps {
  sessionId: string;
  role: "student" | "tutor";
  displayName: string;
}

export function Classroom({ sessionId, role, displayName }: ClassroomProps) {
  const manager = getHmsManager();
  const hmsActions = manager.getActions();
  const hmsStore = manager.getStore();

  const [status, setStatus] = useState<"loading" | "joining" | "joined" | "left" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Fetch auth token and join
  useEffect(() => {
    let unsubscribeConnected: (() => void) | null = null;
    let unsubscribePeers: (() => void) | null = null;
    let unsubscribeAudio: (() => void) | null = null;
    let unsubscribeVideo: (() => void) | null = null;

    async function joinRoom() {
      try {
        setStatus("loading");
        const res = await fetch(`/api/sessions/${sessionId}/token`);
        const data = await res.json();

        if (!res.ok || !data.token) {
          if (res.status === 425) {
            setErrorMsg("The classroom is not ready yet. Please wait a moment and refresh.");
          } else {
            setErrorMsg(data.error || "Failed to get classroom token");
          }
          setStatus("error");
          return;
        }

        setStatus("joining");

        await hmsActions.join({
          userName: displayName,
          authToken: data.token,
          settings: {
            isAudioMuted: false,
            isVideoMuted: false,
          },
        });

        unsubscribeConnected = hmsStore.subscribe(
          (connected) => {
            if (connected === true) setStatus("joined");
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selectIsConnectedToRoom as any
        );

        unsubscribePeers = hmsStore.subscribe(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (storePeers: any) => setPeers(storePeers || []),
          selectPeers
        );

        unsubscribeAudio = hmsStore.subscribe(
          (enabled: boolean) => setIsAudioOn(enabled),
          selectIsLocalAudioEnabled
        );

        unsubscribeVideo = hmsStore.subscribe(
          (enabled: boolean) => setIsVideoOn(enabled),
          selectIsLocalVideoEnabled
        );
      } catch (err) {
        console.error("[classroom join]", err);
        setErrorMsg("Failed to join classroom. Please refresh and try again.");
        setStatus("error");
      }
    }

    joinRoom();

    return () => {
      unsubscribeConnected?.();
      unsubscribePeers?.();
      unsubscribeAudio?.();
      unsubscribeVideo?.();
    };
  }, [sessionId, displayName, hmsActions, hmsStore]);

  // Attach local video stream
  useEffect(() => {
    if (status !== "joined" || !localVideoRef.current) return;
    hmsActions.attachVideo(
      peers.find((p) => p.isLocal)?.videoTrack ?? "",
      localVideoRef.current
    );
  }, [status, peers, hmsActions]);

  const toggleAudio = useCallback(async () => {
    await hmsActions.setLocalAudioEnabled(!isAudioOn);
  }, [hmsActions, isAudioOn]);

  const toggleVideo = useCallback(async () => {
    await hmsActions.setLocalVideoEnabled(!isVideoOn);
  }, [hmsActions, isVideoOn]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await hmsActions.setScreenShareEnabled(false);
    } else {
      await hmsActions.setScreenShareEnabled(true);
    }
    setIsScreenSharing((prev) => !prev);
  }, [hmsActions, isScreenSharing]);

  const leaveRoom = useCallback(async () => {
    await hmsActions.leave();
    setStatus("left");
    hmsManager = null; // Reset singleton so next join is fresh
  }, [hmsActions]);

  if (status === "loading" || status === "joining") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">
          {status === "loading" ? "Getting classroom ready…" : "Joining classroom…"}
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center p-4">
        <p className="text-destructive font-medium">{errorMsg}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (status === "left") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <p className="text-xl font-semibold">Session ended</p>
        <p className="text-muted-foreground">You have left the classroom.</p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go back
        </Button>
      </div>
    );
  }

  const remotePeers = peers.filter((p) => !p.isLocal);

  return (
    <div className="flex flex-col h-[90vh] bg-black text-white">
      {/* Peer videos */}
      <div className="flex-1 grid gap-1 p-2" style={{
        gridTemplateColumns: remotePeers.length === 0 ? "1fr" : remotePeers.length === 1 ? "1fr 1fr" : "repeat(3, 1fr)",
      }}>
        {/* Local video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">{displayName} (You)</Badge>
            {!isAudioOn && <MicOff className="h-3 w-3 text-red-400" />}
          </div>
        </div>

        {/* Remote peers */}
        {remotePeers.map((peer) => (
          <div key={peer.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              autoPlay
              playsInline
              ref={(el) => {
                if (el) {
                  peerVideoRefs.current.set(peer.id, el);
                  if (peer.videoTrack) hmsActions.attachVideo(peer.videoTrack, el);
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs">{peer.name}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-3 p-4 bg-gray-900">
        <div className="flex items-center gap-1 text-xs text-gray-400 mr-4">
          <Users className="h-3 w-3" />
          {peers.length} in room
        </div>

        <Button
          variant={isAudioOn ? "secondary" : "destructive"}
          size="icon"
          onClick={toggleAudio}
          title={isAudioOn ? "Mute" : "Unmute"}
        >
          {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>

        <Button
          variant={isVideoOn ? "secondary" : "destructive"}
          size="icon"
          onClick={toggleVideo}
          title={isVideoOn ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>

        {role === "tutor" && (
          <Button
            variant={isScreenSharing ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleScreenShare}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <Monitor className="h-4 w-4" />
          </Button>
        )}

        <Button variant="destructive" size="icon" onClick={leaveRoom} title="Leave session">
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
