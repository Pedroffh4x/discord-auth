require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurações do Discord OAuth2
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://fusion7.shop/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fusion7.shop';

// Middleware
// CORS configurado para aceitar múltiplas origens (dev + prod)
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:8081',
  'http://localhost:5173',
  'https://fusion7.shop'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Armazenamento temporário de estados OAuth2 (em produção, use Redis ou banco de dados)
const stateStore = new Map();

// Rota 1: Redireciona para autorização do Discord
app.get('/auth/discord', (req, res) => {
  // Gera estado aleatório para prevenir CSRF
  const state = crypto.randomBytes(16).toString('hex');

  // Armazena estado com timestamp (expira em 10 minutos)
  stateStore.set(state, {
    createdAt: Date.now(),
    returnUrl: req.query.returnUrl || '/'
  });

  // Limpa estados expirados (mais de 10 minutos)
  for (const [key, value] of stateStore.entries()) {
    if (Date.now() - value.createdAt > 600000) {
      stateStore.delete(key);
    }
  }

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
    state: state
  });

  const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

  console.log(`[OAuth2] Redirecionando para autorização. State: ${state.substring(0, 8)}...`);
  console.log(`[OAuth2] Redirect URI configurada: ${REDIRECT_URI}`);

  res.redirect(authUrl);
});

// Rota 2: Callback do Discord - troca code por token e busca dados do usuário
app.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  // Verifica se houve erro na autorização
  if (error) {
    console.error(`[OAuth2] Erro na autorização: ${error} - ${error_description}`);
    return res.redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(error_description || error)}`);
  }

  // Valida parâmetros obrigatórios
  if (!code || !state) {
    console.error('[OAuth2] Parâmetros ausentes: code ou state');
    return res.redirect(`${FRONTEND_URL}/?error=missing_parameters`);
  }

  // Valida estado (previne CSRF)
  const storedState = stateStore.get(state);
  if (!storedState) {
    console.error(`[OAuth2] Estado inválido ou expirado: ${state.substring(0, 8)}...`);
    return res.redirect(`${FRONTEND_URL}/?error=invalid_state`);
  }

  // Remove estado usado (one-time use)
  stateStore.delete(state);

  try {
    console.log(`[OAuth2] Trocando código por token...`);

    // Troca o código de autorização pelo token de acesso
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, token_type } = tokenResponse.data;
    console.log(`[OAuth2] Token obtido com sucesso.`);

    // Busca dados do usuário usando o token
    console.log(`[OAuth2] Buscando dados do usuário...`);
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `${token_type} ${access_token}`
      }
    });

    const user = userResponse.data;
    console.log(`[OAuth2] Usuário autenticado: ${user.username}#${user.discriminator} (${user.id})`);

    // Cria objeto seguro com dados do usuário (sem tokens sensíveis)
    const safeUser = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      email: user.email || null,
      verified: user.verified || false
    };

    // Define cookie seguro com dados do usuário (httpOnly em produção)
    res.cookie('discord_user', JSON.stringify(safeUser), {
      httpOnly: false, // Frontend precisa ler este cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    // Redireciona de volta ao frontend
    const returnUrl = storedState.returnUrl || '/';
    console.log(`[OAuth2] Redirecionando para: ${FRONTEND_URL}${returnUrl}`);
    res.redirect(`${FRONTEND_URL}${returnUrl}?auth=success`);

  } catch (err) {
    console.error('[OAuth2] Erro durante troca de token:', err.response?.data || err.message);

    const errorMessage = err.response?.data?.error_description ||
                         err.response?.data?.error ||
                         'token_exchange_failed';

    res.redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(errorMessage)}`);
  }
});

// Rota auxiliar: Obtém dados do usuário do cookie
app.get('/api/user', (req, res) => {
  const userCookie = req.cookies.discord_user;

  if (!userCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = JSON.parse(userCookie);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Rota auxiliar: Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('discord_user');
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    discord_configured: !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET),
    redirect_uri: REDIRECT_URI
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor OAuth2 rodando em http://localhost:${PORT}`);
  console.log(`📋 Configuração:`);
  console.log(`   Client ID: ${DISCORD_CLIENT_ID ? '✅ Configurado' : '❌ Ausente'}`);
  console.log(`   Client Secret: ${DISCORD_CLIENT_SECRET ? '✅ Configurado' : '❌ Ausente'}`);
  console.log(`   Redirect URI: ${REDIRECT_URI}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  console.log(`\n⚠️  IMPORTANTE: Adicione esta URL exata no Discord Developer Portal:`);
  console.log(`   ${REDIRECT_URI}\n`);
});