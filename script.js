// script.js - Versão Atualizada para Novos Nomes de Campos (Sem sufixo _text)

// 1. Definições Iniciais
const queryParams = new URLSearchParams(window.location.search);
const videoId = queryParams.get('video_id');
// ATENÇÃO: Confirme se esta é a URL correta do seu novo domínio
const API_URL_BASE = "https://bluemidia.digital/version-test/api/1.1/wf/get_video_data";

// Elementos DOM (Mantém igual)
const cardProduto = document.getElementById('card-produto');
const produtoImg = document.getElementById('produto-img');
const logoContainer = document.getElementById('logo-container');
const logoImg = document.getElementById('logo-img');
const nomeProduto = document.getElementById('nome-produto');
const cardPreco = document.getElementById('card-preco');
const precoTexto = document.getElementById('preco-texto');

// Elementos que animam
const elementosAnimados = [cardProduto, nomeProduto, cardPreco];

// TEMPOS
const DURACAO_TOTAL_SLOT = 15000;
const DURACAO_POR_PRODUTO = DURACAO_TOTAL_SLOT / 3;
const ANIMATION_DELAY = 1000;
const EXIT_ANIMATION_DURATION = 500;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 2. Função APPLY CONFIG (Cores e Logo)
function applyConfig(cliente, template) {
    // Mapeamento para os NOVOS nomes do JSON (sem _text)
    
    // Fundo Principal (cor_01 no JSON -> --cor-fundo-principal no CSS)
    if(template.cor_01) document.documentElement.style.setProperty('--cor-fundo-principal', template.cor_01);
    
    // Fundo Secundário (cor_02 no JSON -> --cor-fundo-secundario no CSS)
    if(template.cor_02) document.documentElement.style.setProperty('--cor-fundo-secundario', template.cor_02);
    
    // Cor Texto Descrição (cor_texto_01 no JSON)
    if(template.cor_texto_01) document.documentElement.style.setProperty('--cor-texto-descricao', template.cor_texto_01);
    
    // Cor Texto Preço (cor_texto_02 no JSON)
    if(template.cor_texto_02) document.documentElement.style.setProperty('--cor-texto-preco', template.cor_texto_02);
    
    // Cor Seta QR (cor_03 no JSON)
    if(template.cor_03) document.documentElement.style.setProperty('--cor-seta-qr', template.cor_03);

    // Logo do Cliente (LOGO_MERCADO_URL no JSON)
    const prefixoURL = 'https:';
    if (cliente.LOGO_MERCADO_URL) { 
        logoImg.src = prefixoURL + cliente.LOGO_MERCADO_URL; 
    }
}

// 3. Função UPDATE CONTENT (Produtos)
function updateContent(item) {
    const prefixoURL = 'https:';
    
    // Imagem do Produto (Imagem_produto no JSON)
    if(item.Imagem_produto) produtoImg.src = prefixoURL + item.Imagem_produto;
    
    // Nome (nome no JSON)
    if(item.nome) nomeProduto.textContent = item.nome;
    
    // Preço (valor no JSON)
    if(item.valor) precoTexto.textContent = item.valor;
    
    // Se tiver QR Code e Selo, mapeie aqui também (ex: item.Selo_Produto)
    // ...
}

// 4. Funções de Animação (Mantém igual)
async function playEntranceAnimation() {
    elementosAnimados.forEach(el => el.classList.remove('saida'));
    // Adicione classes de entrada aqui se necessário
    await sleep(ANIMATION_DELAY);
}

async function playExitAnimation() {
    elementosAnimados.forEach(el => {
        el.classList.add('saida'); // Classe CSS que faz sumir
    });
    await sleep(EXIT_ANIMATION_DURATION);
}

// 5. Rotação
function runInternalRotation(items) {
    async function showNextProduct(subIndex) {
        const item = items[subIndex % items.length];
        if (subIndex > 0) await playExitAnimation();
        updateContent(item);
        await playEntranceAnimation();
    }
    showNextProduct(0);
    setTimeout(() => showNextProduct(1), DURACAO_POR_PRODUTO);
    setTimeout(() => showNextProduct(2), DURACAO_POR_PRODUTO * 2);
}

// 6. Inicialização e Fetch
async function init() {
    if (!videoId) {
        console.error("Video ID não encontrado na URL");
        return;
    }

    try {
        const response = await fetch(`${API_URL_BASE}?video_id=${videoId}`);
        const data = await response.json();

        if (data.status === "success") {
            const configCliente = data.response.configCliente;
            const configTemplate = data.response.configTemplate;
            const produtos = data.response.produtos;

            applyConfig(configCliente, configTemplate);
            
            // Filtra produtos vazios se houver
            const produtosValidos = produtos.filter(p => p.nome || p.valor);
            
            if (produtosValidos.length > 0) {
                runInternalRotation(produtosValidos);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

document.addEventListener('DOMContentLoaded', init);
