import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import { Users, Leaf, LineChart, Award, RefreshCcw } from 'lucide-react';

const CONTRACT_ADDRESS = "0xAb0992eaD847B28904c8014E770E0294Cd198866";
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "string", "name": "_profilePhotoipfsHashCode", "type": "string" },
      { "internalType": "address", "name": "_walletAddress", "type": "address" },
      { "internalType": "uint256", "name": "_timesBorrowed", "type": "uint256" },
      { "internalType": "uint256", "name": "_timesLent", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalCarbonCreditsLent", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalCarbonCreditsBorrowed", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalCarbonCreditsReturned", "type": "uint256" },
      { "internalType": "uint256", "name": "_emissions", "type": "uint256" },
      { "internalType": "uint256", "name": "_reputationScore", "type": "uint256" }
    ],
    "name": "createOrganisation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "type": "function",
    "name": "getMyOrganisationDetails",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct Organisation",
        "components": [
          {
            "name": "name",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "description",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "profilePhotoipfsHashCode",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "walletAddress",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "timesBorrowed",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "timesLent",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalCarbonCreditsLent",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalCarbonCreditsBorrowed",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalCarbonCreditsReturned",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "emissions",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "reputationScore",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "recordOrganisationEmissions",
    "inputs": [
      {
        "name": "_emissions",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

export default function Dashboard() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    profilePhoto: null as File | null,
  });
  const [organization, setOrganization] = useState({
    name: '',
    description: '',
    walletAddress: '',
    timesBorrowed: '0',
    timesLent: '0',
    totalCarbonCreditsLent: '0',
    totalCarbonCreditsBorrowed: '0',
    totalCarbonCreditsReturned: '0',
    emissions: '0',
    reputationScore: '0',
    profilePhoto: ''
  });

  // State for emissions
  const [emissionsInput, setEmissionsInput] = useState('');
  const [isEmissionsLoading, setIsEmissionsLoading] = useState(false);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const prov = new BrowserProvider(window.ethereum);
          const accs = await prov.send("eth_requestAccounts", []);
          const sgnr = await prov.getSigner();
          setAccount(accs[0]);
          setProvider(prov);
          setSigner(sgnr);
          checkRegistration(prov, sgnr);
        } catch (error) {
          console.error("Failed to connect wallet:", error);
          alert("Failed to connect to MetaMask. Please try again.");
        }
      } else {
        alert("MetaMask is required to use this application!");
      }
    };

    connectWallet();
  }, []);

  const checkRegistration = async (prov: BrowserProvider, sgnr: JsonRpcSigner) => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, sgnr);
      const org = await contract.getMyOrganisationDetails();
      
      if (org && org.name !== "") {
        setIsRegistered(true);
        setOrganization({
          name: org.name,
          description: org.description,
          walletAddress: org.walletAddress,
          timesBorrowed: org.timesBorrowed.toString(),
          timesLent: org.timesLent.toString(),
          totalCarbonCreditsLent: org.totalCarbonCreditsLent.toString(),
          totalCarbonCreditsBorrowed: org.totalCarbonCreditsBorrowed.toString(),
          totalCarbonCreditsReturned: org.totalCarbonCreditsReturned.toString(),
          emissions: org.emissions.toString(),
          reputationScore: org.reputationScore.toString(),
          profilePhoto: org.profilePhotoipfsHashCode
        });
      }
    } catch (err) {
      console.error("Error checking registration:", err);
      // If there's an error, assume the user is not registered
      setIsRegistered(false);
    }
  };

  const refreshOrganizationData = async () => {
    if (!signer) return;
    
    setIsRefreshing(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const org = await contract.getMyOrganisationDetails();
      
      setOrganization({
        name: org.name,
        description: org.description,
        walletAddress: org.walletAddress,
        timesBorrowed: org.timesBorrowed.toString(),
        timesLent: org.timesLent.toString(),
        totalCarbonCreditsLent: org.totalCarbonCreditsLent.toString(),
        totalCarbonCreditsBorrowed: org.totalCarbonCreditsBorrowed.toString(),
        totalCarbonCreditsReturned: org.totalCarbonCreditsReturned.toString(),
        emissions: org.emissions.toString(),
        reputationScore: org.reputationScore.toString(),
        profilePhoto: org.profilePhotoipfsHashCode
      });
    } catch (err) {
      console.error("Error refreshing organization data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // For demo purposes, we're simulating an IPFS upload
    return new Promise((res) => {
      setTimeout(() => {
        res("QmMockHash12345");
      }, 1000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, profilePhoto: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) return alert("Wallet not connected");
    
    setIsLoading(true);

    try {
      const ipfsHash = formData.profilePhoto
        ? await uploadToIPFS(formData.profilePhoto)
        : "default_hash";

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.createOrganisation(
        formData.name,
        formData.description,
        ipfsHash,
        account,
        0, 0, 0, 0, 0, 0, 0
      );
      await tx.wait();

      // Fetch organization details after creation
      await checkRegistration(provider!, signer);
      
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) return alert("Wallet not connected");

    if (!emissionsInput || isNaN(Number(emissionsInput)) || Number(emissionsInput) <= 0) {
      return alert("Please enter a valid emissions number");
    }

    setIsEmissionsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.recordOrganisationEmissions(Number(emissionsInput));
      await tx.wait();

      // Refresh organization data to show updated emissions
      await refreshOrganizationData();
      setEmissionsInput('');
      
    } catch (err) {
      console.error("Failed to record emissions:", err);
      alert("Failed to record emissions.");
    } finally {
      setIsEmissionsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Carbon Credit Marketplace</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track, manage, and trade carbon credits on the blockchain
          </p>
        </header>

        {account ? (
          <div className="mb-6 bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Connected Account</p>
                <p className="text-xs text-gray-500">{account}</p>
              </div>
            </div>
            <button 
              onClick={refreshOrganizationData}
              disabled={isRefreshing || !isRegistered}
              className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-700">Please connect your MetaMask wallet to continue</p>
          </div>
        )}

        {isRegistered ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Organization Profile Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                <h2 className="text-xl font-bold">Organization Profile</h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-start space-x-5 mb-6">
                  {organization.profilePhoto ? (
                    <div className="flex-shrink-0">
                      <img
                        src={`https://imgs.search.brave.com/PixY8_zgl8cU1m2y47bf0V-2jOluOmEHOR4564ScsUA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw`}
                        alt={organization.name}
                        className="w-20 h-20 rounded-lg object-cover shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-10 h-10 text-green-500" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{organization.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {organization.walletAddress.slice(0, 6)}...{organization.walletAddress.slice(-4)}
                    </p>
                    <div className="bg-green-50 px-3 py-1 inline-flex items-center rounded-full">
                      <Award className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-xs font-medium text-green-700">Reputation: {organization.reputationScore}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">About</h4>
                  <p className="text-gray-600">{organization.description}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Carbon Credits Lent</p>
                    <p className="text-lg font-bold text-blue-800">{organization.totalCarbonCreditsLent}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Carbon Credits Borrowed</p>
                    <p className="text-lg font-bold text-purple-800">{organization.totalCarbonCreditsBorrowed}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Carbon Credits Returned</p>
                    <p className="text-lg font-bold text-green-800">{organization.totalCarbonCreditsReturned}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-600 mb-1">Emissions</p>
                    <p className="text-lg font-bold text-red-800">{organization.emissions}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-600 mb-1">Times Borrowed</p>
                    <p className="text-lg font-bold text-yellow-800">{organization.timesBorrowed}</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-xs text-indigo-600 mb-1">Times Lent</p>
                    <p className="text-lg font-bold text-indigo-800">{organization.timesLent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emissions Recording Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
                <h2 className="text-xl font-bold">Record Emissions</h2>
              </div>
              <div className="p-6">
                <div className="mb-4 text-center">
                  <LineChart className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    Record your organization's carbon emissions to maintain transparent reporting
                  </p>
                </div>
                
                <form onSubmit={handleEmissionsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emissions Amount (tons CO2)
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={emissionsInput}
                      onChange={(e) => setEmissionsInput(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="Enter emissions amount"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isEmissionsLoading}
                    className="w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 transition-all"
                  >
                    {isEmissionsLoading ? "Recording..." : "Record Emissions"}
                  </button>
                </form>
                
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500">
                    Current total recorded emissions: <span className="font-medium">{organization.emissions} tons CO2</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <h2 className="text-xl font-bold">Register Your Organization</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6 text-center">
                <Users className="h-16 w-16 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  Join the network of organizations committed to carbon management and sustainable practices
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Enter organization name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Describe your organization's mission and sustainability goals"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (optional)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.profilePhoto && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-700">
                        File selected
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-all shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    "Register Organization"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        <footer className="mt-10 text-center text-gray-500 text-sm">
          <p>Carbon Credit Marketplace on Blockchain - Powered by Ethereum</p>
        </footer>
      </div>
    </div>
  );
}
