// ===== CALCULATION FUNCTIONS =====

/**
 * Calculate monthly loan payment using annuity formula
 */
function calculateMonthlyLoanPayment(loanAmount, annualInterestRate, years) {
    if (loanAmount <= 0) return 0;
    
    const monthlyRate = annualInterestRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}

/**
 * Calculate life insurance premium based on age and loan details
 */
function calculateInsurancePremium(age, years, loanAmount) {
    if (loanAmount <= 0) return 0;
    
    const endAge = age + years;
    
    // Reality check: Insurance unavailable for high age + long term
    if (age >= 70 || endAge >= 85 || (age >= 65 && years >= 15) || (age >= 60 && years >= 25)) {
        return -1; // Indicates "not available"
    }
    
    // Mortality risk calculation (simplified)
    let mortalityRisk = 0.05; // 5% for young people over 20 years
    
    if (age >= 65) mortalityRisk = 0.60;        // 60% risk over 10+ years
    else if (age >= 60) mortalityRisk = 0.35;   // 35% risk over 15+ years  
    else if (age >= 55) mortalityRisk = 0.20;   // 20% risk over 20 years
    else if (age >= 50) mortalityRisk = 0.12;   // 12% risk
    else if (age >= 45) mortalityRisk = 0.08;   // 8% risk
    else if (age >= 40) mortalityRisk = 0.06;   // 6% risk
    else if (age >= 35) mortalityRisk = 0.05;   // 5% risk
    else if (age >= 30) mortalityRisk = 0.04;   // 4% risk
    else if (age >= 25) mortalityRisk = 0.03;   // 3% risk
    
    // Term increases risk exponentially for higher ages
    let termMultiplier = 1.0;
    if (age >= 55) {
        termMultiplier = Math.pow(1.12, Math.max(0, years - 10));
    } else {
        termMultiplier = Math.pow(1.05, Math.max(0, years - 15));
    }
    
    const adjustedRisk = Math.min(0.80, mortalityRisk * termMultiplier);
    
    // Insurance calculation: Expected payout + profit margin + administration
    const expectedPayout = loanAmount * adjustedRisk;
    const withMarkup = expectedPayout * CONSTANTS.INSURANCE_MARKUP;
    const monthlyPremium = withMarkup / (years * 12);
    
    return Math.round(monthlyPremium);
}

/**
 * Calculate stock portfolio development with annual rent withdrawals
 */
function calculateStockPortfolio(initialCapital, annualReturn, years, initialRent, rentIncrease) {
    let portfolioValue = initialCapital;
    const annualReturnRate = annualReturn / 100;
    const rentIncreaseRate = rentIncrease / 100;
    let currentRent = initialRent;
    let portfolioDepletedAfter = null;
    
    for (let year = 1; year <= years; year++) {
        // Portfolio grows by annual return
        portfolioValue = portfolioValue * (1 + annualReturnRate);
        
        // Rent increases annually
        currentRent = currentRent * (1 + rentIncreaseRate);
        
        // Withdraw annual rent costs
        const annualRentCosts = currentRent * 12;
        portfolioValue = portfolioValue - annualRentCosts;
        
        // Portfolio cannot go negative
        if (portfolioValue < 0) {
            portfolioDepletedAfter = year;
            portfolioValue = 0;
            break;
        }
    }
    
    return {
        finalValue: portfolioValue,
        depletedAfter: portfolioDepletedAfter
    };
}

/**
 * Calculate property value after appreciation
 */
function calculatePropertyValue(initialValue, annualAppreciation, years) {
    return initialValue * Math.pow(1 + annualAppreciation / 100, years);
}

/**
 * Calculate net monthly stock returns after taxes
 */
function calculateNetStockReturns(capital, annualReturn) {
    const grossAnnualReturn = capital * (annualReturn / 100);
    const taxes = Math.max(0, grossAnnualReturn - CONSTANTS.TAX_FREE_ALLOWANCE) * CONSTANTS.CAPITAL_GAINS_TAX;
    return (grossAnnualReturn - taxes) / 12;
}

/**
 * Calculate future value of monthly savings (annuity formula)
 */
function calculateFutureValueOfSavings(monthlyAmount, annualReturn, years) {
    const monthlyRate = annualReturn / 100 / 12;
    const numberOfMonths = years * 12;
    
    if (monthlyRate > 0) {
        return monthlyAmount * (Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate;
    } else {
        return monthlyAmount * numberOfMonths; // If 0% return
    }
}

/**
 * Main calculation function that orchestrates all calculations
 */
function performCalculation(inputs) {
    const {
        eigenkapital, kaufpreis, wohnflaeche, mietpreisQm, zinssatz, laufzeit,
        aktienrendite, immobilienWertsteigerung, alter, risikoversicherung
    } = inputs;
    
    // Basic calculations
    const loanAmount = kaufpreis - eigenkapital;
    const equityPercentage = (eigenkapital / kaufpreis) * 100;
    const monthlyLoanPayment = calculateMonthlyLoanPayment(loanAmount, zinssatz, laufzeit);
    
    // Surplus capital for cash purchase
    const surplusCapital = loanAmount < 0 ? Math.abs(loanAmount) : 0;
    const totalStockCapital = eigenkapital + surplusCapital;
    
    // Insurance calculation
    let insurancePremium = 0;
    if (risikoversicherung && loanAmount > 0) {
        insurancePremium = calculateInsurancePremium(alter, laufzeit, loanAmount);
    }
    
    // Purchase scenario costs
    const transactionCosts = kaufpreis * CONSTANTS.TRANSACTION_COSTS;
    const monthlyMaintenanceCosts = kaufpreis * CONSTANTS.MAINTENANCE_COSTS / 12;
    const surplusReturns = calculateNetStockReturns(surplusCapital, aktienrendite);
    
    const totalMonthlyCosts = monthlyLoanPayment + monthlyMaintenanceCosts + 
                             (insurancePremium > 0 ? insurancePremium : 0);
    const netPurchaseCosts = totalMonthlyCosts - surplusReturns;
    
    // Rent scenario
    const coldRent = wohnflaeche * mietpreisQm;
    const stockReturns = calculateNetStockReturns(totalStockCapital, aktienrendite);
    const netRentCosts = coldRent - stockReturns;
    
    // Long-term wealth calculation
    const propertyValue = calculatePropertyValue(kaufpreis, immobilienWertsteigerung, laufzeit);
    const surplusStockValue = surplusCapital * Math.pow(1 + aktienrendite / 100, laufzeit);
    const totalPurchaseWealth = propertyValue + surplusStockValue;
    
    const stockPortfolio = calculateStockPortfolio(
        totalStockCapital, aktienrendite, laufzeit, coldRent, immobilienWertsteigerung
    );
    
    // Monthly savings comparison
    const monthlySavings = netPurchaseCosts - netRentCosts;
    const wealthDifference = stockPortfolio.finalValue - totalPurchaseWealth;
    
    // Future value of monthly savings
    const futureValueSavings = calculateFutureValueOfSavings(
        Math.abs(monthlySavings), aktienrendite, laufzeit
    );
    
    // Tax adjustment for future value
    const grossReturnSavings = futureValueSavings - (Math.abs(monthlySavings) * laufzeit * 12);
    const taxesSavings = Math.max(0, grossReturnSavings - CONSTANTS.TAX_FREE_ALLOWANCE) * CONSTANTS.CAPITAL_GAINS_TAX;
    const netFutureValueSavings = futureValueSavings - taxesSavings;
    
    return {
        // Basic data
        eigenkapital,
        kaufpreis,
        wohnflaeche,
        equityPercentage,
        loanAmount,
        surplusCapital,
        
        // Purchase scenario
        monthlyLoanPayment,
        transactionCosts,
        monthlyMaintenanceCosts,
        insurancePremium,
        surplusReturns,
        totalMonthlyCosts,
        netPurchaseCosts,
        
        // Rent scenario
        coldRent,
        stockReturns,
        netRentCosts,
        
        // Long-term comparison
        propertyValue,
        surplusStockValue,
        totalPurchaseWealth,
        stockPortfolio,
        
        // Savings analysis
        monthlySavings,
        wealthDifference,
        netFutureValueSavings,
        
        // Meta
        laufzeit
    };
}