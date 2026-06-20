import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8">Loading details...</div>;
  if (!data) return <div className="p-8 text-text-secondary">No data available</div>;

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex flex-col gap-4xl">
      <h2 className="font-headline-2xl text-headline-2xl text-on-surface">Report Data Export</h2>
      <p className="font-body-sm text-body-sm text-text-secondary">Raw tabular representation of the ETL pipeline output.</p>
      
      <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container border-b border-border-subtle">
              <th className="p-md font-label-md text-text-secondary font-medium">Metric</th>
              <th className="p-md font-label-md text-text-secondary font-medium">Value</th>
              <th className="p-md font-label-md text-text-secondary font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            <tr className="hover:bg-bg-hover">
              <td className="p-md text-on-surface font-body-sm">Total Books Registered</td>
              <td className="p-md text-on-surface font-body-sm font-semibold">{data.totalBooks}</td>
              <td className="p-md text-text-secondary font-body-sm">{new Date(data.date).toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-bg-hover">
              <td className="p-md text-on-surface font-body-sm">Active Members</td>
              <td className="p-md text-on-surface font-body-sm font-semibold">{data.totalMembers}</td>
              <td className="p-md text-text-secondary font-body-sm">{new Date(data.date).toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-bg-hover">
              <td className="p-md text-on-surface font-body-sm">Active Borrows</td>
              <td className="p-md text-on-surface font-body-sm font-semibold">{data.activeBorrows}</td>
              <td className="p-md text-text-secondary font-body-sm">{new Date(data.date).toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-bg-hover">
              <td className="p-md text-on-surface font-body-sm">Overdue Borrows</td>
              <td className="p-md text-on-surface font-body-sm font-semibold">{data.overdueBorrows}</td>
              <td className="p-md text-text-secondary font-body-sm">{new Date(data.date).toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-bg-hover">
              <td className="p-md text-on-surface font-body-sm">Pending Fines</td>
              <td className="p-md text-on-surface font-body-sm font-semibold">${data.totalFines?.toFixed(2) || '0.00'}</td>
              <td className="p-md text-text-secondary font-body-sm">{new Date(data.date).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportDetails;
