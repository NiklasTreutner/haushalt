// ──────────────────────────────────────────────────────────────
// SOZIALVERSICHERUNG: Lohnverteilung, Krankenkasse/Pflege und Rente
//
// Für die Wirkung von Beitragsbemessungsgrenzen (BBG) braucht es die Summe der
// Einkommen OBERHALB einer Grenze. Dafür wird die Verteilung der Bruttolöhne
// sozialversicherungspflichtig Beschäftigter als Lognormalverteilung genähert
// (rd. 35 Mio. Beschäftigte, Median 40.000 €, Streuung 0,65 → Lohnsumme rd. 1,7 Bio. €).
// Alle Annahmen stehen in REF.kv, REF.pv und REF.rente und sind bewusst sichtbar.

const WAGE_MODEL = { n: 35e6, median: 40000, sigma: 0.65 };

function normCdf(x) {
  // Abramowitz/Stegun 7.1.26, Fehler < 1,5e-7
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
  return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}

// Summe aller Lohnanteile oberhalb von c (Mrd. €): Σ max(0, Lohn − c)
function wageExcessAbove(c, m = WAGE_MODEL) {
  if (!isFinite(c)) return 0;
  const mu = Math.log(m.median), s = m.sigma;
  const mean = Math.exp(mu + s * s / 2);
  const mass = m.n * mean * normCdf((mu + s * s - Math.log(c)) / s);
  const count = m.n * normCdf((mu - Math.log(c)) / s);
  return (mass - c * count) / 1e9;
}

// ── Krankenversicherung und Pflege ─────────────

// Ergebnis eines Szenarios: Beitragssätze (gesamt, AN + AG) und Bausteine
// opts: { bbg (€, Infinity = keine Grenze), pkvIn, kapital, kostenfaktor (%), honorarAusgleich }
function healthScenario(opts) {
  const k = REF.kv, p = REF.pv;
  const basis0 = (k.ausgaben - k.zuschuss) / (k.satz / 100);
  const ueber = wageExcessAbove(k.bbg) - wageExcessAbove(opts.bbg);   // zusätzliche Bemessungsgrundlage durch höhere/keine BBG

  let basis = basis0 + k.anteilGkvUeberBBG * ueber;
  let ausgabenKV = k.ausgaben, ausgabenPV = basis0 * p.satz / 100;
  if (opts.pkvIn) {
    basis += k.pkvBasisBisBBG + k.anteilPkvUeberBBG * ueber;
    ausgabenKV += k.pkvVoll * (k.ausgaben * 1e9 / k.versicherte) * opts.kostenfaktor / 100 / 1e9;
    if (opts.honorarAusgleich) ausgabenKV += k.pkvMehrumsatz;
    ausgabenPV += p.ppvVersicherte * (ausgabenPV * 1e9 / k.versicherte) * p.ppvKostenfaktor / 1e9;
  }
  if (opts.kapital) basis += k.kapitalMiete;

  return {
    basis, ausgabenKV, ausgabenPV,
    kv: (ausgabenKV - k.zuschuss) / basis * 100,
    pv: ausgabenPV / basis * 100
  };
}

const HEALTH_STATUS_QUO = { bbg: 69750, pkvIn: false, kapital: false, kostenfaktor: 85, honorarAusgleich: true };

// Arbeitnehmeranteil (KV + PV) pro Jahr bei gegebenem Brutto
function healthContribution(gross, scenario, bbg) {
  return Math.min(gross, bbg) * (scenario.kv + scenario.pv) / 200;
}

// ── Rente: wer zahlt ein? ──────────────────────

// Zusätzliche beitragspflichtige Einnahmen 2026 (Mrd. €) je Reform
function pensionBaseExtras({ bbgWeg, alle }) {
  const r = REF.rente;
  const ueberBBG = bbgWeg ? wageExcessAbove(r.bbg) : 0;
  const neu = alle ? r.neueGruppen.beamte + r.neueGruppen.selbststaendige + r.neueGruppen.versorgungswerke
    + (bbgWeg ? r.neueGruppen.ueberBBG : 0) : 0;
  return { ueberBBG, neu, gesamt: ueberBBG + neu };
}
