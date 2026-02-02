/**
 * Chatbot Service
 * 
 * API calls for chatbot functionality
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function sendMessage(message, userId) {
    const response = await fetch(`${API_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, userId }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
}

export async function getQuickReplies(userId) {
    const response = await fetch(`${API_URL}/chatbot/suggestions?userId=${userId}`);

    if (!response.ok) {
        throw new Error('Failed to get suggestions');
    }

    return response.json();
}

export async function bookAppointment({ userId, doctorId, datetime, department, reason }) {
    const response = await fetch(`${API_URL}/chatbot/book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, doctorId, datetime, department, reason }),
    });

    if (!response.ok) {
        throw new Error('Failed to book appointment');
    }

    return response.json();
}

// Legacy function for backwards compatibility
export async function executeBooking(userId, departmentName, datetime, reason) {
    return bookAppointment({ userId, department: departmentName, datetime, reason });
}

