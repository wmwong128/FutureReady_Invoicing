import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, AlertCircle } from "lucide-react";
import { useChatBot } from "@/hooks/useDashboard";

export const AIChat = () => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I'm your AI Assistant. Ask me about cash flow, forecasts, or any financial questions.",
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { askChatBot } = useChatBot()

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            role: "user",
            content: inputValue,
        };

        setIsLoading(true);
        setMessages([...messages, userMessage]);
        setInputValue("");

        const payload = {
            message: inputValue
        }
        askChatBot.mutate(payload, {
            onSuccess: (res) => {
                setIsLoading(false);
                const assistantMessage = {
                    role: "assistant",
                    content: res.response
                }
                setMessages([...messages, userMessage, assistantMessage])
            },
            onError: () => {
                setIsLoading(false);
                setMessages([...messages, userMessage,
                    { 
                        role: 'assistant',
                        content: 'Something went wrong, please try again later.'
                    }
                ])
            }
        })
    };

    return (
        <Card className="h-100">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span>AI Assistant</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 grow">
                {/* Messages */}
                <div className="space-y-3 max-h-62 overflow-y-auto">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex space-x-2${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {message.role === "assistant" && (
                                <Bot className="h-4 w-4 text-primary mt-2" />
                            )}
                            <div
                                className={`rounded-lg p-2 max-w-[80%] text-left text-sm ${message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex space-x-2 items-center justify-start">
                            <Bot className="h-4 w-4 text-primary mr-4" />
                            <div className="text-left text-sm text-muted-foreground">
                                Loading...
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                {/* Input */}
                <div className="flex grow space-x-2">
                    <Input
                        placeholder="Ask Finance Copilot..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};