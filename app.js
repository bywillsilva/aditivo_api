const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const cron = require('node-cron');  // Importar o node-cron

configDotenv();

// Criar o app Express
const app = express();

const corsOptions = {
    origin: '*', // Permitir qualquer origem
    methods: 'GET', // Permitir apenas GET, ou outros métodos conforme necessário
    allowedHeaders: 'Content-Type, Authorization', // Permitir cabeçalhos específicos
};

// Configurar CORS (se necessário para o seu front-end)
app.use(cors(corsOptions));

// Definir a porta
const PORT = process.env.PORT || 3000;

// Variável para armazenar as notícias
let noticiasCache = [];

// Função para atualizar as notícias
async function atualizarNoticias() {
    try {
        // URL da API de notícias (NewsAPI)
        const url = `https://newsapi.org/v2/everything?q=contábil&apiKey=${process.env.APIKEY}`;

        // Fazer a requisição à API externa (NewsAPI)
        const response = await axios.get(url);

        if (response.data.status !== 'ok') {
            throw new Error('Falha ao buscar notícias.');
        }

        const articles = response.data.articles;

        // Criar uma estrutura simplificada para as notícias
        noticiasCache = articles.slice(0, 5).map(article => ({
            link: article.url || 'URL não disponível',
            titulo: article.title || 'Título não disponível',
            descricao: article.description || 'Descrição não disponível',
            img: article.urlToImage || 'Imagem não disponível'
        }));
    } catch (error) {
        console.error('Erro ao atualizar as notícias:', error);
        noticiasCache = []; // Limpar o cache em caso de erro
    }
}

// Agendar a atualização das notícias todos os dias às 00:00 (meia-noite)
cron.schedule('0 0 * * *', async () => {
    await atualizarNoticias();
});

// Chamar a função uma vez logo no início para garantir que as notícias estejam carregadas
atualizarNoticias();

// Rota para pegar as notícias
app.get('/noticias', (req, res) => {
    res.json(noticiasCache);
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
