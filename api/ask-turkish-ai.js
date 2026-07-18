import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ text: "Sistemde API anahtarı eksik!" });
  }

  const { question } = req.body;
  
  // Google'ın kabul ettiği standart JSON gövdesi
  const postData = JSON.stringify({
    contents: [{ 
      parts: [{ 
        text: `Sen yerel, samimi ve eğlenceli bir dil kullanan 'Türkiş AI' isimli bir yapay zekasın. Soru şudur: ${question}` 
      }] 
    }]
  });

  // URL karmaşasına son veren doğrudan HTTPS istek ayarları
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  // İsteği Node.js yerleşik modülüyle güvenli şekilde gönderiyoruz
  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        
        if (parsedData.error) {
          return res.status(200).json({ text: `Google Hatası: ${parsedData.error.message}` });
        }

        if (parsedData.candidates && parsedData.candidates[0]?.content?.parts?.[0]?.text) {
          return res.status(200).json({ text: parsedData.candidates[0].content.parts[0].text });
        }

        return res.status(200).json({ text: "Sistemde veri yapısı uyuşmazlığı var." });
      } catch (e) {
        return res.status(500).json({ text: "Gelen veri çözümlenemedi." });
      }
    });
  });

  request.on('error', (e) => {
    return res.status(500).json({ text: `Bağlantı Hatası: ${e.message}` });
  });

  request.write(postData);
  request.end();
}
