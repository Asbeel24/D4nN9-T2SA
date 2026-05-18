const API = {
  DEFAULT_API_KEY: 'sk-cp-beZ0Hla9omb-IIQ9BTzElJfd4hsfZiQGqSPis7voYd9oAIeFsJa5lchL4kID9WuEcYnta1Lny4ZFVb-hp-I0aYg8kcT4QjGG_S_lMWbvudm-O7njOaWI1FI',
  DEFAULT_MODEL: 'Minimax-M2.7',
  API_ENDPOINT: 'https://api.minimaxi.com/anthropic/v1/messages',

  async call(prompt, apiKey, model, onChunk) {
    const key = apiKey || this.DEFAULT_API_KEY;
    const modelName = model || this.DEFAULT_MODEL;

    const response = await fetch(this.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 4096,
        stream: true,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      let errorMsg = `API调用失败: ${response.status}`;
      try {
        const errJson = JSON.parse(error);
        if (errJson.error && errJson.error.message) {
          errorMsg = errJson.error.message;
        }
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

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
              result += json.delta.text;
              if (onChunk) onChunk(result);
            }
          } catch (e) {}
        }
      }
    }

    return result;
  }
};