import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface Organization {
  name: string;
  description: string;
  profilePhotoipfsHashCode: string;
  totalCarbonCredits: string;
}

const contractAddress = '0x579Af937f3ce12B4E76bAea112EFa09D4f345f75';

const abi = [
  {
    type: 'function',
    name: 'getAllOrganisationDetails',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct OrganisationPublicView[]',
        components: [
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'profilePhotoipfsHashCode', type: 'string' },
          { name: 'totalCarbonCredits', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
];

const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        // Request user's wallet
        if (!window.ethereum) throw new Error("MetaMask is not installed.");
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, abi, signer);
        const orgs = await contract.getAllOrganisationDetails();

        // Map data to local state format
        const parsedOrgs: Organization[] = orgs.map((org: any) => ({
          name: org.name,
          description: org.description,
          profilePhotoipfsHashCode: org.profilePhotoipfsHashCode,
          totalCarbonCredits: ethers.formatUnits(org.totalCarbonCredits, 0), // or 18 if decimals
        }));

        setOrganizations(parsedOrgs);
      } catch (err) {
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
      <main className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Organizations</h2>
          <p className="text-gray-600">Browse and support eco-friendly organizations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                  <img
                    src={
                      org.profilePhotoipfsHashCode
                        ? `https://ipfs.io/ipfs/${org.profilePhotoipfsHashCode}`
                        : `https://via.placeholder.com/150?text=${org.name}`
                    }
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{org.name}</h3>
                  <p className="text-gray-500 text-sm">{org.description}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Total Carbon Credits</span>
                  <span className="text-green-600 font-medium">{org.totalCarbonCredits}</span>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors">
                  Lend Money
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © 2025 EcoLend. All rights reserved.
      </footer>
    </div>
  );
};

export default OrganizationsPage;
