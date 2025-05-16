pragma circom 2.0.5;
include "../node_modules/circomlib/circuits/comparators.circom";
template AgeCheck() {
    signal input age;
    signal input ageLimit;
    signal output isAgeAboveLimit;

    component greaterThan = GreaterThan(7);
    greaterThan.in[0] <== age;
    greaterThan.in[1] <== ageLimit;
    isAgeAboveLimit <== greaterThan.out;

}

component main {public [ageLimit]} = AgeCheck();