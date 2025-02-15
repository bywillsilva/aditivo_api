const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const cron = require('node-cron');
const xml2js = require('xml2js');

configDotenv();

const app = express();

const corsOptions = {
    origin: '*',
    methods: 'GET',
    allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

let noticiasCache = [];

async function atualizarNoticias() {
    try {
        const url = 'https://www.contabeis.com.br/rss/conteudo'; // URL da nova API RSS
        const response = await axios.get(url, { responseType: 'text' });

        const parser = new xml2js.Parser({ trim: true, explicitArray: false });
        const result = await parser.parseStringPromise(response.data);
        
        const items = result.rss.channel.item;

        noticiasCache = items.slice(0, 5).map(item => ({
            link: item.link || 'URL não disponível',
            titulo: item.title || 'Título não disponível',
            descricao: item.description || 'Descrição não disponível',
            img: item["media:content"]?.$.url || 'Imagem não disponível',
            data: item.pubDate || 'Data não disponível'
        }));
    } catch (error) {
        console.error('Erro ao atualizar as notícias:', error);
        noticiasCache = [];
    }
}

cron.schedule('0 0 * * *', async () => {
    await atualizarNoticias();
});

atualizarNoticias();

app.get('/noticias', (req, res) => {
    res.json(noticiasCache);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
