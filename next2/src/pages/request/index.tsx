import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';

interface CreditRequest {
  id: string;
  company: string;
  creditsRequested: number;
  zkProofStatus?: 'Verified';
  eligibilityScore?: number;
  requestDate?: string;
  yourScore?: number;
  status?: 'Pending' | 'Declined';
}

export default function CreditRequests() {
  const currentDate = new Date();
  const formattedDate = `Today, ${currentDate.getHours()}:${currentDate.getMinutes() < 10 ? '0' + currentDate.getMinutes() : currentDate.getMinutes()}`;

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [orgName, setOrgName] = useState(''); // State for organization name
  const [orgAddress, setOrgAddress] = useState(''); // State for organization address
  const [isRequestSent, setIsRequestSent] = useState(false); // State for success tick

  const incomingRequests: CreditRequest[] = [
    {
      id: '#ECO-2025-001',
      company: 'EcoTech Solutions',
      creditsRequested: 500,
      zkProofStatus: 'Verified',
      eligibilityScore: 85,
    },
    {
      id: '#GPI-2025-003',
      company: 'GreenPath Industries',
      creditsRequested: 750,
      zkProofStatus: 'Verified',
      eligibilityScore: 92,
    },
  ];

  const outgoingRequests: CreditRequest[] = [
    {
      id: '#CTG-2025-007',
      company: 'CarbonTech Global',
      creditsRequested: 1000,
      requestDate: 'Jan 15, 2025',
      yourScore: 88,
      status: 'Pending',
    },
    {
      id: '#ESS-2025-005',
      company: 'EcoSphere Solutions',
      creditsRequested: 300,
      requestDate: 'Jan 10, 2025',
      yourScore: 78,
      status: 'Declined',
    },
  ];

  const handleNewRequest = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleSubmit = () => {
    // Simulate sending the request (you can replace this with an API call)
    setTimeout(() => {
      setIsRequestSent(true); // Show success tick
      setTimeout(() => {
        setIsModalOpen(false); // Close the modal after 2 seconds
        setIsRequestSent(false); // Reset success tick
        setOrgName(''); // Reset form fields
        setOrgAddress('');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Incoming Requests Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Incoming Credit Requests</h1>
        <div className="flex items-center text-gray-500">
          <Clock className="w-5 h-5 mr-2" />
          <span>Last updated: {formattedDate}</span>
        </div>
      </div>

      {/* Incoming Requests */}
      <div className="space-y-6 mb-10">
        {incomingRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
            {/* Incoming Request Details */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="4" fill="#E5EDFF" />
                    <path d="M8 9H16M8 13H14M8 17H12" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{request.company}</h2>
                  <p className="text-gray-500 text-sm">Request ID: {request.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition">
                  Accept
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition">
                  Decline
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Credits Requested</p>
                <p className="font-semibold text-lg">{request.creditsRequested} CCU</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">ZK Proof Status</p>
                <p className="font-semibold text-lg text-emerald-500">{request.zkProofStatus}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Eligibility Score</p>
                <p className="font-semibold text-lg">{request.eligibilityScore}/100</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Outgoing Requests Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Outgoing Requests</h1>
        <button
          onClick={handleNewRequest}
          className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition flex items-center"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6L12 18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Request
        </button>
      </div>

      {/* Outgoing Requests */}
      <div className="space-y-6">
        {outgoingRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="4" fill="#FFF8E5" />
                    <path d="M8 9H16M8 13H14M8 17H12" stroke="#996A13" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{request.company}</h2>
                  <p className="text-gray-500 text-sm">Request ID: {request.id}</p>
                </div>
              </div>
              {request.status === 'Pending' && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm">Pending</span>
              )}
              {request.status === 'Declined' && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm">Declined</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Credits Requested</p>
                <p className="font-semibold text-lg">{request.creditsRequested} CCU</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Request Date</p>
                <p className="font-semibold text-lg">{request.requestDate}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Your Score</p>
                <p className="font-semibold text-lg">{request.yourScore}/100</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">New Credit Request</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Address</label>
                <input
                  type="text"
                  value={orgAddress}
                  onChange={(e) => setOrgAddress(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition flex items-center"
              >
                {isRequestSent ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  'Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}