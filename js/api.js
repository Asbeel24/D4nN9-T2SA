const API = {
  API_ENDPOINT: '/api/proxy',

  async call(prompt, apiKey, onChunk) {
    const response = await fetch(this.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, apiKey })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API调用失败: ${response.status}`);
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
          try {
            const json = JSON.parse(line.slice(6));
            if (json.text) {
              result += json.text;
              if (onChunk) onChunk(result);
            }
          } catch (e) {}
        }
      }
    }

    return result;
  }
};