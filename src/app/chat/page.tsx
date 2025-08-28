import ChatClient from './chat-client';

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="font-headline text-3xl font-bold">AI Health Chatbot</h1>
        <p className="mt-2 text-muted-foreground">
          Ask questions and get instant answers about your health reports.
        </p>
      </div>
      <ChatClient />
    </div>
  );
}
