import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x579Af937f3ce12B4E76bAea112EFa09D4f345f75"; // Replace with your contract address

const abi = [
  {
    type: "function",
    name: "getClaimDetailsPublic",
    inputs: [{ name: "_claimId", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "organisationAddress", type: "address" },
          { name: "demandedCarbonCredits", type: "uint256" },
          { name: "voting_end_time", type: "uint256" },
          { name: "status", type: "uint256" },
          { name: "description", type: "string" },
          { name: "latitudes", type: "uint256" },
          { name: "longitudes", type: "uint256" },
          { name: "proofIpfsHashCode", type: "string[]" },
          { name: "yes_votes", type: "uint256" },
          { name: "no_votes", type: "uint256" },
          { name: "total_votes", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vote",
    inputs: [
      { name: "_claimId", type: "uint256" },
      { name: "_vote", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "handleVotingResult",
    inputs: [{ name: "_claimId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const MAX_CLAIMS = 50; // max ID to attempt

const AllClaims = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClaims = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask not found");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const allClaims: any[] = [];

        for (let i = 1; i <= MAX_CLAIMS; i++) {
          try {
            const data = await contract.getClaimDetailsPublic(i);

            // Optional: skip empty IDs if contract returns default for invalid ones
            if (data.id === BigInt(0)) break;

            allClaims.push({
              id: Number(data.id),
              org: data.organisationAddress,
              credits: Number(data.demandedCarbonCredits),
              votingEnd: Number(data.voting_end_time),
              status: Number(data.status),
              description: data.description,
              lat: Number(data.latitudes),
              lng: Number(data.longitudes),
              proofs: data.proofIpfsHashCode,
              yes: Number(data.yes_votes),
              no: Number(data.no_votes),
              total: Number(data.total_votes),
            });
          } catch (innerErr) {
            break; // stop fetching on first failure (invalid ID)
          }
        }

        setClaims(allClaims);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, []);

  if (loading) return <div className="p-4 text-lg">Loading claims...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Claims</h1>
      {claims.map((claim) => (
        <div key={claim.id} className="mb-6 p-4 border rounded shadow bg-white">
          <h2 className="text-xl font-semibold mb-2">Claim #{claim.id}</h2>
          <p className="text-gray-700 mb-1">
            <strong>Description:</strong> {claim.description}
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Organization:</strong> {claim.org}
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Carbon Credits:</strong> {claim.credits}
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Votes:</strong> ✅ {claim.yes} / ❌ {claim.no} (Total: {claim.total})
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Status:</strong> {['Active', 'Approved', 'Rejected'][claim.status]}
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Voting Ends:</strong> {new Date(claim.votingEnd * 1000).toLocaleString()}
          </p>
          <p className="text-gray-700">
            <strong>Location:</strong> ({claim.lat}, {claim.lng})
          </p>
        </div>
      ))}
    </div>
  );
};

export default AllClaims;
