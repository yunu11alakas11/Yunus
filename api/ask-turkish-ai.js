export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sistemde API anahtarı eksik!' });
  }

  try {
    const { question } = req.body;

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
                  text: `Sen yerel, samimi ve eğlenceli bir dil kullanan 'Türkiş AI' isimli bir yapay zekasın. Sana sorulan İngilizce deyimleri Türkçe karşılıkları ve en komik/günlük hayattan yerel örneklerle açıkla. Soru şudur: ${question}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Backend tarafında bir hata oluştu' });
  }
}