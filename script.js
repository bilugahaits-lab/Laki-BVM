const contract='0xC02cd09C60aBc64b0C77720326597430e118B4C1';
document.getElementById('year').textContent=new Date().getFullYear();
document.getElementById('copyContract').addEventListener('click', async (e)=>{const btn=e.currentTarget;try{await navigator.clipboard.writeText(contract);const old=btn.textContent;btn.textContent='Скопійовано';setTimeout(()=>btn.textContent=old,1400)}catch{window.prompt('Скопіюйте адресу контракту BVM:', contract)}});
