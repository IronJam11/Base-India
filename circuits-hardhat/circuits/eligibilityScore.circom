pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/comparators.circom";

template Multiplier() {

    signal input EXPECTED_MINIMUM_CREDIT_SCORE;
    signal input EXPECTED_MAXIMUM_OFFSET;
    // Input signals
    signal input borrowerTimesRepaid;          // e.g., 8
    signal input borrowerOffset;        // e.g., 12000 (scale down by 1000)
    signal input borrowerCreditScore;          // e.g., 78
    signal input borrowerTimesLent;    
    signal input borrowerTotalReturned;       // e.g., 3
    signal input borrowerRequestAmount;        // e.g., 5000 (scale down by 1000)
    signal input lenderBalance;                
    signal input lenderTimesLent; 

    // Output signal
    signal output eligibilityScore;
    signal output recommendation; // binary recommendation: 0 or 1

    // Intermediate signals
    var temp;
    var  operation2;
    var  operation3;
    var  operation4;
    var  operation5;
    

    // Calculate product
    temp = borrowerTimesRepaid * borrowerTotalReturned;
    operation2 = (EXPECTED_MINIMUM_CREDIT_SCORE - borrowerCreditScore);
    operation3 = (EXPECTED_MAXIMUM_OFFSET - borrowerOffset) ;
    operation4 = lenderTimesLent + borrowerTimesLent + borrowerTimesRepaid;
    operation5 = borrowerOffset + borrowerRequestAmount - lenderBalance;
    component greaterThan = GreaterThan(7);
    greaterThan.in[0] <== borrowerCreditScore;
    greaterThan.in[1] <== EXPECTED_MINIMUM_CREDIT_SCORE;

    recommendation <== greaterThan.out;

    eligibilityScore <== 
        (temp * 2) +           // Weight: 2x
        (operation2 * 3) +     // Weight: 3x (scaled)
        (operation3 * 1) -     // Weight: 1x
        (operation4 * 1) -     // Weight: -1x
        (operation5 * 2);      // Weight: -2x (scaled)
}

component main = Multiplier();