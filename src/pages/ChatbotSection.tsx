import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatbotSection = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      type: "bot",
      message: "👋 Hello! I'm your MediConnect AI Assistant. How can I assist you today?",
      timestamp: "just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    "Hospitals near 560001",
    "What are symptoms of diabetes?",
    "Give me skin care tips",
    "Explain what is blood pressure",
  ];

  // ---------------------------
  // Message Sending Function
  // ---------------------------
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: "user",
      message: inputValue,
      timestamp: "now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg: userMessage.message }),
      });

      const data = await response.json();

      const botResponse = {
        type: "bot",
        message: data.response || "⚠️ Sorry, I didn't get that.",
        timestamp: "now",
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch {
      const errorResponse = {
        type: "bot",
        message: "⚠️ Unable to reach the server. Please try again later.",
        timestamp: "now",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
  };

  // ---------------------------
  // JSX Layout
  // ---------------------------
  return (
    <section id="chatbot" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            General Query{" "}
            <span className="text-transparent bg-clip-text bg-gradient-secondary">
              Assistant
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chat with the AI-powered assistant and get instant answers to your
            health and general queries.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="border shadow-md h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                MediConnect Assistant
                <Badge variant="secondary" className="ml-auto">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="flex flex-col gap-6">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[80%] ${
                          msg.type === "user" ? "flex-row-reverse text-right" : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.type === "user"
                              ? "bg-primary"
                              : "bg-gradient-secondary"
                          }`}
                        >
                          {msg.type === "user" ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-3 break-words whitespace-pre-wrap ${
                            msg.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground justify-end">
                            <Clock className="w-3 h-3" />
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Animation */}
                  {isTyping && (
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-secondary flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-card border rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Suggested Questions */}
              <div className="p-4 border-t bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Suggested questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(q)}
                      className="text-xs h-7"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <div className="p-4 border-t flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ChatbotSection;