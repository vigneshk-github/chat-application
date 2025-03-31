import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { socket } from "@/app/socket";
import Peer, { MediaConnection } from "peerjs";
import { Video, PhoneOff } from "lucide-react";

interface ChattingProps {
    sender: string;
    receiver: string;
}

export default function VideoCall({ sender, receiver }: ChattingProps) {
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const peerVideoRef = useRef<HTMLVideoElement>(null);
    const [peer, setPeer] = useState<Peer | null>(null);
    const [currentCall, setCurrentCall] = useState<MediaConnection | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
        const newPeer = new Peer();
        setPeer(newPeer);

        newPeer.on("open", (id) => {
            socket.emit("registerPeer", { email: sender, peerId: id });
        });

        newPeer.on("call", (call) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((userStream) => {
                setStream(userStream);
                if (myVideoRef.current) myVideoRef.current.srcObject = userStream;

                call.answer(userStream);
                setCurrentCall(call);

                call.on("stream", (peerStream) => {
                    if (peerVideoRef.current) peerVideoRef.current.srcObject = peerStream;
                });
            });
        });

        return () => {
            newPeer.destroy();
        };
    }, [sender]);

    function startVideoCall() {
        socket.emit("requestVideoCall", { sender, receiver });
    }

    function acceptCall(peerId: string) {
        if (!peer) return;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((userStream) => {
            setStream(userStream);
            if (myVideoRef.current) myVideoRef.current.srcObject = userStream;

            const call = peer.call(peerId, userStream);
            setCurrentCall(call);

            if (call) {
                call.on("stream", (peerStream) => {
                    if (peerVideoRef.current) peerVideoRef.current.srcObject = peerStream;
                });
            }
        });
    }

    function endCall() {
        if (currentCall) {
            currentCall.close(); // Close PeerJS call
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop()); // Stop media stream
        }
        setCurrentCall(null);
        setStream(null);
        if (myVideoRef.current) myVideoRef.current.srcObject = null;
        if (peerVideoRef.current) peerVideoRef.current.srcObject = null;

        socket.emit("endCall", { sender, receiver });
    }

    useEffect(() => {
        const handleIncomingCall = ({ peerId }: { peerId: string }) => acceptCall(peerId);
        socket.on("incomingVideoCall", handleIncomingCall);

        socket.on("callEnded", () => {
            endCall();
        });

        return () => {
            socket.off("incomingVideoCall", handleIncomingCall);
            socket.off("callEnded");
        };
    }, [peer]);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex items-center p-4 border-b">
                <h2 className="text-lg font-bold">{receiver}</h2>
                <Button onClick={startVideoCall} className="ml-auto bg-green-500 mr-2">
                    <Video size={20} />
                </Button>
                {currentCall && (
                    <Button onClick={endCall} className="bg-red-500">
                        <PhoneOff size={20} />
                    </Button>
                )}
            </div>

            <div className="flex  items-center">
                <video ref={myVideoRef} autoPlay muted className="w-1/2 h-auto" />
                <video ref={peerVideoRef} autoPlay className="w-1/2 h-auto" />
            </div>
        </div>
    );
}
