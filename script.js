const copyBtn = document.getElementById('copyContract');
const contract = document.getElementById('contract')?.textContent?.trim();

if (copyBtn && contract) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(contract);
      const oldText = copyBtn.textContent;
      copyBtn.textContent = 'Адресу скопійовано';
      setTimeout(() => copyBtn.textContent = oldText, 1600);
    } catch {
      copyBtn.textContent = 'Скопіюйте адресу вручну';
    }
  });
}
