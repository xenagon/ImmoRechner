// ===== UI FUNCTIONS =====

/**
 * Format currency in German locale
 */
function formatCurrency(amount) {
    return Math.round(amount).toLocaleString('de-DE') + ' €';
}

/**
 * Get input values from form
 */
function getInputValues() {
    return {
        eigenkapital: parseFloat(document.getElementById('eigenkapital').value),
        kaufpreis: parseFloat(document.getElementById('kaufpreis').value),
        wohnflaeche: parseFloat(document.getElementById('wohnflaeche').value),
        mietpreisQm: parseFloat(document.getElementById('mietpreis-qm').value),
        zinssatz: parseFloat(document.getElementById('zinssatz').value),
        laufzeit: parseFloat(document.getElementById('laufzeit').value),
        aktienrendite: parseFloat(document.getElementById('aktienrendite').value),
        immobilienWertsteigerung: parseFloat(document.getElementById('immobilien-wertsteigerung').value),
        alter: parseFloat(document.getElementById('alter').value),
        risikoversicherung: document.getElementById('risikoversicherung').checked,
        region: document.getElementById('region').value
    };
}

/**
 * Update regional prices based on selection
 */
function updateRegionalPrices() {
    const region = document.getElementById('region').value;
    
    if (region !== 'custom' && REGIONAL_PRICES[region]) {
        const prices = REGIONAL_PRICES[region];
        const wohnflaeche = parseFloat(document.getElementById('wohnflaeche').value);
        
        document.getElementById('kaufpreis').value = Math.round(prices.kaufpreis_qm * wohnflaeche);
        document.getElementById('mietpreis-qm').value = prices.mietpreis_qm;
        
        updateInsurancePremium();
        performAndDisplayCalculation();
    }
}

/**
 * Update insurance premium display
 */
function updateInsurancePremium() {
    if (!document.getElementById('risikoversicherung').checked) return;
    
    const inputs = getInputValues();
    const loanAmount = Math.max(0, inputs.kaufpreis - inputs.eigenkapital);
    
    if (loanAmount <= 0) {
        document.getElementById('versicherungsbeitrag').value = "0";
        document.getElementById('versicherungsbeitrag').style.backgroundColor = "";
        return;
    }
    
    const premium = calculateInsurancePremium(inputs.alter, inputs.laufzeit, loanAmount);
    
    if (premium === -1) {
        document.getElementById('versicherungsbeitrag').value = "nicht verfügbar bei der Laufzeit";
        document.getElementById('versicherungsbeitrag').style.backgroundColor = "#ffebee";
    } else {
        document.getElementById('versicherungsbeitrag').value = premium.toString();
        document.getElementById('versicherungsbeitrag').style.backgroundColor = "";
    }
}

/**
 * Toggle insurance input visibility
 */
function toggleInsuranceInputs() {
    const isChecked = document.getElementById('risikoversicherung').checked;
    const detailsElement = document.getElementById('versicherung-details');
    const premiumElement = document.getElementById('versicherung-beitrag');
    
    if (isChecked) {
        detailsElement.style.display = 'block';
        premiumElement.style.display = 'block';
        updateInsurancePremium();
    } else {
        detailsElement.style.display = 'none';
        premiumElement.style.display = 'none';
    }
    
    performAndDisplayCalculation();
}

/**
 * Main function to perform calculation and update results display
 */
function performAndDisplayCalculation() {
    const inputs = getInputValues();
    const results = performCalculation(inputs);
    updateResultsDisplay(results, inputs);
}

/**
 * Update the results section with calculation results
 */
function updateResultsDisplay(results, inputs) {
    const regionName = REGION_NAMES[inputs.region] || 'Unbekannt';
    
    const resultsHTML = `
        <div class="result-card">
            <h3>📍 ${regionName}</h3>
            <div class="result-item">
                <span>Verfügbares Eigenkapital:</span>
                <strong>${formatCurrency(results.eigenkapital)}</strong>
            </div>
            <div class="result-item">
                <span>Gewünschte Immobilie:</span>
                <strong>${formatCurrency(results.kaufpreis)} (${results.wohnflaeche} m²)</strong>
            </div>
            <div class="result-item">
                <span>Eigenkapital-Anteil:</span>
                <strong>${results.equityPercentage.toFixed(1)}%</strong>
            </div>
        </div>
        
        ${generatePurchaseScenarioHTML(results, inputs)}
        ${generateRentScenarioHTML(results)}
        ${generateComparisonHTML(results)}
        ${generateConclusionHTML(results)}
    `;
    
    document.getElementById('results').innerHTML = resultsHTML;
}

/**
 * Generate HTML for purchase scenario
 */
function generatePurchaseScenarioHTML(results, inputs) {
    const isCashPurchase = results.loanAmount <= 0;
    
    let html = `
        <div class="result-card">
            <h3>🏠 Kauf-Szenario</h3>
    `;
    
    if (isCashPurchase) {
        html += `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 12px; margin-bottom: 15px; color: #155724; font-size: 14px;">
                💰 <strong>Barkauf möglich!</strong> Sie haben ${formatCurrency(results.surplusCapital)} Restkapital für zusätzliche Aktienanlage.
            </div>
        `;
    }
    
    html += `
            <div class="result-item">
                <span>${isCashPurchase ? 'Barkauf - keine Finanzierung nötig' : 'Darlehenssumme'}:</span>
                <strong>${isCashPurchase ? '0 €' : formatCurrency(results.loanAmount)}</strong>
            </div>
            <div class="result-item">
                <span>Nebenkosten einmalig:</span>
                <strong>${formatCurrency(results.transactionCosts)}</strong>
            </div>
            <div class="result-item">
                <span>Kreditrate/Monat:</span>
                <strong>${isCashPurchase ? '0 €' : formatCurrency(results.monthlyLoanPayment)}</strong>
            </div>
    `;
    
    if (results.surplusCapital > 0) {
        html += `
            <div class="result-item">
                <span>Restkapital-Rendite/Monat:</span>
                <strong>${formatCurrency(results.surplusReturns)}</strong>
            </div>
        `;
    }
    
    html += `
            <div class="result-item">
                <span>Zusatzkosten/Monat:</span>
                <strong>${formatCurrency(results.monthlyMaintenanceCosts)}</strong>
            </div>
    `;
    
    if (inputs.risikoversicherung) {
        const insuranceText = results.insurancePremium > 0 ? 
            formatCurrency(results.insurancePremium) : 'Nicht verfügbar';
        html += `
            <div class="result-item">
                <span>Risikolebensversicherung/Monat:</span>
                <strong>${insuranceText}</strong>
            </div>
        `;
    }
    
    html += `
            <div class="highlight">
                Netto-Kosten pro Monat: ${formatCurrency(results.netPurchaseCosts)}
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Generate HTML for rent scenario
 */
function generateRentScenarioHTML(results) {
    let html = `
        <div class="result-card">
            <h3>🏠📈 Miete + Aktien-Szenario</h3>
    `;
    
    if (results.stockPortfolio.depletedAfter) {
        html += `
            <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 8px; padding: 15px; margin-bottom: 15px; color: #c62828;">
                ⚠️ <strong>WARNUNG: Aktienportfolio aufgebraucht!</strong><br>
                Das Portfolio reicht nur für <strong>${results.stockPortfolio.depletedAfter} Jahre</strong> statt der geplanten ${results.laufzeit} Jahre.<br>
                Danach müssten Sie die steigenden Mietkosten aus anderen Quellen finanzieren.
            </div>
        `;
    }
    
    html += `
            <div class="result-item">
                <span>Kaltmiete/Monat:</span>
                <strong>${formatCurrency(results.coldRent)}</strong>
            </div>
            <div style="font-size: 12px; color: #6c757d; margin-top: 5px; padding: 8px; background: #f8f9fa; border-radius: 5px;">
                ℹ️ <strong>Hinweis:</strong> Nebenkosten (Heizung, Strom, etc.) fallen bei beiden Szenarien an und sind daher nicht vergleichsrelevant.
            </div>
            <div class="result-item">
                <span>Aktienrendite (netto)/Monat:</span>
                <strong>${formatCurrency(results.stockReturns)}</strong>
            </div>
            <div class="highlight">
                ${results.netRentCosts < 0 
                    ? `Kapitalertrag: +${formatCurrency(Math.abs(results.netRentCosts))} (Sie verdienen beim Wohnen!)` 
                    : `Netto-Wohnkosten: ${formatCurrency(results.netRentCosts)}`
                }
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Generate HTML for comparison section
 */
function generateComparisonHTML(results) {
    let html = `
        <div class="result-card">
            <h3>⚖️ Vergleich</h3>
            <div class="comparison ${results.monthlySavings < 0 ? 'negative' : ''}">
                <strong>Monatliche Ersparnis durch Miete + Aktien:</strong><br>
                ${results.monthlySavings > 0 ? '+' : ''}${formatCurrency(results.monthlySavings)}
            </div>
            
            <h4 style="margin-top: 20px; color: #2c3e50;">Vermögen nach ${results.laufzeit} Jahren:</h4>
            <div class="result-item">
                <span>Immobilienwert:</span>
                <strong>${formatCurrency(results.propertyValue)}</strong>
            </div>
    `;
    
    if (results.surplusCapital > 0) {
        html += `
            <div class="result-item">
                <span>+ Restkapital-Aktienanlage:</span>
                <strong>${formatCurrency(results.surplusStockValue)}</strong>
            </div>
            <div class="result-item" style="border-top: 2px solid #2c3e50; margin-top: 8px; padding-top: 8px;">
                <span><strong>Gesamt Kauf-Vermögen:</strong></span>
                <strong>${formatCurrency(results.totalPurchaseWealth)}</strong>
            </div>
        `;
    }
    
    html += `
            <div class="result-item">
                <span>Aktienportfolio (Miete):</span>
                <strong>${formatCurrency(results.stockPortfolio.finalValue)}${results.stockPortfolio.depletedAfter ? ` (aufgebraucht nach ${results.stockPortfolio.depletedAfter} Jahren)` : ''}</strong>
            </div>
            <div class="comparison ${results.wealthDifference < 0 ? 'negative' : ''}">
                ${results.wealthDifference > 0 
                    ? `<strong>Vermögens-Vorteil Aktien:</strong><br>+${formatCurrency(results.wealthDifference)}`
                    : `<strong>Vermögens-Vorteil Kauf:</strong><br>+${formatCurrency(Math.abs(results.wealthDifference))}`
                }
            </div>
            
            <div style="background: #e3f2fd; border-left: 5px solid #2196f3; padding: 15px; margin-top: 15px; border-radius: 5px;">
                <strong>💰 Kapitalwert der monatlichen Ersparnis:</strong><br>
                ${results.monthlySavings > 0 
                    ? `Wenn Sie die monatliche Ersparnis von ${formatCurrency(results.monthlySavings)} in Aktien anlegen:<br><strong>Endwert nach ${results.laufzeit} Jahren: ${formatCurrency(results.netFutureValueSavings)}</strong>`
                    : results.monthlySavings < 0
                    ? `Wenn Sie die monatlichen Mehrkosten von ${formatCurrency(Math.abs(results.monthlySavings))} vermeiden könnten:<br><strong>Entgangener Wert nach ${results.laufzeit} Jahren: ${formatCurrency(results.netFutureValueSavings)}</strong>`
                    : 'Keine monatliche Differenz - gleiche Kosten'
                }
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Generate HTML for conclusion section
 */
function generateConclusionHTML(results) {
    let conclusion;
    
    if (results.stockPortfolio.depletedAfter) {
        conclusion = `🚨 <strong>Kritisches Ergebnis:</strong> Das Aktienportfolio reicht nur ${results.stockPortfolio.depletedAfter} Jahre. Danach entstehen hohe Finanzierungslücken bei steigenden Mietkosten. Der Immobilienkauf ist hier deutlich sicherer.`;
    } else if (results.monthlySavings > 0 && results.wealthDifference > 0) {
        conclusion = '✅ <strong>Miete + Aktienanlage ist in beiden Kategorien überlegen!</strong> Sie sparen monatlich Geld und bauen langfristig mehr Vermögen auf.';
    } else if (results.monthlySavings > 0) {
        conclusion = '⚖️ <strong>Gemischtes Bild:</strong> Miete + Aktien spart monatlich Geld, aber das Endvermögen ist anders zu bewerten.';
    } else {
        conclusion = '🏠 <strong>Kauf könnte interessant sein:</strong> Prüfen Sie zusätzliche Faktoren wie Flexibilität, Instandhaltungsrisiken und Ihre persönliche Situation.';
    }
    
    return `
        <div class="result-card">
            <h3>📋 Fazit</h3>
            <p style="line-height: 1.6; color: #2c3e50;">
                ${conclusion}
            </p>
        </div>
    `;
}