/**
 * Enhanced ChatWindow Component
 * 
 * Premium UI that matches the main app design
 * Features:
 * - Session reset per user/login
 * - Doctor recommendations
 * - Available time slots
 * - Beautiful gradient styling
 */
import { useState, useEffect, useRef } from 'react';
import { X, Send, Calendar, User, Clock, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import Message, { TypingIndicator } from './Message';
import { sendMessage, bookAppointment } from '@/services/chatbot';
import { useAuth } from '@/hooks/useAuth';

const QuickReply = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-purple-100 rounded-full text-sm font-medium text-purple-700 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-200 whitespace-nowrap"
    >
        {text}
    </button>
);

const DoctorCard = ({ doctor, onSelect }) => (
    <div
        onClick={() => onSelect(doctor)}
        className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl cursor-pointer hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 border border-purple-100 hover:border-purple-200 hover:shadow-lg group"
    >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
            <p className="font-semibold text-gray-900">Dr. {doctor.name}</p>
            <p className="text-sm text-purple-600">{doctor.specialization || doctor.departmentName}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <ArrowRight className="w-4 h-4 text-purple-600" />
        </div>
    </div>
);

const TimeSlotButton = ({ slot, onSelect }) => (
    <button
        onClick={() => onSelect(slot)}
        className="px-3 py-2.5 bg-white border border-purple-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-lg"
    >
        <Clock className="w-4 h-4" />
        {slot.display}
    </button>
);

// Get initial welcome message
const getWelcomeMessage = (userName) => ({
    id: 1,
    text: `Hi${userName ? ` ${userName}` : ''}! 👋 I'm your HealthBook AI assistant. I can help you book appointments based on your symptoms. Just describe how you're feeling, and I'll suggest the right department and doctor for you!`,
    isBot: true,
    timestamp: new Date().toISOString()
});

const ChatWindow = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Session key for this user
    const sessionKey = user?.id || 'anonymous';

    const [messages, setMessages] = useState([getWelcomeMessage(user?.user_metadata?.full_name?.split(' ')[0])]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [quickReplies, setQuickReplies] = useState([
        'Book appointment',
        'View my appointments',
        'I have a headache',
    ]);
    const [currentDoctors, setCurrentDoctors] = useState([]);
    const [currentSlots, setCurrentSlots] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [lastUserId, setLastUserId] = useState(sessionKey);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Reset chat when user changes (login/logout)
    useEffect(() => {
        if (sessionKey !== lastUserId) {
            // User changed - reset the chat
            setMessages([getWelcomeMessage(user?.user_metadata?.full_name?.split(' ')[0])]);
            setCurrentDoctors([]);
            setCurrentSlots([]);
            setSelectedDoctor(null);
            setPendingBooking(null);
            setQuickReplies(['Book appointment', 'View my appointments', 'I have a headache']);
            setLastUserId(sessionKey);
        }
    }, [sessionKey, lastUserId, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, currentDoctors, currentSlots]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || !user) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            isBot: false,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setCurrentDoctors([]);
        setCurrentSlots([]);

        try {
            const response = await sendMessage(inputValue, user.id);

            const botMessage = {
                id: Date.now() + 1,
                text: response.message,
                isBot: true,
                timestamp: new Date().toISOString(),
                intent: response.intent,
                departmentInfo: response.departmentInfo
            };

            setMessages(prev => [...prev, botMessage]);

            // Handle navigation
            if (response.navigation) {
                setPendingBooking({
                    navigation: response.navigation,
                    department: response.departmentInfo?.name,
                    doctors: response.doctors
                });
            }

            // Show doctors if available
            if (response.doctors?.length > 0) {
                setCurrentDoctors(response.doctors);
                // Also generate time slots when doctors are available
                setCurrentSlots(response.slots || []);
            }

            // Update quick replies based on context
            if (response.departmentInfo) {
                setQuickReplies([
                    `Book ${response.departmentInfo.name} appointment`,
                    'View my appointments',
                    'Show more options'
                ]);
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm sorry, I'm having trouble processing that. Please try again.",
                isBot: true,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleDoctorSelect = (doctor) => {
        setSelectedDoctor(doctor);
        const botMessage = {
            id: Date.now(),
            text: `Excellent choice! 🎉 Dr. ${doctor.name} from ${doctor.departmentName || 'our team'} is ready to help you. Please select a convenient time slot below:`,
            isBot: true,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentDoctors([]);
    };

    const handleSlotSelect = async (slot) => {
        if (!user || !selectedDoctor) {
            // If no doctor selected, navigate to booking page
            if (pendingBooking?.navigation) {
                navigate(pendingBooking.navigation.page, {
                    state: pendingBooking.navigation.params
                });
                onClose();
            }
            return;
        }

        setIsTyping(true);
        setCurrentSlots([]);

        try {
            const response = await bookAppointment({
                userId: user.id,
                doctorId: selectedDoctor.id,
                datetime: slot.datetime,
                department: selectedDoctor.departmentName,
                reason: pendingBooking?.department ? `${pendingBooking.department} consultation` : 'Consultation'
            });

            const successMessage = {
                id: Date.now(),
                text: `🎉 ${response.message || 'Appointment booked successfully!'}\n\nYou'll receive a confirmation email shortly.`,
                isBot: true,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, successMessage]);

            // Add navigation prompt
            setQuickReplies(['View my appointments', 'Book another appointment']);

            // Reset state
            setSelectedDoctor(null);
            setPendingBooking(null);

        } catch (error) {
            console.error('Booking failed:', error);
            const errorMessage = {
                id: Date.now(),
                text: "Sorry, I couldn't complete the booking. Please try again or use the booking page.",
                isBot: true,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickReply = (text) => {
        if (text === 'View my appointments') {
            navigate('/appointments');
            onClose();
            return;
        }
        if (text === 'Book another appointment') {
            navigate('/book');
            onClose();
            return;
        }
        setInputValue(text);
        inputRef.current?.focus();
    };

    const handleNavigate = () => {
        if (pendingBooking?.navigation) {
            navigate(pendingBooking.navigation.page, {
                state: pendingBooking.navigation.params
            });
            onClose();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Reset chat function
    const handleResetChat = () => {
        setMessages([getWelcomeMessage(user?.user_metadata?.full_name?.split(' ')[0])]);
        setCurrentDoctors([]);
        setCurrentSlots([]);
        setSelectedDoctor(null);
        setPendingBooking(null);
        setQuickReplies(['Book appointment', 'View my appointments', 'I have a headache']);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 md:p-8">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm md:bg-black/20"
                onClick={onClose}
            />

            <div className="relative w-full h-[650px] md:w-[420px] md:h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col animate-slide-up overflow-hidden border border-purple-100">
                {/* Header - Premium Gradient */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">HealthBook AI</h3>
                            <p className="text-sm text-white/80 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Smart symptom recognition
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleResetChat}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sm"
                            title="New conversation"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-purple-50/50 to-white">
                    {messages.map((msg) => (
                        <Message
                            key={msg.id}
                            message={msg.text}
                            isBot={msg.isBot}
                            timestamp={msg.timestamp}
                        />
                    ))}

                    {/* Doctor Cards */}
                    {currentDoctors.length > 0 && (
                        <div className="space-y-3 animate-fade-in">
                            <p className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Available Doctors
                            </p>
                            {currentDoctors.slice(0, 3).map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onSelect={handleDoctorSelect}
                                />
                            ))}
                        </div>
                    )}

                    {/* Time Slots */}
                    {currentSlots.length > 0 && selectedDoctor && (
                        <div className="space-y-3 animate-fade-in">
                            <p className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Available Time Slots
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {currentSlots.slice(0, 6).map((slot, i) => (
                                    <TimeSlotButton
                                        key={i}
                                        slot={slot}
                                        onSelect={handleSlotSelect}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigate to Booking Button */}
                    {pendingBooking && !selectedDoctor && currentDoctors.length === 0 && (
                        <div className="animate-fade-in">
                            <Button
                                onClick={handleNavigate}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                Go to Booking Page <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {quickReplies.length > 0 && !isTyping && (
                    <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white border-t border-purple-50">
                        {quickReplies.map((reply, index) => (
                            <QuickReply
                                key={index}
                                text={reply}
                                onClick={handleQuickReply}
                            />
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-purple-100">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your symptoms..."
                            className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                            disabled={isTyping}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
