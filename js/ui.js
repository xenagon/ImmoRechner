// ===== UI FUNCTIONS - SAFELY REFACTORED =====

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

// ===== TEMPLATE HELPER FUNCTIONS =====

/**
 * Generate a standard result item row
 */
function generateResultItem(label, value) {
    return `
        <div class="result-item">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `;
}

/**
 * Generate a highlight box
 */
function generateHighlightBox(content) {
    return `
        <div class="highlight">
            ${content}
        </div>
    `;
}

/**
 * Generate comparison box
 */
function generateComparisonBox(content, isNegative = false) {
    const cssClass = isNegative ? 'comparison negative' : 'comparison';
    return `
        <div class="${cssClass}">
            ${content}
        </div>
    `;
}

/**
 * Generate info box with different styles
 */
function generateInfoBox(content, type = 'info') {
    const styles = {
        info: 'background: #e3f2fd; border-left: 5px solid #2196f3;',
        warning: 'background: #fff3cd; border: 1px solid #ffeaa7;',
        success: 'background: #d4edda; border: 1px solid #c3e6cb;',
        danger: 'background: #ffebee; border: 2px solid #f44336;'
    };
    
    return `
        <div style="${styles[type]} padding: 15px; margin-top: 15px; border-radius: 5px;">
            ${content}
        </div>
    `;
}

// ===== INDIVIDUAL CARD GENERATORS =====

/**
 * Generate region information card
 */
function generateRegionCard(results, inputs) {
    const regionName = REGION_NAMES[inputs.region] || 'Unbekannt';
    
    return `
        <div class="result-card">
            <h3>📍 ${regionName}</h3>
            ${generateResultItem('Verfügbares Eigenkapital:', formatCurrency(results.eigenkapital))}
            ${generateResultItem('Gewünschte Immobilie:', `${formatCurrency(results.kaufpreis)} (${results.wohnflaeche} m²)`)}
            ${generateResultItem('Eigenkapital-Anteil:', results.equityPercentage.toFixed(1) + '%')}
        </div>
    `;
}

/**
 * Generate purchase scenario card
 */
function generatePurchaseCard(results, inputs) {
    const isCashPurchase = results.loanAmount <= 0;
    
    let html = `
        <div class="result-card">
            <h3>🏠 Kauf-Szenario</h3>
    `;
    
    // Cash purchase notification
    if (isCashPurchase) {
        const content = `💰 <strong>Barkauf möglich!</strong> Sie haben ${formatCurrency(results.surplusCapital)} Restkapital für zusätzliche Aktienanlage.`;
        html += generateInfoBox(content, 'success');
    }
    
    // Loan details
    const loanLabel = isCashPurchase ? 'Barkauf - keine Finanzierung nötig' : 'Darlehenssumme';
    const loanValue = isCashPurchase ? '0 €' : formatCurrency(results.loanAmount);
    const rateValue = isCashPurchase ? '0 €' : formatCurrency(results.monthlyLoanPayment);
    
    html += generateResultItem(loanLabel, loanValue);
    html += generateResultItem('Nebenkosten einmalig:', formatCurrency(results.transactionCosts));
    html += generateResultItem('Kreditrate/Monat:', rateValue);
    
    if (results.surplusCapital > 0) {
        html += generateResultItem('Restkapital-Rendite/Monat:', formatCurrency(results.surplusReturns));
    }
    
    html += generateResultItem('Zusatzkosten/Monat:', formatCurrency(results.monthlyMaintenanceCosts));
    
    if (inputs.risikoversicherung) {
        const insuranceText = results.insurancePremium > 0 ? 
            formatCurrency(results.insurancePremium) : 'Nicht verfügbar';
        html += generateResultItem('Risikolebensversicherung/Monat:', insuranceText);
    }
    
    html += generateHighlightBox(`Netto-Kosten pro Monat: ${formatCurrency(results.netPurchaseCosts)}`);
    html += `</div>`;
    
    return html;
}

/**
 * Generate rent scenario card
 */
function generateRentCard(results) {
    let html = `
        <div class="result-card">
            <h3>🏠📈 Miete + Aktien-Szenario</h3>
    `;
    
    // Portfolio depletion warning
    if (results.stockPortfolio.depletedAfter) {
        const content = `
            ⚠️ <strong>WARNUNG: Aktienportfolio aufgebraucht!</strong><br>
            Das Portfolio reicht nur für <strong>${results.stockPortfolio.depletedAfter} Jahre</strong> statt der geplanten ${results.laufzeit} Jahre.<br>
            Danach müssten Sie die steigenden Mietkosten aus anderen Quellen finanzieren.
        `;
        html += generateInfoBox(content, 'danger');
    }
    
    html += generateResultItem('Kaltmiete/Monat:', formatCurrency(results.coldRent));
    
    html += `
        <div style="font-size: 12px; color: #6c757d; margin-top: 5px; padding: 8px; background: #f8f9fa; border-radius: 5px;">
            ℹ️ <strong>Hinweis:</strong> Nebenkosten (Heizung, Strom, etc.) fallen bei beiden Szenarien an und sind daher nicht vergleichsrelevant.
        </div>
    `;
    
    html += generateResultItem('Aktienrendite (netto)/Monat:', formatCurrency(results.stockReturns));
    
    const netCostsText = results.netRentCosts < 0 
        ? `Kapitalertrag: +${formatCurrency(Math.abs(results.netRentCosts))} (Sie verdienen beim Wohnen!)`
        : `Netto-Wohnkosten: ${formatCurrency(results.netRentCosts)}`;
        
    html += generateHighlightBox(netCostsText);
    html += `</div>`;
    
    return html;
}

/**
 * Generate comparison card
 */
function generateComparisonCard(results) {
    let html = `
        <div class="result-card">
            <h3>⚖️ Vergleich</h3>
    `;
    
    // Monthly savings comparison
    const savingsContent = `
        <strong>Monatliche Ersparnis durch Miete + Aktien:</strong><br>
        ${results.monthlySavings > 0 ? '+' : ''}${formatCurrency(results.monthlySavings)}
    `;
    html += generateComparisonBox(savingsContent, results.monthlySavings < 0);
    
    // Wealth comparison
    html += `<h4 style="margin-top: 20px; color: #2c3e50;">Vermögen nach ${results.laufzeit} Jahren:</h4>`;
    html += generateResultItem('Immobilienwert:', formatCurrency(results.propertyValue));
    
    if (results.surplusCapital > 0) {
        html += generateResultItem('+ Restkapital-Aktienanlage:', formatCurrency(results.surplusStockValue));
        html += `
            <div class="result-item" style="border-top: 2px solid #2c3e50; margin-top: 8px; padding-top: 8px;">
                <span><strong>Gesamt Kauf-Vermögen:</strong></span>
                <strong>${formatCurrency(results.totalPurchaseWealth)}</strong>
            </div>
        `;
    }
    
    const portfolioText = results.stockPortfolio.depletedAfter ? 
        ` (aufgebraucht nach ${results.stockPortfolio.depletedAfter} Jahren)` : '';
    html += generateResultItem('Aktienportfolio (Miete):', formatCurrency(results.stockPortfolio.finalValue) + portfolioText);
    
    const wealthAdvantage = results.wealthDifference > 0 ? 
        `<strong>Vermögens-Vorteil Aktien:</strong><br>+${formatCurrency(results.wealthDifference)}` :
        `<strong>Vermögens-Vorteil Kauf:</strong><br>+${formatCurrency(Math.abs(results.wealthDifference))}`;
    
    html += generateComparisonBox(wealthAdvantage, results.wealthDifference < 0);
    
    // Capital value of savings
    let capitalContent = '<strong>💰 Kapitalwert der monatlichen Ersparnis:</strong><br>';
    if (results.monthlySavings > 0) {
        capitalContent += `Wenn Sie die monatliche Ersparnis von ${formatCurrency(results.monthlySavings)} in Aktien anlegen:<br><strong>Endwert nach ${results.laufzeit} Jahren: ${formatCurrency(results.netFutureValueSavings)}</strong>`;
    } else if (results.monthlySavings < 0) {
        capitalContent += `Wenn Sie die monatlichen Mehrkosten von ${formatCurrency(Math.abs(results.monthlySavings))} vermeiden könnten:<br><strong>Entgangener Wert nach ${results.laufzeit} Jahren: ${formatCurrency(results.netFutureValueSavings)}</strong>`;
    } else {
        capitalContent += 'Keine monatliche Differenz - gleiche Kosten';
    }
    
    html += generateInfoBox(capitalContent, 'info');
    html += `</div>`;
    
    return html;
}

/**
 * Generate conclusion card
 */
function generateConclusionCard(results) {
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

/**
 * Update the complete results display - REFACTORED VERSION
 */
function updateResultsDisplay(results, inputs) {
    const resultsContainer = document.getElementById('results');
    
    // Use the new modular approach
    resultsContainer.innerHTML = [
        generateRegionCard(results, inputs),
        generatePurchaseCard(results, inputs),
        generateRentCard(results),
        generateComparisonCard(results),
        generateConclusionCard(results)
    ].join('');
}