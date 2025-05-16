pragma circom 2.0.0;

template Multiplier() {
    // Input signals
    signal input a;
    signal input b;

    // Output signal
    signal output product;

    // Intermediate signals
    signal temp;

    // Calculate product
    temp <== a * b;
    
    // Assign product to output
    product <== temp;
}

component main = Multiplier();