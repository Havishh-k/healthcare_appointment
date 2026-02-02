/**
 * Appointments Service
 * 
 * API calls for booking, cancelling, and rescheduling.
 * 
 * Note: Database uses start_time/end_time columns for appointments.
 * Booking now goes through backend API to enable email notifications.
 */
import { supabase } from '@/lib/supabase';

// Backend API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default appointment duration in minutes
const APPOINTMENT_DURATION = 30;

/**
 * Calculate end time from start time
 */
function calculateEndTime(startTime, durationMinutes = APPOINTMENT_DURATION) {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return end.toISOString();
}

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
}

export async function bookAppointment(appointmentData) {
    const startTime = appointmentData.appointmentTime;
    const endTime = calculateEndTime(startTime);

    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                doctor_id: appointmentData.doctorId,
                department_id: appointmentData.departmentId,
                start_time: startTime,
                end_time: endTime,
                reason: appointmentData.reason,
                notes: appointmentData.notes,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || result.message || 'Failed to book appointment');
        }

        return result.data?.appointment || result.data;
    } catch (error) {
        // Handle double-booking error gracefully
        if (error.message.includes('overlap') || error.message.includes('no longer available')) {
            throw new Error('This time slot is no longer available. Please select another time.');
        }
        throw error;
    }
}

export async function getMyAppointments(userId) {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name, email),
        department:departments(name)
      )
    `)
        .eq('patient_id', userId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getUpcomingAppointments(userId) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name),
        department:departments(name)
      )
    `)
        .eq('patient_id', userId)
        .gte('start_time', now)
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getPastAppointments(userId) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name),
        department:departments(name)
      )
    `)
        .eq('patient_id', userId)
        .or(`start_time.lt.${now},status.eq.cancelled`)
        .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
}

export async function cancelAppointment(appointmentId, reason) {
    const { data, error } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function rescheduleAppointment(appointmentId, newTime) {
    const endTime = calculateEndTime(newTime);

    const { data, error } = await supabase
        .from('appointments')
        .update({
            start_time: newTime,
            end_time: endTime,
            status: 'pending', // Reset to pending for reconfirmation
        })
        .eq('id', appointmentId)
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name),
        department:departments(name)
      )
    `)
        .single();

    if (error) {
        if (error.message.includes('overlap') || error.code === '23505') {
            throw new Error('This time slot is no longer available. Please select another time.');
        }
        throw error;
    }

    return data;
}

export async function confirmAppointment(appointmentId) {
    const { data, error } = await supabase
        .from('appointments')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
