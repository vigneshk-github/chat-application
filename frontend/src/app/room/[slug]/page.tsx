"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import Chatting from "@/components/Chatting/Chatting";
import { socket } from "@/app/socket";
import { useParams } from 'next/navigation';

interface User {
    id: number;
    email: string;
}

export default function Room() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { slug } = useParams();
    const decodedEmail = decodeURIComponent(slug as string);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get<{ users: User[] }>(
                    `${process.env.BACKEND_URL}/api/getallusers`
                );
                setUsers(response.data.users.filter((u) => u.email !== decodedEmail));
            } catch (err) {
                console.error(err);
            }
        }

        fetchUsers();

        socket.connect();
        socket.emit("register", decodedEmail);

        return () => {
            socket.disconnect();
        };
    }, [decodedEmail]);

    // Update the usage of params.slug to use router.query

    return (
        <div className="flex h-screen">
            {/* Left Side - Chat */}
            <div className="w-2/3 p-4">
                {selectedUser ? (
                    <Chatting sender={decodedEmail}  receiver={selectedUser.email} />
                ) : (
                    <p>Select a user to start chatting</p>
                )}
            </div>

            {/* Right Side - User List */}
            <div className="w-1/3 p-4 border-l">
                <h2 className="text-lg font-bold mb-4">All Users</h2>
                {users.map((user) => (
                    <Card
                        key={user.id}
                        className={`mb-2 cursor-pointer ${selectedUser?.email === user.email ? "bg-blue-500 text-white" : ""}`}
                        onClick={() => setSelectedUser(user)}
                    >
                        <CardContent className="p-3">{user.email}</CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
