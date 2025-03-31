"use client"
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
    sender: string;
    content: string;
    timestamp: Date;
}



const GptChat = () => {
    const [userInput, setUserInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Load previous messages if needed
    useEffect(() => {
        // Optional: Fetch previous conversation history
        // For now, we'll start with an empty chat

        // Scroll to bottom on initial load


        chatEndRef.current?.scrollIntoView();
    }, []);

    // Auto-scroll when messages update
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() === "") return;

        // Create user message
        const userMessage: Message = {
            sender: "user",
            content: userInput,
            timestamp: new Date()
        };

        // Add to messages
        setMessages(prev => [...prev, userMessage]);

        // Save input and clear the field
        const currentInput = userInput;
        setUserInput("");

        // Show loading state
        setIsLoading(true);

        try {
            // Send request to API
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gemini`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userInput: currentInput })
            });

            const data = await response.json();

            // Create GPT message
            const gptMessage = {
                sender: "gpt",
                content: data,
                timestamp: new Date()
            };


            // Add GPT response to messages
            setMessages(prev => [...prev, gptMessage]);
        } catch (error) {
            console.error("Error fetching GPT response:", error);

            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    sender: "gpt",
                    content: "Sorry, I couldn't process your request right now. Please try again.",
                    timestamp: new Date()
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-white rounded-lg shadow-sm overflow-hidden overflow-x-hidden">
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b">
                <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-purple-500 text-white">
                        <Bot size={16} />
                    </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-bold">AI Assistant</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-10">
                            <Bot className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-700">
                                Chat with AI Assistant
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto mt-2">
                                Ask questions, get recommendations, or just have a conversation
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {message.sender === "gpt" && (
                                <Avatar className="h-8 w-8 mr-2 self-end">
                                    <AvatarFallback className="bg-purple-500 text-white">
                                        <Bot size={16} />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div className="max-w-[80%] break-words">
                                <div
                                    className={`px-4 py-2 rounded-2xl ${message.sender === "user"
                                        ? "bg-blue-500 text-white rounded-br-none"
                                        : "bg-gray-100 text-black rounded-bl-none"
                                        }`}
                                >
                                    {message.content}
                                </div>
                                <div
                                    className={`text-xs text-gray-500 mt-1 ${message.sender === "user" ? "text-right" : "text-left"
                                        }`}
                                >
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback className="bg-purple-500 text-white">
                                    <Bot size={16} />
                                </AvatarFallback>
                            </Avatar>
                            <div className="max-w-[80%] break-words">
                                <div className="px-4 py-2 rounded-2xl bg-gray-100 text-black rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t flex items-center gap-2">
                <Input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={userInput.trim() === "" || isLoading}
                >
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
};

export default GptChat;