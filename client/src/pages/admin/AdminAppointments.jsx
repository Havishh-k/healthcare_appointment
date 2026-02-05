/**
 * Admin Appointments Page
 * 
 * View all appointments with filtering.
 */
import { useState, useEffect } from 'react';
import { Card, Spinner, Badge, Button, Input, Select, Avatar } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Search, Filter, CheckCircle, XCircle, Calendar } from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('appointments')
                .select(`
                    *,
                    patient:users!appointments_patient_id_fkey(full_name, email),
                    doctor:doctors(
                        specialization,
                        user:users(full_name)
                    )
                `)
                .order('start_time', { ascending: false });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'confirmed' })
                .eq('id', id);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to confirm:', err);
        }
    };

    const handleCancel = async (id) => {
        try {
            await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to cancel:', err);
        }
    };

    const filteredAppointments = search
        ? appointments.filter(
            (apt) =>
                apt.patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                apt.doctor?.user?.full_name?.toLowerCase().includes(search.toLowerCase())
        )
        : appointments;

    return (
        <div>
            <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-500 mt-1">Manage all patient appointments</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Search by patient or doctor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search className="w-5 h-5" />}
                    />
                </div>
                <div className="w-48">
                    <Select
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="Filter by status"
                    />
                </div>
            </div>

            {/* Appointments Table */}
            <Card>
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No appointments found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doctor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAppointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={apt.patient?.full_name} size="sm" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {apt.patient?.full_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {apt.patient?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Dr. {apt.doctor?.user?.full_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {apt.doctor?.specialization}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {format(new Date(apt.start_time), 'MMM d, yyyy')}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(apt.start_time), 'h:mm a')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900 max-w-xs truncate">
                                                {apt.reason}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                variant={
                                                    apt.status === 'confirmed' ? 'success' :
                                                        apt.status === 'pending' ? 'warning' :
                                                            apt.status === 'completed' ? 'default' :
                                                                'danger'
                                                }
                                            >
                                                {apt.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {apt.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleConfirm(apt.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCancel(apt.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminAppointments;
