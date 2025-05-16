import React, { useEffect, useState } from 'react';

interface Organization {
  address: string;
  name: string;
  reputation_score: string;
}

const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch organizations from the backend API
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();

        // Check if the response is successful and contains organizations
        if (data.success && data.organizations) {
          setOrganizations(data.organizations);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        // Explicitly type the error as an instance of Error
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Organizations</h2>
          <p className="text-gray-600">Browse and support eco-friendly organizations</p>
        </div>

        {/* Organizations grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div key={org.address} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                  <img
                    src={`https://via.placeholder.com/150?text=${org.name}`}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{org.name}</h3>
                  <p className="text-gray-500 text-sm">{org.address}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Reputation Score</span>
                  <span className="text-green-600 font-medium">{org.reputation_score}/5.0</span>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors">
                  Lend Money
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        © 2025 EcoLend. All rights reserved.
      </footer>
    </div>
  );
};

export default OrganizationsPage;