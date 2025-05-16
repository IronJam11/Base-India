import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Paperclip, Brain, Zap, Shield } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'assistant' | 'user';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I assist you today?',
      sender: 'assistant',
      timestamp: new Date('2025-03-18T11:30:00')
    },
    {
      id: '2',
      content: 'Hi! I need help with my project.',
      sender: 'user',
      timestamp: new Date('2025-03-18T11:31:00')
    },
    {
      id: '3',
      content: 'I\'d be happy to help! Could you please provide more details about your project?',
      sender: 'assistant',
      timestamp: new Date('2025-03-18T11:32:00')
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    alert("hello");
    e.preventDefault();
    if (inputMessage.trim() === '') return;
  
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    if(inputMessage === "Tell me about carbon credits")
  
    try {
      let response;
      const lowerCaseMessage = inputMessage.toLowerCase();
  
      if (lowerCaseMessage.startsWith('create agent')) {
        alert("hello");
        const agentName = inputMessage.split(' ')[2];
        response = await axios.post('http://127.0.0.1:5000/create_agent', {
          agent_name: agentName,
        });
      } else if (lowerCaseMessage.startsWith('delete agent')) {
        const agentName = inputMessage.split(' ')[2];
        response = await axios.post('http://127.0.0.1:5000/delete_agent', {
          agent_name: agentName,
        });
      } else if (lowerCaseMessage.startsWith('switch agent')) {
        const agentName = inputMessage.split(' ')[2];
        response = await axios.post('http://127.0.0.1:5000/switch_agent', {
          agent_name: agentName,
        });
      } else if (lowerCaseMessage.startsWith('switch network')) {
        const network = inputMessage.split(' ')[2];
        response = await axios.post('http://127.0.0.1:5000/switch_network', {
          network: network,
        });
      } else if (lowerCaseMessage.startsWith('list agents')) {
        response = await axios.get('http://127.0.0.1:5000/list_agents');
      } else if (lowerCaseMessage.startsWith('send message')) {
        const message = inputMessage.split(' ').slice(2).join(' ');
        response = await axios.post('http://127.0.0.1:5000/send_message', {
          message: message + "Please make your answer as descriptive as possible",
        });
      } else {
        throw new Error("Invalid command. Please use 'create agent', 'delete agent', 'switch agent', 'switch network', 'list agents', or 'send message'.");
      }
  
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.message || JSON.stringify(response.data), // Handle both message and list_agents response
        sender: 'assistant',
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, there was an error processing your request. Please try again.",
        sender: 'assistant',
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  
  // To this (more consistent format with explicit locale):
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat container */}
      <div className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <Brain className="text-gray-700" size={18} />
                </div>
              </div>
              <div>
                <h2 className="font-semibold">IAGENT Powered By Injective</h2>
                <p className="text-sm text-gray-500">Always here to help</p>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : ''}`}
              >
                {message.sender === 'assistant' && (
                  <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2 mt-1">
                    <Brain className="text-gray-700" size={16} />
                  </div>
                )}
                
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p>{message.content}</p>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="bg-green-600 rounded-full h-8 w-8 flex items-center justify-center ml-2 mt-1">
                
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex mb-4">
                <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                  <Brain className="text-gray-700" size={16} />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSubmit} className="border-t p-4 flex items-center">
            <button 
              type="button" 
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Paperclip size={20} />
            </button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-md mx-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <button 
              type="submit" 
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful AI Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <Brain className="text-gray-700" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Creation of multiple AI Agents </h3>
              <p className="text-gray-600">Using Iagents immense power of managing and creating multiple AI agents for you </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <Zap className="text-gray-700" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Processing</h3>
              <p className="text-gray-600">Lightning-fast response times with our optimized backend.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <Shield className="text-gray-700" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Versitality and Security</h3>
              <p className="text-gray-600">End-to-end encryption for all your conversations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">Leading AI assistant platform helping users achieve their goals.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-green-300">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-300">Features</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-300">Pricing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-300">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">📧 support@aiassistant.com</p>
            <p className="text-gray-300">📞 +91 9764988806</p>
            
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-green-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-green-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-green-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}