import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/app/socket";
import axios from "axios";

interface ChattingProps {
    sender: string;
    receiver: string;
}

export default function Chatting({ sender, receiver }: ChattingProps) {
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<{ senderId: string; message: string }[]>([]);
    const [senderId, setSenderId] = useState<string>("");
    const [recId, setRecId] = useState<string>("");

    useEffect(() => {
        socket.connect();
        socket.emit("join", { sender, receiver });

        async function fetchUserIds() {
            try {
                const senderRes = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getId`, { email: sender });
                const receiverRes = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getId`, { email: receiver });
                setSenderId(senderRes.data.id);
                setRecId(receiverRes.data.id);
                return { senderId: senderRes.data.id, recId: receiverRes.data.id };
            } catch (error) {
                console.error("Error fetching user IDs:", error);
            }
        }

        async function fetchMessages() {
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversation`, { to: receiver, from: sender });
                if (res.data?.messages) {
                    setMessages(res.data.messages.map((msg: { userId: string; content: string }) => ({
                        senderId: msg.userId,
                        message: msg.content,
                    })));
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        }

        fetchUserIds().then((userIds) => {
            if (userIds) fetchMessages();
        });

        socket.on("privateMessage", (data: { from: string; message: string }) => {
            // Only add if message is from the receiver
            if (data.from !== sender) {
                setMessages((prev) => [...prev, { senderId: recId, message: data.message }]);
            }
        });

        return () => {
            socket.off("privateMessage");
        };
    }, [sender, receiver, recId]);

    function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (message.trim() !== "") {
            socket.emit("privateMessage", { to: receiver, message, from: sender });

            // Add only locally without receiving the event again
            setMessages((prev) => [...prev, { senderId, message }]);
            setMessage("");
        }
    }

    return (
        <div className="p-4 border rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2">Chat with {receiver}</h2>
            <div className="h-64 overflow-y-auto bg-gray-200 p-2 rounded flex flex-col gap-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.senderId === senderId ? "justify-end" : "justify-start"}`}>
                        <span className={`px-3 py-2 rounded-lg max-w-xs break-words ${msg.senderId === senderId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                            {msg.message}
                        </span>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex mt-2">
                <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
                <Button type="submit">Send</Button>
            </form>
        </div>
    );
}
