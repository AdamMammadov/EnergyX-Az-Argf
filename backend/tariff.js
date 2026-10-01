// ==========================================
// 🔌 RƏSMİ TARİF PİLLƏLƏRİ (2026)
// Mənbə: Azərbaycan Respublikası Energetika Nazirliyi / Tarif Şurası
// DİQQƏT: bu rəqəmlər köhnə layihələrdəki (13/18 qəpik)
// səhv rəqəmlərdən fərqlidir — bunlar RƏSMİ, DOĞRU rəqəmlərdir.
// Frontend-dəki js/engine.js ilə eyni məntiq — testlər hər ikisini yoxlayır.
// ==========================================
const TARIFF = {
  LOW: { max: 200, rate: 0.084 },   // 0-200 kWh: 8.4 qəpik
  MID: { max: 300, rate: 0.10 },    // 200-300 kWh: 10 qəpik
  HIGH: { rate: 0.15 },             // 300+ kWh: 15 qəpik
};

function calculateTariff(kwh) {
  let cost = 0;
  let tier;
  if (kwh <= TARIFF.LOW.max) {
    cost = kwh * TARIFF.LOW.rate;
    tier = "low";
  } else if (kwh <= TARIFF.MID.max) {
    cost = TARIFF.LOW.max * TARIFF.LOW.rate + (kwh - TARIFF.LOW.max) * TARIFF.MID.rate;
    tier = "mid";
  } else {
    cost = TARIFF.LOW.max * TARIFF.LOW.rate + (TARIFF.MID.max - TARIFF.LOW.max) * TARIFF.MID.rate + (kwh - TARIFF.MID.max) * TARIFF.HIGH.rate;
    tier = "high";
  }
  return { cost: Math.round(cost * 100) / 100, tier };
}

module.exports = { TARIFF, calculateTariff };
