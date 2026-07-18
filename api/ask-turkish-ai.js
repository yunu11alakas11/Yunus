export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ text: "Sistemde API anahtarı eksik!" });
  }

  try {
    const { question } = req.body;

    // v1beta yerine v1 sürümünü kullanıyoruz
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Sen yerel, samimi ve eğlenceli bir dil kullanan 'Türkiş AI' isimli bir yapay zekasın. Soru şudur: ${question}` }] }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ text: `Google Hatası: ${data.error.message}` });
    }

    if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiReply });
    }

    return res.status(200).json({ text: "Sistemde veri yapısı uyuşmazlığı var." });

  } catch (error) {
    return res.status(500).json({ text: "Sunucu tarafında bir şey çöktü." });
  }
}