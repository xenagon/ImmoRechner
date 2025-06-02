// ===== EVENT LISTENERS & INITIALIZATION =====

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateInsurancePremium();
    performAndDisplayCalculation();
});

/**
 * Set up all event listeners
 */
function initializeEventListeners() {
    // Region change handler
    document.getElementById('region').addEventListener('change', updateRegionalPrices);
    
    // Living space change handler
    document.getElementById('wohnflaeche').addEventListener('input', function() {
        updateRegionalPrices();
    });
    
    // Rent price per sqm change handler
    document.getElementById('mietpreis-qm').addEventListener('input', function() {
        updateInsurancePremium();
        performAndDisplayCalculation();
    });
    
    // Risk insurance toggle
    document.getElementById('risikoversicherung').addEventListener('change', toggleInsuranceInputs);
    
    // Input fields that affect insurance calculation
    const insuranceInputs = ['alter', 'laufzeit', 'kaufpreis', 'eigenkapital'];
    insuranceInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            updateInsurancePremium();
            performAndDisplayCalculation();
        });
    });
    
    // All other input fields that trigger recalculation
    const calculationInputs = ['zinssatz', 'aktienrendite', 'immobilien-wertsteigerung'];
    calculationInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', performAndDisplayCalculation);
    });
    
    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', performAndDisplayCalculation);
}

/**
 * Validation helper functions
 */
function validateInputs(inputs) {
    const errors = [];
    
    if (inputs.eigenkapital < 0) {
        errors.push('Eigenkapital muss positiv sein');
    }
    
    if (inputs.kaufpreis <= 0) {
        errors.push('Kaufpreis muss größer als 0 sein');
    }
    
    if (inputs.wohnflaeche <= 0) {
        errors.push('Wohnfläche muss größer als 0 sein');
    }
    
    if (inputs.mietpreisQm < 0) {
        errors.push('Mietpreis muss positiv sein');
    }
    
    if (inputs.zinssatz < 0 || inputs.zinssatz > 20) {
        errors.push('Zinssatz sollte zwischen 0% und 20% liegen');
    }
    
    if (inputs.laufzeit <= 0 || inputs.laufzeit > 50) {
        errors.push('Laufzeit sollte zwischen 1 und 50 Jahren liegen');
    }
    
    if (inputs.aktienrendite < -10 || inputs.aktienrendite > 30) {
        errors.push('Aktienrendite sollte zwischen -10% und 30% liegen');
    }
    
    if (inputs.immobilienWertsteigerung < -5 || inputs.immobilienWertsteigerung > 15) {
        errors.push('Immobilien-Wertsteigerung sollte zwischen -5% und 15% liegen');
    }
    
    if (inputs.alter < 18 || inputs.alter > 85) {
        errors.push('Alter sollte zwischen 18 und 85 Jahren liegen');
    }
    
    return errors;
}

/**
 * Show validation errors to user
 */
function showValidationErrors(errors) {
    if (errors.length > 0) {
        const errorMessage = `
            <div class="result-card" style="background: #ffebee; border: 2px solid #f44336;">
                <h3 style="color: #c62828;">⚠️ Eingabefehler</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #c62828;">
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        document.getElementById('results').innerHTML = errorMessage;
        return true;
    }
    return false;
}

/**
 * Enhanced calculation function with validation
 */
function performAndDisplayCalculation() {
    try {
        const inputs = getInputValues();
        const validationErrors = validateInputs(inputs);
        
        if (showValidationErrors(validationErrors)) {
            return;
        }
        
        const results = performCalculation(inputs);
        updateResultsDisplay(results, inputs);
        
    } catch (error) {
        console.error('Calculation error:', error);
        document.getElementById('results').innerHTML = `
            <div class="result-card" style="background: #ffebee; border: 2px solid #f44336;">
                <h3 style="color: #c62828;">🚨 Berechnungsfehler</h3>
                <p style="color: #c62828;">
                    Es ist ein Fehler bei der Berechnung aufgetreten. Bitte überprüfen Sie Ihre Eingaben.
                </p>
            </div>
        `;
    }
}

/**
 * Utility function for debugging
 */
function logCalculationInputs() {
    const inputs = getInputValues();
    console.log('Current inputs:', inputs);
    return inputs;
}

// Make functions available globally for debugging
window.logInputs = logCalculationInputs;
window.recalculate = performAndDisplayCalculation;