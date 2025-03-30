"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import Chatting from "@/components/Chatting/Chatting";
import { socket } from "@/app/socket";
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import GptChat from "@/app/gpt/page";

interface User {
    id: number;
    email: string;
}

export default function Room() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showSidebar, setShowSidebar] = useState(true);
    const { slug } = useParams();
    const decodedEmail = decodeURIComponent(slug as string);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get<{ users: User[] }>(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/getallusers`
                );
                const filteredUsers = response.data.users.filter((u) => u.email !== decodedEmail);

                // Add GPT as a special user
                const gptUser: User = {
                    id: -1, // Use a special ID that won't conflict with regular users
                    email: "AI Assistant" // Display name for GPT
                };

                // Add GPT user to the beginning of the list
                setUsers([gptUser, ...filteredUsers]);
                setFilteredUsers([gptUser, ...filteredUsers]);
            } catch (err) {
                console.error(err);
            }
        }

        fetchUsers();

        socket.connect();
        socket.emit("register", decodedEmail);

        // Check if device is mobile and if user is selected
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setShowSidebar(!selectedUser);
            } else {
                setShowSidebar(true);
            }
        };

        // Initial check
        handleResize();

        // Add listener for window resize
        window.addEventListener('resize', handleResize);

        return () => {
            socket.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [decodedEmail, selectedUser]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredUsers(
                users.filter((user) =>
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    function getInitials(email: string) {
        return email.substring(0, 2).toUpperCase();
    }

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        // On mobile, hide sidebar when user is selected
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    const handleBackClick = () => {
        setShowSidebar(true);
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50">
            {/* Left Side - User List */}
            {showSidebar && (
                <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-white shadow-sm">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Chats</h2>
                        <p className="text-sm text-gray-500 mt-1 truncate">Logged in as {decodedEmail}</p>
                        <div className="mt-4 relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="sm:h-[calc(100vh-13rem)] mobile-scroll-area">
                        <div className="p-2">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <Card
                                        key={user.id}
                                        className={`mb-2 cursor-pointer transition-colors hover:bg-gray-100 ${selectedUser?.email === user.email
                                            ? "bg-blue-50 border-blue-200"
                                            : "bg-white"
                                            }`}
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <CardContent className="p-3 flex items-center">
                                            <Avatar className="h-10 w-10 mr-3">
                                                <AvatarFallback className="bg-blue-500 text-white">
                                                    {getInitials(user.email)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-800 truncate max-w-xs">
                                                    {user.email}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Click to start chatting
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 p-4">No users found</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Right Side - Chat */}
            {/* Right Side - Chat */}
            <div className={`${showSidebar ? 'hidden md:flex' : 'flex'} flex-1 items-center justify-center bg-gray-100`}>
                {selectedUser ? (
                    <div className="w-full h-[calc(100vh-4rem)] flex flex-col">
                        {/* Mobile header with back button */}
                        <div className="md:hidden flex items-center p-3 bg-white border-b">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBackClick}
                                className="mr-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback className="bg-blue-500 text-white">
                                        {getInitials(selectedUser.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium truncate">{selectedUser.email}</span>
                            </div>
                        </div>

                        <div className="flex-1 h-[calc(100vh-4rem)]">
                            {selectedUser.id === -1 ? (
                                <GptChat  />
                            ) : (
                                <Chatting sender={decodedEmail} receiver={selectedUser.email} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Chat App</h3>
                        <p className="text-gray-600">
                            Select a user from the sidebar to start a conversation,
                            or choose AI Assistant to chat with our GPT assistant.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}