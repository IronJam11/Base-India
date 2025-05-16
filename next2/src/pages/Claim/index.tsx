import React, { useEffect, useState } from 'react';

interface Claim {
  id: number;
  organization: string;
  longitudes: string[];
  latitudes: string[];
  time_started: number;
  time_ended: number;
  demanded_tokens: string;
  ipfs_hashes: string[];
  status: 'Active' | 'Approved' | 'Rejected';
  voting_end_time: number;
  yes_votes: string;
  no_votes: string;
}

const ActiveClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');

  useEffect(() => {
    // Fetch claims from the backend API
    const fetchClaims = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/claims');
        if (!response.ok) {
          throw new Error('Failed to fetch claims');
        }
        const data = await response.json();

        // Check if the response is successful and contains claims
        if (data.success && data.claims) {
          setClaims(data.claims);
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

    fetchClaims();
  }, []);

  const handleVote = (voteType: 'yes' | 'no') => {
    setVoteMessage(`You voted ${voteType === 'yes' ? 'Yes' : 'No'}. Thanks for voting!`);
    setShowPopup(true);
    // Here you can also add logic to send the vote to the backend
  };

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-6xl mx-auto text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Active Claims</h1>

      {claims.map((claim) => {
        // Convert backend data to frontend format
        const frontendClaim = {
          id: claim.id.toString(),
          type: 'Claim', // Default type
          status: claim.status === 'Active' ? 'Voting in Progress' : 'Completed',
          orgWallet: claim.organization,
          location: `${claim.latitudes[0]}° N, ${claim.longitudes[0]}° W`, // Example location
          demandedTokens: parseInt(claim.demanded_tokens, 10),
          created: new Date(claim.time_started * 1000).toLocaleDateString(),
          completed: claim.status !== 'Active' ? new Date(claim.time_ended * 1000).toLocaleDateString() : undefined,
          organization: claim.organization,
          category: 'General', // Default category
          proofImages: claim.ipfs_hashes.map((hash) => `https://ipfs.io/ipfs/${hash}`), // Convert IPFS hashes to URLs
          votingEndsIn: claim.status === 'Active' ? new Date(claim.voting_end_time * 1000).toLocaleTimeString() : undefined,
          finalResult: claim.status === 'Approved' ? 'Approved' : claim.status === 'Rejected' ? 'Rejected' : undefined,
          votingResults:
            claim.status !== 'Active'
              ? {
                  yes: parseInt(claim.yes_votes, 10),
                  no: parseInt(claim.no_votes, 10),
                }
              : undefined,
        };

        return (
          <div key={claim.id} className="bg-white rounded-lg shadow-md mb-6 p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{frontendClaim.type} #{frontendClaim.id}</h2>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${frontendClaim.status === 'Voting in Progress' ? 'text-orange-600' : 'text-green-600'}`}>
                    {frontendClaim.status}
                  </span>
                  <span className="ml-2 text-gray-500">Status:</span>
                </div>
              </div>

              {frontendClaim.status === 'Voting in Progress' && (
                <div className="bg-red-100 px-4 py-2 rounded-md">
                  <p className="text-sm">Ends in</p>
                  <p className="font-bold text-red-600">{frontendClaim.votingEndsIn}</p>
                </div>
              )}

              {frontendClaim.finalResult && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Final Result</p>
                  <p className={`font-bold ${frontendClaim.finalResult === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                    {frontendClaim.finalResult}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2">📁</span>
                  <span className="mr-2 font-medium">Org Wallet:</span>
                  <span>{frontendClaim.orgWallet}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="mr-2">📍</span>
                  <span className="mr-2 font-medium">Location:</span>
                  <span>{frontendClaim.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💰</span>
                  <span className="mr-2 font-medium">Demanded Tokens:</span>
                  <span>{frontendClaim.demandedTokens} USDT</span>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2">📅</span>
                  <span className="mr-2 font-medium">
                    {frontendClaim.status === 'Voting in Progress' ? 'Created:' : 'Completed:'}
                  </span>
                  <span>{frontendClaim.status === 'Voting in Progress' ? frontendClaim.created : frontendClaim.completed}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="mr-2">🏢</span>
                  <span className="mr-2 font-medium">Organization:</span>
                  <span>{frontendClaim.organization}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🏷️</span>
                  <span className="mr-2 font-medium">Category:</span>
                  <span>{frontendClaim.category}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Proof Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {frontendClaim.proofImages.map((img, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <img src={img} alt={`Proof ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {frontendClaim.status === 'Voting in Progress' && (
              <div>
                <h3 className="text-lg font-medium mb-2">Cast Your Vote</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-md flex justify-center items-center"
                    onClick={() => handleVote('yes')}
                  >
                    <span className="mr-2">✓</span> Vote Yes
                  </button>
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-md flex justify-center items-center"
                    onClick={() => handleVote('no')}
                  >
                    <span className="mr-2">✕</span> Vote No
                  </button>
                </div>
              </div>
            )}

            {frontendClaim.votingResults && (
              <div>
                <h3 className="text-lg font-medium mb-2">Final Voting Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-green-600">{frontendClaim.votingResults.yes}%</p>
                    <p>Yes Votes</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-red-600">{frontendClaim.votingResults.no}%</p>
                    <p>No Votes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-medium mb-4">{voteMessage}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveClaims;