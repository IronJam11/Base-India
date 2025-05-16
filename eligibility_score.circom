pragma circom 2.0.6;
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template EligibilityScore() {
    // Input signals
    signal input borrowerTimesBorrowed;
    signal input borrowerTimesRepaid;
    signal input borrowerTotalReturned;
    signal input borrowerCreditScore;
    signal input borrowerTimesLent;
    signal input borrowerRequestAmount;
    signal input lenderBalance;
    signal input lenderTimesLent;
    
    // Output signal (0-100 score)
    signal output eligibilityScore;
    
    // Intermediate calculations
    signal repaymentRatio;
    signal creditScoreWeight;
    signal borrowingHistoryScore;
    signal amountRiskFactor;
    signal lenderExperienceFactor;
    
    // Constants for weights (can be adjusted)
    var WEIGHT_REPAYMENT_RATIO = 30;
    var WEIGHT_CREDIT_SCORE = 25;
    var WEIGHT_BORROWING_HISTORY = 20;
    var WEIGHT_AMOUNT_RISK = 15;
    var WEIGHT_LENDER_EXPERIENCE = 10;
    
    // Calculate repayment ratio (avoid division by zero)
    component isZero = IsZero();
    isZero.in <== borrowerTimesBorrowed;
    
    signal nonZeroBorrowed;
    nonZeroBorrowed <== borrowerTimesBorrowed + isZero.out;
    
    repaymentRatio <== (borrowerTimesRepaid * 100) / nonZeroBorrowed;
    
    // Normalize credit score to 0-100 range
    creditScoreWeight <== borrowerCreditScore > 100 ? 100 : borrowerCreditScore;
    
    // Calculate borrowing history score
    component gt = GreaterThan(32);
    gt.in[0] <== borrowerTimesLent;
    gt.in[1] <== borrowerTimesBorrowed;
    
    borrowingHistoryScore <== gt.out * 50 + 50; // 50-100 range
    
    // Calculate amount risk factor (0-100)
    signal normalizedAmount;
    normalizedAmount <== (borrowerRequestAmount * 100) / (lenderBalance + 1); // +1 to avoid div by 0
    
    component amountGt = GreaterThan(32);
    amountGt.in[0] <== normalizedAmount;
    amountGt.in[1] <== 100;
    
    amountRiskFactor <== 100 - (amountGt.out * 100 + (1 - amountGt.out) * normalizedAmount);
    
    // Calculate lender experience factor
    component expGt = GreaterThan(32);
    expGt.in[0] <== lenderTimesLent;
    expGt.in[1] <== 10; // Threshold for "experienced"
    
    lenderExperienceFactor <== expGt.out * 100 + (1 - expGt.out) * (lenderTimesLent * 10);
    
    // Calculate final weighted score
    signal weightedRepayment;
    signal weightedCredit;
    signal weightedHistory;
    signal weightedRisk;
    signal weightedExperience;
    
    weightedRepayment <== (repaymentRatio * WEIGHT_REPAYMENT_RATIO) / 100;
    weightedCredit <== (creditScoreWeight * WEIGHT_CREDIT_SCORE) / 100;
    weightedHistory <== (borrowingHistoryScore * WEIGHT_BORROWING_HISTORY) / 100;
    weightedRisk <== (amountRiskFactor * WEIGHT_AMOUNT_RISK) / 100;
    weightedExperience <== (lenderExperienceFactor * WEIGHT_LENDER_EXPERIENCE) / 100;
    
    // Sum all weighted factors
    eligibilityScore <== weightedRepayment + weightedCredit + weightedHistory + weightedRisk + weightedExperience;
    
    // Constrain output to 0-100 range
    component lt100 = LessThan(32);
    lt100.in[0] <== eligibilityScore;
    lt100.in[1] <== 101;
    
    component gt0 = GreaterThan(32);
    gt0.in[0] <== eligibilityScore;
    gt0.in[1] <== -1;
    
    eligibilityScore * (1 - lt100.out) === 100 * (1 - lt100.out);
    eligibilityScore * (1 - gt0.out) === 0 * (1 - gt0.out);
}

component main {public [borrowerRequestAmount, lenderBalance]} = EligibilityScore();