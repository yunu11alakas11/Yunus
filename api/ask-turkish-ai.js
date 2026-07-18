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

    // 3. Gemini API'sine istek at
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Sen yerel, samimi ve eğlenceli bir dil kullanan 'Türkiş AI' isimli bir yapay zekasın. Soru şudur: ${question}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 4. Gemini'den gelen ham veriyi backend'de kontrol et ve ayıkla
    if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiReply });
    }

    // Eğer veri var ama aradığımız formatta değilse bu cevabı dön
    return res.status(200).json({ text: "Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?" });

  } catch (error) {
    // 5. Ağ hatası veya sunucu tarafında beklenmedik bir çökme olursa çalışacak kısım
    console.error("Gemini API Hatası:", error);
    return res.status(500).json({ text: "Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?" });
  }
}