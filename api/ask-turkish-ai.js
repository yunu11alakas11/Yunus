export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("HATA: Vercel panelinde API anahtarı bulunamadı!");
    return res.status(500).json({ text: "Sistemde API anahtarı eksik!" });
  }

  try {
    const { question } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Sen yerel, samimi ve eğlenceli bir dil kullanan 'Türkiş AI' isimli bir yapay zekasın. Soru şudur: ${question}` }] }]
        })
      }
    );

    const data = await response.json();

    // Google bir hata kodu döndüyse bunu Vercel loglarına KANLI CANLI yazdır
    if (data.error) {
      console.error("GOOGLE API GERÇEK HATASI:", JSON.stringify(data.error, null, 2));
      return res.status(200).json({ text: `Google Hatası: ${data.error.message}` });
    }

    if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiReply });
    }

    console.error("HATA: Google'dan garip bir veri yapısı döndü:", JSON.stringify(data, null, 2));
    return res.status(200).json({ text: "Sistemde veri yapısı uyuşmazlığı var." });

  } catch (error) {
    console.error("SUNUCU ÇÖKME HATASI:", error);
    return res.status(500).json({ text: "Sunucu tarafında bir şey çöktü." });
  }
}