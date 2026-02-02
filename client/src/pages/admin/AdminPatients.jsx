/**
 * Admin Patients Page
 */
import { useState, useEffect } from 'react';
import { Card, Spinner, Input, Avatar, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Search, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const AdminPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'patient')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPatients(data || []);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = search
        ? patients.filter(
            (p) =>
                p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                p.email?.toLowerCase().includes(search.toLowerCase())
        )
        : patients;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                <p className="text-gray-500 mt-1">View registered patients</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    className="max-w-md"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : filteredPatients.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    No patients found.
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={patient.full_name} size="md" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {patient.full_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {patient.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {patient.email}
                                                </p>
                                                {patient.phone && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        {patient.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {format(new Date(patient.created_at), 'MMM d, yyyy')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="success">Active</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminPatients;
