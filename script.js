// script.js - Versão Final (Logo Fixo + Saídas Fluidas + Pulse Seguro)

const DEFAULT_VIDEO_ID = "1764628151406x909721458907021300"; 
const API_URL_BASE = "https://bluemidia.digital/version-test/api/1.1/wf/get_video_data";

// Elementos DOM
const cardProduto = document.getElementById('card-produto');
const produtoImg = document.getElementById('produto-img');
const logoContainer = document.getElementById('logo-container');
const logoImg = document.getElementById('logo-img');
const nomeProduto = document.getElementById('nome-produto');
const cardPreco = document.getElementById('card-preco');
const precoTexto = document.getElementById('preco-texto');

// Elementos que animam a cada troca
const elementosAnimados = [cardProduto, nomeProduto, cardPreco];

// TEMPOS
const TEMPO_EXIBICAO = 4400; // Tempo parado na tela (~4.4s)
const TEMPO_SAIDA = 600;     // Tempo da animação de saída (~0.6s) -> Total ~5s

// --- URL & API ---
const queryParams = new URLSearchParams(window.location.search);
let video_id = queryParams.get('video_id') || DEFAULT_VIDEO_ID;
const API_URL_FINAL = `${API_URL_BASE}?video_id=${video_id}`;

// --- FUNÇÕES AUXILIARES ---
function formatURL(url) {
    if (!url) return '';
    url = url.trim();
    if (url.startsWith('http') || url.startsWith('//')) return url.startsWith('//') ? 'https:' + url : url;
    return 'https://' + url;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function preloadImage(url) {
    return new Promise((resolve) => {
        if (!url) { resolve(); return; }
        const img = new Image();
        const formattedUrl = formatURL(url);
        const timer = setTimeout(() => resolve(), 2000); // Timeout segurança 2s
        img.onload = () => { clearTimeout(timer); resolve(); };
        img.onerror = () => { clearTimeout(timer); resolve(); };
        img.src = formattedUrl;
    });
}

function applyConfig(configC, configT) {
    const r = document.documentElement;
    if(configT.cor_01_text) r.style.setProperty('--cor-bg-start', configT.cor_01_text);
    if(configT.cor_02_text) r.style.setProperty('--cor-destaque', configT.cor_02_text);
    if(configT.cor_texto_01_text) r.style.setProperty('--cor-texto-nome', configT.cor_texto_01_text);
    if(configT.cor_texto_02_text) r.style.setProperty('--cor-texto-preco', configT.cor_texto_02_text);

    // LOGO: Entrada Única (Fixo)
    if (configC.logo_mercado_url_text) {
        logoImg.src = formatURL(configC.logo_mercado_url_text);
        logoContainer.classList.remove('opacity-0');
        logoContainer.style.animation = "fadeInDown 1s ease-out forwards";
    }
}

async function updateContent(item) {
    // 1. Reset Total (Remove todas as classes de animação)
    elementosAnimados.forEach(el => {
        el.className = el.className.replace(/anim-\w+(-\w+)?/g, '').trim(); 
        void el.offsetWidth; // Força Reset CSS
    });

    // 2. Atualiza Dados (Invisível)
    produtoImg.src = formatURL(item.imagem_produto_text);
    nomeProduto.innerHTML = item.nome_text; 
    precoTexto.textContent = item.valor_text;

    // 3. Aplica ENTRADA
    cardProduto.classList.add('anim-entrada-prod');
    nomeProduto.classList.add('anim-entrada-txt');
    cardPreco.classList.add('anim-entrada-preco');

    // 4. Lógica do Pulse (Ativa após a entrada terminar, sem sumir)
    const pulseTimer = setTimeout(() => {
        cardPreco.classList.add('anim-loop-preco');
    }, 800);

    // 5. Exibição
    await sleep(TEMPO_EXIBICAO);

    // 6. Inicia SAÍDA
    clearTimeout(pulseTimer);
    cardPreco.classList.remove('anim-loop-preco'); 
    
    // Troca para classes de saída
    cardProduto.classList.remove('anim-entrada-prod');
    cardProduto.classList.add('anim-saida-prod');

    nomeProduto.classList.remove('anim-entrada-txt');
    nomeProduto.classList.add('anim-saida-txt');

    cardPreco.classList.remove('anim-entrada-preco');
    cardPreco.classList.add('anim-saida-preco');

    // 7. Espera a saída terminar visualmente
    await sleep(TEMPO_SAIDA);
}

async function startRotation(produtos) {
    if (!produtos || produtos.length === 0) return;
    let index = 0;
    while (true) {
        const item = produtos[index];
        await preloadImage(item.imagem_produto_text);
        await updateContent(item);
        index = (index + 1) % produtos.length;
    }
}

async function init() {
    try {
        const res = await fetch(API_URL_FINAL);
        const data = await res.json();
        if (data && data.response) {
            const { configCliente, configTemplate, produtos } = data.response;
            applyConfig(configCliente, configTemplate);
            const produtosValidos = produtos.filter(p => p && p.nome_text);
            startRotation(produtosValidos);
        }
    } catch (e) { console.error(e); }
}


document.addEventListener('DOMContentLoaded', init);

