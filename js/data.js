// ===== REGIONAL PRICE DATA =====
const REGIONAL_PRICES = {
    // Germany
    muenchen: { kaufpreis_qm: 7355, mietpreis_qm: 19.65 },
    frankfurt: { kaufpreis_qm: 5500, mietpreis_qm: 18.52 },
    berlin: { kaufpreis_qm: 4500, mietpreis_qm: 12.78 },
    durchschnitt: { kaufpreis_qm: 3400, mietpreis_qm: 11.40 },
    erfurt: { kaufpreis_qm: 2100, mietpreis_qm: 7.80 },
    mecklenburg: { kaufpreis_qm: 1650, mietpreis_qm: 6.20 },
    kleinstadt: { kaufpreis_qm: 2300, mietpreis_qm: 8.50 },
    
    // International
    frankreich_sued: { kaufpreis_qm: 4500, mietpreis_qm: 12.00 },
    frankreich_west: { kaufpreis_qm: 2400, mietpreis_qm: 8.00 },
    griechenland: { kaufpreis_qm: 1900, mietpreis_qm: 6.50 },
    italien: { kaufpreis_qm: 2600, mietpreis_qm: 8.50 },
    portugal: { kaufpreis_qm: 2800, mietpreis_qm: 8.00 },
    spanien: { kaufpreis_qm: 2500, mietpreis_qm: 7.50 },
    ungarn: { kaufpreis_qm: 1800, mietpreis_qm: 5.50 },
    thailand: { kaufpreis_qm: 1200, mietpreis_qm: 4.00 },
    vietnam: { kaufpreis_qm: 800, mietpreis_qm: 3.00 }
};

// ===== REGION DISPLAY NAMES =====
const REGION_NAMES = {
    muenchen: 'München',
    frankfurt: 'Frankfurt',
    berlin: 'Berlin',
    durchschnitt: 'Deutschland Durchschnitt',
    erfurt: 'Erfurt (Thüringen)',
    mecklenburg: 'Mecklenburg-Vorpommern',
    kleinstadt: 'Kleinstadt/Ländlich',
    frankreich_sued: '🇫🇷 Frankreich Süd (Côte d\'Azur)',
    frankreich_west: '🇫🇷 Frankreich West (Atlantik)',
    griechenland: '🇬🇷 Griechenland',
    italien: '🇮🇹 Italien (Süd)',
    portugal: '🇵🇹 Portugal',
    spanien: '🇪🇸 Spanien',
    ungarn: '🇭🇺 Ungarn',
    thailand: '🇹🇭 Thailand',
    vietnam: '🇻🇳 Vietnam',
    custom: 'Eigene Eingaben'
};

// ===== CALCULATION CONSTANTS =====
const CONSTANTS = {
    TRANSACTION_COSTS: 0.08,        // 8% Nebenkosten beim Kauf
    MAINTENANCE_COSTS: 0.002,       // 0.2% monatliche Instandhaltung
    UTILITY_MARKUP: 1.3,           // 30% Nebenkosten auf Kaltmiete (nicht mehr verwendet)
    TAX_FREE_ALLOWANCE: 1000,      // Steuerfreier Freibetrag
    CAPITAL_GAINS_TAX: 0.26,       // 26% Kapitalertragssteuer
    INSURANCE_MARKUP: 1.3          // 30% Zuschlag für Versicherung (Gewinn + Verwaltung)
};