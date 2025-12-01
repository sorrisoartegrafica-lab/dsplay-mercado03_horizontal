// script.js - Versão Horizontal Corrigida (Ajuste de Nomes de Campos)

const DEFAULT_VIDEO_ID = "1764628151406x909721458907021300"; 
// Certifique-se que esta URL é a do seu domínio próprio
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
    // Debug: ver o que chegou no console
    console.log("Config Template recebida:", configT);
    console.log("Config Cliente recebida:", configC);

    const r = document.documentElement;
    
    // Mapeamento corrigido para os nomes do Bubble (sem _text)
    // Usamos o operador || para tentar o nome antigo caso o novo falhe
    if(configT.cor_01) r.style.setProperty('--cor-bg-start', configT.cor_01);
    if(configT.cor_02) r.style.setProperty('--cor-destaque', configT.cor_02);
    
    // Ajuste aqui: verifique se no seu banco é cor_texto_01 ou cor_texto_1
    const corTxt1 = configT.cor_texto_01 || configT.cor_texto_1;
    const corTxt2 = configT.cor_texto_02 || configT.cor_texto_2;
    
    if(corTxt1) r.style.setProperty('--cor-texto-nome', corTxt1);
    if(corTxt2) r.style.setProperty('--cor-texto-preco', corTxt2);

    // LOGO: Entrada Única (Fixo)
    if (configC.LOGO_MERCADO_URL) {
        logoImg.src = formatURL(configC.LOGO_MERCADO_URL);
        logoContainer.classList.remove('opacity-0');
        logoContainer.style.animation = "fadeInDown 1s ease-out forwards";
    }
}

async function updateContent(item) {
    // 1. Reset Total
    elementosAnimados.forEach(el => {
        el.className = el.className.replace(/anim-\w+(-\w+)?/g, '').trim(); 
        void el.offsetWidth; // Força Reset CSS
    });

    // 2. Atualiza Dados (CORREÇÃO DE NOMES AQUI)
    // Tenta 'Imagem_produto' (maiúsculo) ou 'imagem_produto' (minúsculo)
    const imgUrl = item.Imagem_produto || item.imagem_produto;
    produtoImg.src = formatURL(imgUrl);
    
    nomeProduto.innerHTML = item.nome; // Era item.nome_text
    precoTexto.textContent = item.valor; // Era item.valor_text

    // 3. Aplica ENTRADA
    cardProduto.classList.add('anim-entrada-prod');
    nomeProduto.classList.add('anim-entrada-txt');
    cardPreco.classList.add('anim-entrada-preco');

    // 4. Lógica do Pulse
    const pulseTimer = setTimeout(() => {
        cardPreco.classList.add('anim-loop-preco');
    }, 800);

    // 5. Exibição
    await sleep(TEMPO_EXIBICAO);

    // 6. Inicia SAÍDA
    clearTimeout(pulseTimer);
    cardPreco.classList.remove('anim-loop-preco'); 
    
    cardProduto.classList.remove('anim-entrada-prod');
    cardProduto.classList.add('anim-saida-prod');

    nomeProduto.classList.remove('anim-entrada-txt');
    nomeProduto.classList.add('anim-saida-txt');

    cardPreco.classList.remove('anim-entrada-preco');
    cardPreco.classList.add('anim-saida-preco');

    // 7. Espera a saída terminar
    await sleep(TEMPO_SAIDA);
}

async function startRotation(produtos) {
    if (!produtos || produtos.length === 0) {
        console.error("Lista de produtos vazia ou inválida");
        return;
    }
    let index = 0;
    while (true) {
        const item = produtos[index];
        // Correção no preload também
        const imgUrl = item.Imagem_produto || item.imagem_produto;
        await preloadImage(imgUrl);
        await updateContent(item);
        index = (index + 1) % produtos.length;
    }
}

async function init() {
    try {
        console.log("Buscando dados de:", API_URL_FINAL);
        const res = await fetch(API_URL_FINAL);
        const data = await res.json();
        
        console.log("Dados recebidos:", data); // Para debug no console

        if (data && data.response) {
            const { configCliente, configTemplate, produtos } = data.response;
            
            // Verifica se os dados principais existem
            if (!configCliente || !configTemplate) {
                console.error("Erro: Configuração do Cliente ou Template faltando no JSON.");
                return;
            }

            applyConfig(configCliente, configTemplate);
            
            // Filtra produtos válidos (usando o nome correto do campo 'nome')
            const produtosValidos = produtos.filter(p => p && p.nome);
            
            if (produtosValidos.length > 0) {
                startRotation(produtosValidos);
            } else {
                console.warn("Nenhum produto válido encontrado na lista.");
            }
        }
    } catch (e) { console.error("Erro fatal:", e); }
}

document.addEventListener('DOMContentLoaded', init);
