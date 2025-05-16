require("@nomicfoundation/hardhat-toolbox");
require('hardhat-circom');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  circom: {
    inputBasePath: "./circuits",
    ptau: './powersOfTau28_hez_final_19.ptau',
    circuits : [
      {
        name:'eligibilityScore',
      }
    ]

  }
};
