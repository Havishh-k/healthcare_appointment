/**
 * Doctor Schedule Page
 * 
 * Weekly calendar view of appointments.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addDays, parseISO, isSameDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button, Spinner, Avatar } from '@/components/ui';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DoctorSchedule = () => {
    const { session } = useAuth();
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const token = session?.access_token;
                if (!token) return;

                const startDate = currentWeek.toISOString();
                const endDate = addDays(currentWeek, 7).toISOString();

                const response = await fetch(
                    `${API_URL}/doctor/appointments?start_date=${startDate}&end_date=${endDate}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setAppointments(data.data.appointments);
                }
            } catch (err) {
                console.error('Failed to fetch schedule:', err);
            } finally {
                setLoading(false);
            }
        };

        if (session?.access_token) {
            fetchAppointments();
        }
    }, [session, currentWeek]);

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    const getAppointmentsForDay = (date) => {
        return appointments.filter((apt) => isSameDay(parseISO(apt.start_time), date));
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
            confirmed: 'bg-green-100 border-green-300 text-green-800',
            completed: 'bg-gray-100 border-gray-300 text-gray-800',
            cancelled: 'bg-red-100 border-red-300 text-red-800',
        };
        return colors[status] || colors.pending;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Schedule</h1>
                    <p className="text-muted-foreground">
                        {format(currentWeek, 'MMMM d')} - {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {weekDays.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                'text-center p-2 rounded-t-lg',
                                isSameDay(day, new Date()) && 'bg-primary text-white'
                            )}
                        >
                            <p className="font-medium">{format(day, 'EEE')}</p>
                            <p className="text-2xl font-bold">{format(day, 'd')}</p>
                        </div>
                    ))}

                    {/* Day Columns */}
                    {weekDays.map((day) => {
                        const dayAppointments = getAppointmentsForDay(day);
                        return (
                            <div
                                key={day.toISOString() + '-content'}
                                className="min-h-[300px] bg-gray-50 rounded-b-lg p-2 space-y-2"
                            >
                                {dayAppointments.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        No appointments
                                    </p>
                                ) : (
                                    dayAppointments.map((apt) => (
                                        <Link
                                            key={apt.id}
                                            to={`/doctor/appointments/${apt.id}`}
                                            className={cn(
                                                'block p-2 rounded border text-xs transition-transform hover:scale-105',
                                                getStatusColor(apt.status)
                                            )}
                                        >
                                            <p className="font-semibold truncate">
                                                {format(parseISO(apt.start_time), 'h:mm a')}
                                            </p>
                                            <p className="truncate">{apt.patient?.full_name}</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                    <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                    <span>Cancelled</span>
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedule;
