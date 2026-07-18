import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // 1. Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  // 2. Vercel panelindeki API anahtarını kontrol et
  // Vercel'e hangi isimle eklediysen onu kullanır (API_KEY veya GEMINI_API_KEY)
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sistemde API anahtarı eksik!' });
  }

  try {
    const { question } = req.body;

    // 3. SDK'yı başlat ve içeriği üret
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Sen yerel, samimi ve eğlenceli bir dil kullanan 'Türkiş AI' isimli bir yapay zekasın. Soru şudur: ${question}`,
    });

    // 4. Yanıtı kontrol et ve gönder
    if (response && response.text) {
      return res.status(200).json({ text: response.text });
    }

    return res.status(200).json({ text: "Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?" });

  } catch (error) {
    console.error("Gemini SDK Hatası:", error);
    return res.status(500).json({ text: "Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?" });
  }
}