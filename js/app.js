class D4nN9T2SA {
  constructor() {
    this.currentMode = 'script';
    this.apiKey = localStorage.getItem('apiKey') || '';
    this.theme = localStorage.getItem('theme') || 'light';

    this.initElements();
    this.initEventListeners();
    this.applyTheme();
  }

  initElements() {
    this.themeToggle = document.getElementById('themeToggle');
    this.tabs = document.querySelectorAll('.tab');
    this.inputArea = document.getElementById('inputArea');
    this.outputArea = document.getElementById('outputArea');
    this.emptyState = document.getElementById('emptyState');
    this.apiKeyInput = document.getElementById('apiKey');
    this.generateBtn = document.getElementById('generateBtn');
    this.copyBtn = document.getElementById('copyBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.progressBar = document.getElementById('progressBar');

    this.apiKeyInput.value = this.apiKey;
    if (!this.apiKey) {
      this.apiKeyInput.placeholder = '使用默认Key（可填写自己的）';
    }
  }

  initEventListeners() {
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
    });
    this.apiKeyInput.addEventListener('change', () => {
      this.apiKey = this.apiKeyInput.value;
      localStorage.setItem('apiKey', this.apiKey);
    });
    this.generateBtn.addEventListener('click', () => this.generate());
    this.copyBtn.addEventListener('click', () => this.copy());
    this.exportBtn.addEventListener('click', () => this.export());
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    document.body.setAttribute('data-theme', this.theme);
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    const placeholders = {
      script: '输入片段/图片描述/单词...',
      storyboard: '输入剧本格式文本...',
      prompt: '输入脚本格式文本...'
    };
    this.inputArea.placeholder = placeholders[mode];
    this.clearOutput();
  }

  async generate() {
    const input = this.inputArea.value.trim();
    if (!input) return;

    const config = PROMPTS[this.currentMode];
    const userPrompt = config.userTemplate(input);

    this.setLoading(true);
    this.showProgress(true);

    try {
      const fullPrompt = `${config.system}\n\n${userPrompt}`;
      const result = await API.call(fullPrompt, this.apiKey, (chunk) => {
        this.showOutput(chunk);
      });
      this.showOutput(result);
    } catch (error) {
      alert(`生成失败: ${error.message}`);
    } finally {
      this.setLoading(false);
      this.showProgress(false);
    }
  }

  showOutput(content) {
    this.outputArea.textContent = content;
    this.outputArea.classList.add('active');
    this.emptyState.classList.add('hidden');
  }

  clearOutput() {
    this.outputArea.textContent = '';
    this.outputArea.classList.remove('active');
    this.emptyState.classList.remove('hidden');
  }

  setLoading(loading) {
    this.generateBtn.classList.toggle('loading', loading);
    this.generateBtn.disabled = loading;
    this.copyBtn.disabled = loading;
    this.exportBtn.disabled = loading;
  }

  showProgress(show) {
    if (this.progressBar) {
      this.progressBar.style.display = show ? 'block' : 'none';
    }
  }

  async copy() {
    const content = this.outputArea.textContent;
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      const originalText = this.copyBtn.textContent;
      this.copyBtn.textContent = '已复制!';
      setTimeout(() => {
        this.copyBtn.textContent = originalText;
      }, 1500);
    } catch (error) {
      alert('复制失败');
    }
  }

  export() {
    const content = this.outputArea.textContent;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `d4nN9-t2sa-${this.currentMode}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new D4nN9T2SA();
});