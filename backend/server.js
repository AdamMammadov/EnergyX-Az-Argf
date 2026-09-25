// ==========================================
// EnergyX Az — Açıq Enerji Kalkulyatoru Backend
// Gənclər Fondu Qrantı çərçivəsində hazırlanmış,
// tam pulsuz, açıq mənbə layihə.
// ==========================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 🔌 RƏSMİ TARİF PİLLƏLƏRİ (2026)
// Mənbə: Azərbaycan Respublikası Energetika Nazirliyi
// DİQQƏT: bu rəqəmlər köhnə layihələrdəki (13/18 qəpik)
// səhv rəqəmlərdən fərqlidir — bunlar RƏSMİ, DOĞRU rəqəmlərdir.
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

// ==========================================
// 📊 POST /calculate — sadə, sürətli hesablama (AI lazım deyil)
// ==========================================
app.post("/calculate", (req, res) => {
  const kwh = parseFloat(req.body.kwh);
  if (isNaN(kwh) || kwh < 0) {
    return res.status(400).json({ error: "Düzgün kVt/saat dəyəri daxil edin." });
  }
  const result = calculateTariff(kwh);
  res.json(result);
});

// ==========================================
// 🤖 POST /advise — AI enerji məsləhətçisi (Gemini, pulsuz tier)
// ==========================================
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Çox tez-tez sorğu göndərilir, bir dəqiqə gözləyin." },
});

app.post("/advise", aiLimiter, async (req, res) => {
  try {
    const { kwh, question } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "AI xidməti hazırda konfiqurasiya edilməyib." });
    }

    const { tier, cost } = kwh ? calculateTariff(parseFloat(kwh)) : {};
    const tierNameAz = { low: "aşağı", mid: "orta", high: "yüksək" };

    const systemContext = `Sən Azərbaycan Respublikasının pillə-əsaslı elektrik tarif sistemi üzrə ixtisaslaşmış, dostcasına bir AI enerji köməkçisisən.
Rəsmi tariflər: 0-200 kVt/saat = 8.4 qəpik, 200-300 kVt/saat = 10 qəpik, 300+ kVt/saat = 15 qəpik.
${kwh ? `İstifadəçinin bu dövrki istifadəsi: ${kwh} kVt/saat (${tierNameAz[tier]} pillə, təxmini ${cost} ₼).` : ""}
Qısa (3-4 cümlə), praktik, konkret enerji qənaəti məsləhətləri ver. Azərbaycan dilində cavab ver.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemContext}\n\nİstifadəçinin sualı: ${question}` }] }],
        }),
      }
    );

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Üzr istəyirəm, cavab hazırlaya bilmədim, bir daha cəhd edin.";
    const s = loadStats();
    s.totalAiQuestions += 1;
    saveStats(s);
    res.json({ answer });
  } catch (err) {
    console.error("AI xətası:", err);
    res.status(500).json({ error: "AI xidmətində xəta baş verdi." });
  }
});

// ==========================================
// 📈 SADƏ STATİSTİKA SİSTEMİ (fayl-əsaslı, verilənlər bazası tələb etmir)
// ==========================================
const fs = require("fs");
const STATS_FILE = "./stats.json";

function loadStats() {
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
  } catch {
    return { totalCalculations: 0, totalSavingsIdentified: 0, totalAiQuestions: 0, aiFeedbackUp: 0, aiFeedbackDown: 0 };
  }
}
function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats));
}

app.post("/track", (req, res) => {
  const { type, amount } = req.body;
  const stats = loadStats();
  if (type === "calculation") stats.totalCalculations += 1;
  if (type === "savings" && !isNaN(amount)) stats.totalSavingsIdentified += parseFloat(amount);
  if (type === "ai_question") stats.totalAiQuestions += 1;
  if (type === "ai_feedback_up") stats.aiFeedbackUp = (stats.aiFeedbackUp || 0) + 1;
  if (type === "ai_feedback_down") stats.aiFeedbackDown = (stats.aiFeedbackDown || 0) + 1;
  saveStats(stats);
  res.json(stats);
});

app.get("/stats", (req, res) => {
  res.json(loadStats());
});

app.get("/", (req, res) => {
  res.json({ status: "işləyir", service: "EnergyX Az Açıq Enerji Kalkulyatoru" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server işə düşdü → port ${PORT}`));
