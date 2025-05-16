import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x579Af937f3ce12B4E76bAea112EFa09D4f345f75";

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
];

const MAX_CLAIMS = 50;

const AllClaims = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [votedClaims, setVotedClaims] = useState<{ [claimId: number]: boolean }>({});

  useEffect(() => {
    const loadClaims = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask not found");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contract = new ethers.Contract(contractAddress, abi, signer);
        const allClaims: any[] = [];

        for (let i = 1; i <= MAX_CLAIMS; i++) {
          try {
            const data = await contract.getClaimDetailsPublic(i);
            if (data.id === BigInt(0)) break;

            allClaims.push({
              id: Number(data.id),
              org: data.organisationAddress.toLowerCase(),
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
            break;
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

  const handleVote = async (claimId: number, voteValue: boolean) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.vote(claimId, voteValue);
      await tx.wait();

      // Mark as voted locally
      setVotedClaims((prev) => ({ ...prev, [claimId]: true }));

      // Update the UI to reflect new votes
      const updatedClaims = claims.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              yes: voteValue ? claim.yes + 1 : claim.yes,
              no: !voteValue ? claim.no + 1 : claim.no,
              total: claim.total + 1,
            }
          : claim
      );
      setClaims(updatedClaims);
    } catch (err: any) {
      alert("Vote failed or already voted.");
    }
  };

  if (loading) return <div className="p-4 text-lg">Loading claims...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Claims</h1>
      {claims.map((claim) => {
        const isOrg = account?.toLowerCase() === claim.org;
        const alreadyVoted = votedClaims[claim.id];

        return (
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
              <strong>Status:</strong> {["Active", "Approved", "Rejected"][claim.status]}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Voting Ends:</strong> {new Date(claim.votingEnd * 1000).toLocaleString()}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Location:</strong> ({claim.lat}, {claim.lng})
            </p>

            {!isOrg && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(claim.id, true)}
                  disabled={alreadyVoted}
                  className={`px-4 py-2 rounded font-semibold text-white ${
                    alreadyVoted ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Vote Yes
                </button>
                <button
                  onClick={() => handleVote(claim.id, false)}
                  disabled={alreadyVoted}
                  className={`px-4 py-2 rounded font-semibold text-white ${
                    alreadyVoted ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Vote No
                </button>
              </div>
            )}

            {isOrg && (
              <p className="text-sm mt-2 text-blue-500">You created this claim. Voting disabled.</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AllClaims;
