const { GoogleGenAI } = require('@google/genai');

export default async function handler(req, res) {
  // 1. Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  // 2. Vercel'deki API anahtarını kontrol et
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sistemde API anahtarı eksik!' });
  }

  try {
    const { question } = req.body;

    // 3. SDK'yı başlat
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // 4. İstediğin güncel model ile içeriği üret
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Veya kodundaki 'gemini-1.5-flash'
      contents: `Sen yerel, samimi ve eğlenceli bir dil kullanan 'Türkiş AI' isimli bir yapay zekasın. Soru şudur: ${question}`,
    });

    // 5. SDK sayesinde gelen temiz metni doğrudan al ve dön
    if (response && response.text) {
      return res.status(200).json({ text: response.text });
    }

    return res.status(200).json({ text: "Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?" });

  } catch (error) {
    console.error("Gemini SDK Hatası:", error);
    return res.status(500).json({ text: "Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?" });
  }
}