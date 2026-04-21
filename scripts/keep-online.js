const axios = require('axios');

const HEALTH_URL = 'http://localhost:3000/api/admin/whatsapp/health';
const INTERVAL = 20000; // 20 segundos

async function checkConnection() {
  const now = new Date().toLocaleTimeString();
  try {
    console.log(`[CRON ${now}] Verificando conexão WhatsApp...`);
    const response = await axios.get(HEALTH_URL);
    if (response.data?.success) {
      console.log(`[CRON ${now}] Sucesso: ${response.data.message || 'Conexão ativa'}`);
    } else {
      console.warn(`[CRON ${now}] Aviso: ${response.data.message || 'Falha na verificação'}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(`[CRON ${now}] Erro: Servidor Next.js parece estar offline.`);
    } else {
      console.error(`[CRON ${now}] Erro ao verificar conexão:`, error.message);
    }
  }
}

console.log('--- Monitoramento de Conexão WhatsApp Iniciado ---');
console.log(`Alvo: ${HEALTH_URL}`);
console.log(`Intervalo: ${INTERVAL / 1000} segundos`);
console.log('------------------------------------------------');

// Executa a primeira vez imediatamente
checkConnection();

// Inicia o intervalo
setInterval(checkConnection, INTERVAL);
