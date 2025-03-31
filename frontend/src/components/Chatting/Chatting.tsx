import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/app/socket";
import axios from "axios";
import { Send, PhoneCall } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import VideoCall from "../VideoCall/VideoCall";

interface ChattingProps {
    sender: string;
    receiver: string;
}

interface Message {
    senderId: string;
    message: string;
    timestamp?: Date;
}

export default function Chatting({ sender, receiver }: ChattingProps) {
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [senderId, setSenderId] = useState<string>("");
    const [recId, setRecId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
    const [show, setShow] = useState(false);

    const scrollToBottom = () => {
        if (shouldScrollToBottom && messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Handle manual scrolling to detect when user has scrolled up
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isScrolledNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldScrollToBottom(isScrolledNearBottom);
    };

    useEffect(() => {
        if (shouldScrollToBottom) {
            scrollToBottom();
        }
    }, [messages, shouldScrollToBottom]);

    useEffect(() => {
        setIsLoading(true);
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
                    setMessages(res.data.messages.map((msg: { userId: string; content: string; createdAt?: string }) => ({
                        senderId: msg.userId,
                        message: msg.content,
                        timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                    })));
                }
                setIsLoading(false);
                // Reset scroll to bottom with new conversation
                setShouldScrollToBottom(true);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setIsLoading(false);
            }
        }

        fetchUserIds().then((userIds) => {
            if (userIds) fetchMessages();
        });

        socket.on("privateMessage", (data: { from: string; message: string }) => {
            // Only add if message is from the receiver
            if (data.from !== sender) {
                setMessages((prev) => [...prev, {
                    senderId: recId,
                    message: data.message,
                    timestamp: new Date()
                }]);
            }
        });

        return () => {
            socket.off("privateMessage");
        };
    }, [sender, receiver]);

    function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (message.trim() !== "") {
            socket.emit("privateMessage", { to: receiver, message, from: sender });

            // Add only locally without receiving the event again
            setMessages((prev) => [...prev, {
                senderId,
                message,
                timestamp: new Date()
            }]);
            setMessage("");

            // Force scroll to bottom on send
            setShouldScrollToBottom(true);
        }
    }

    function getInitials(email: string) {
        return email.substring(0, 2).toUpperCase();
    }

    function formatMessageDate(date: Date) {
        return format(date, "h:mm a");
    }

    function groupMessagesByDate() {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach(msg => {
            const date = msg.timestamp ? format(msg.timestamp, 'MMMM d, yyyy') : 'Unknown';
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });

        return groups;
    }

    const messageGroups = groupMessagesByDate();


    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-white rounded-lg shadow-sm overflow-hidden overflow-x-hidden">
            <div className="flex items-center p-4 border-b">
                <Avatar className="h-10 w-10 mr-3 bg-blue-500 text-white">
                    <AvatarFallback>{getInitials(receiver)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h2 className="text-lg font-bold">{receiver}</h2>
                    <p className="text-xs text-gray-500">
                        {isLoading ? "Loading..." : "Online"}
                    </p>
                </div>
                <PhoneCall onClick={() => setShow(!show)} color="blue" size={24} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" ref={scrollAreaRef} onScroll={handleScroll}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                        <p className="text-gray-500">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                ) : show === true ? (
                    <VideoCall sender={sender} receiver={receiver} />
                ) :
                    (
                        <div className="space-y-6">
                            {Object.entries(messageGroups).map(([date, msgs]) => (
                                <div key={date} className="space-y-4">
                                    <div className="flex items-center justify-center">
                                        <Separator className="flex-grow" />
                                        <span className="mx-2 text-xs text-gray-500">{date}</span>
                                        <Separator className="flex-grow" />
                                    </div>
                                    {msgs.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${msg.senderId === senderId ? "justify-end" : "justify-start"}`}
                                        >
                                            {msg.senderId !== senderId && (
                                                <Avatar className="h-8 w-8 mr-2 mt-1 bg-blue-500 text-white">
                                                    <AvatarFallback>{getInitials(receiver)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`max-w-[80%] break-words space-y-1 ${msg.senderId === senderId ? "items-end" : "items-start"}`}>
                                                <div
                                                    className={`px-4 py-2 rounded-2xl break-words ${msg.senderId === senderId
                                                        ? "bg-blue-500 text-white rounded-br-none"
                                                        : "bg-gray-100 text-black rounded-bl-none"
                                                        }`}
                                                >
                                                    {msg.message}
                                                </div>
                                                {msg.timestamp && (
                                                    <span className="text-xs text-gray-500 px-1">
                                                        {formatMessageDate(msg.timestamp)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div ref={messageEndRef} />
                        </div>
                    )}
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t flex items-center gap-2">
                <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={message.trim() === ""}
                >
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
}