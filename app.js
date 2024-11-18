const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { configDotenv } = require('dotenv');

configDotenv();

// Criar o app Express
const app = express();

// Configurar CORS (se necessário para o seu front-end)
app.use(cors());

// Definir a porta
const PORT = process.env.PORT || 3000;

// Rota para pegar as notícias
app.get('/noticias', async (req, res) => {
    try {
        // URL da API de notícias (NewsAPI)
        const url = `https://newsapi.org/v2/everything?q=contábil&apiKey=${process.env.APIKEY}`

        // Fazer a requisição à API externa (NewsAPI)
        const response = await axios.get(url);
        const articles = response.data.articles;

        // Criar uma estrutura simplificada para as notícias
        const noticias = articles.slice(0, 5).map(article => ({
            link: article.url,
            titulo: article.title,
            descricao: article.description,
            img: article.urlToImage
        }));

        // Retornar as notícias para o front-end
        res.json(noticias);
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        res.status(500).send('Erro ao buscar notícias');
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
