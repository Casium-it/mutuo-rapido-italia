import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/leads/columns"
import { AdminNotificationSettings } from "@/components/admin/AdminNotificationSettings";

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        setLeads(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const totalLeads = leads.length;
  const notContactedLeads = leads.filter(lead => lead.lead_status === 'not_contacted').length;
  const firstContactLeads = leads.filter(lead => lead.lead_status === 'first_contact').length;
  const advancedConversationsLeads = leads.filter(lead => lead.lead_status === 'advanced_conversations').length;
  const convertedLeads = leads.filter(lead => lead.lead_status === 'converted').length;
  const rejectedLeads = leads.filter(lead => lead.lead_status === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#f8f5f1]">
      <ProtectedRoute requireAdmin={true}>
        <header className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <nav>
              <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Sign Out
              </button>
            </nav>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Leads</CardTitle>
                  <CardDescription>All form submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Not Contacted</CardTitle>
                  <CardDescription>New leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notContactedLeads}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Converted Leads</CardTitle>
                  <CardDescription>Successfully converted</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{convertedLeads}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Notification Settings Section */}
            <AdminNotificationSettings />
            
            {/* Lead Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Manage and view all leads</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading leads...</p>
                ) : (
                  <DataTable columns={columns} data={leads} />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </ProtectedRoute>
    </div>
  );
};

export default Admin;
