import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, AlertCircle } from "lucide-react";

export const AIChat = () => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I'm your AI Assistant. Ask me about cash flow, forecasts, or any financial questions.",
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            role: "user",
            content: inputValue,
        };

        // Mock AI response based on query
        let aiResponse = "";
        if (inputValue.toLowerCase().includes("runway")) {
            aiResponse = "Based on current burn rate of $32K/month, if sales drop 15%, your runway would decrease to 11.8 months. I recommend focusing on overdue invoices - collecting the $23K outstanding would extend runway by 3 weeks.";
        } else if (inputValue.toLowerCase().includes("risk")) {
            aiResponse = "TechCorp Solutions has the highest risk score (87/100) with $12.5K overdue for 12 days. Global Industries is medium risk with payment due tomorrow. Consider prioritizing TechCorp for follow-up.";
        } else if (inputValue.toLowerCase().includes("forecast")) {
            aiResponse = "Q2 revenue forecast shows $165K projection with 78% confidence. Key drivers: 3 new clients ($45K) and recurring revenue growth of 8%. Monitor pipeline closely for accuracy.";
        } else {
            aiResponse = "I can help you analyze cash flow, forecast revenue, assess client risk, and answer financial questions. Try asking about specific metrics or scenarios!";
        }

        const assistantMessage = {
            role: "assistant",
            content: aiResponse,
        };

        setMessages([...messages, userMessage, assistantMessage]);
        setInputValue("");
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
                            className={`flex space-x-2 items-center ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {message.role === "assistant" && (
                                <Bot className="h-4 w-4 text-primary" />
                            )}
                            <div
                                className={`rounded-lg p-2 max-w-[80%] text-left text-sm ${message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}
                    { isLoading && (
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
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};