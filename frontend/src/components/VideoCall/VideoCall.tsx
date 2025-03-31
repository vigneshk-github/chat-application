import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { socket } from "@/app/socket";
import Peer from "peerjs";
import { Video } from "lucide-react";

interface ChattingProps {
    sender: string;
    receiver: string;
}

export default function VideoCall({ sender, receiver }: ChattingProps) {
    const [peerId, setPeerId] = useState("");
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const peerVideoRef = useRef<HTMLVideoElement>(null);
    const [peer, setPeer] = useState<Peer | null>(null);

    useEffect(() => {
        console.log(peerId);
        
        const newPeer = new Peer();
        setPeer(newPeer);

        newPeer.on("open", (id) => {
            setPeerId(id);
            socket.emit("registerPeer", { email: sender, peerId: id });
        });

        newPeer.on("call", (call) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                if (myVideoRef.current) myVideoRef.current.srcObject = stream;
                call.answer(stream);
                call.on("stream", (peerStream) => {
                    if (peerVideoRef.current) peerVideoRef.current.srcObject = peerStream;
                });
            });
        });

        return () => newPeer.destroy();
    }, [sender]);

    function startVideoCall() {
        socket.emit("requestVideoCall", { sender, receiver });
    }

    function acceptCall(peerId: string) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (myVideoRef.current) myVideoRef.current.srcObject = stream;
            const call = peer?.call(peerId, stream);
            call?.on("stream", (peerStream) => {
                if (peerVideoRef.current) peerVideoRef.current.srcObject = peerStream;
            });
        });
    }

    useEffect(() => {
        socket.on("incomingVideoCall", ({ peerId }) => acceptCall(peerId));
    }, [peer]);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex items-center p-4 border-b">
                <h2 className="text-lg font-bold">{receiver}</h2>
                <Button onClick={startVideoCall} className="ml-auto bg-green-500">
                    <Video size={20} />
                </Button>
            </div>

            <div className="flex flex-col items-center">
                <video ref={myVideoRef} autoPlay muted className="w-1/2 h-auto" />
                <video ref={peerVideoRef} autoPlay className="w-1/2 h-auto" />
            </div>
        </div>
    );
}