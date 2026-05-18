export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const key = apiKey || 'sk-cp-beZ0Hla9omb-IIQ9BTzElJfd4hsfZiQGqSPis7voYd9oAIeFsJa5lchL4kID9WuEcYnta1Lny4ZFVb-hp-I0aYg8kcT4QjGG_S_lMWbvudm-O7njOaWI1FI';

  try {
    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'Minimax-M2.7',
        max_tokens: 8192,
        stream: true,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            if (json.type === 'content_block_delta' && json.delta && json.delta.text) {
              res.write(`data: ${JSON.stringify({ text: json.delta.text })}\n\n`);
            }
          } catch (e) {}
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}