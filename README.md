# Fusion7 - Discord OAuth2 Authentication

Página de autenticação com Discord OAuth2 para o servidor Fusion7, com fundo animado em WebGL e cartão de login estilizado.

## 🚀 Deploy na Vercel

O projeto está configurado para deploy automático na Vercel. O frontend é servido como SPA e o backend pode ser hospedado separadamente ou integrado via serverless functions.

### URL de Redirecionamento OAuth2

**Adicione esta URL exata no Discord Developer Portal → OAuth2 → Redirects:**

```
https://fusion7.shop/callback
```

Para desenvolvimento local:

```
http://localhost:5173/callback
```

## 📋 Pré-requisitos

- Node.js 18+
- Conta no [Discord Developer Portal](https://discord.com/developers/applications)

## ⚙️ Configuração do Discord OAuth2

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie um novo aplicativo (ou selecione um existente)
3. Vá em **OAuth2 → General**
4. Copie o **Client ID** e **Client Secret**
5. Em **Redirects**, adicione:
   - `https://fusion7.shop/callback` (produção)
   - `http://localhost:5173/callback` (desenvolvimento)
6. Em **OAuth2 → Scopes**, marque `identify` e `email`

## 🛠️ Instalação e Execução

### Frontend (React + Vite)

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

O frontend roda em `http://localhost:5173`.

### Backend (Express + OAuth2)

```bash
cd server

# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais do Discord
# DISCORD_CLIENT_ID=seu_client_id
# DISCORD_CLIENT_SECRET=seu_client_secret
# REDIRECT_URI=http://localhost:5173/callback
# FRONTEND_URL=http://localhost:5173

# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

O backend roda em `http://localhost:3001`.

## 🔧 Variáveis de Ambiente

### Backend (`server/.env`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DISCORD_CLIENT_ID` | Client ID do app Discord | `123456789012345678` |
| `DISCORD_CLIENT_SECRET` | Client Secret do app Discord | `abcdefghijklmnopqrstuvwxyz123456` |
| `REDIRECT_URI` | URL de callback (deve bater com o portal) | `https://fusion7.shop/callback` |
| `FRONTEND_URL` | URL do frontend (para CORS e redirects) | `https://fusion7.shop` |
| `PORT` | Porta do servidor backend | `3001` |
| `NODE_ENV` | Ambiente (`development` ou `production`) | `production` |

## 🏗️ Estrutura do Projeto

```
discord-auth/
├── public/
│   └── logo.webp              # Logo do Fusion
├── server/
│   ├── .env.example           # Template de variáveis de ambiente
│   ├── index.js               # Servidor Express com rotas OAuth2
│   └── package.json
├── src/
│   ├── components/ui/
│   │   └── animated-shader-hero.tsx  # Fundo WebGL animado
│   ├── App.tsx                # Componente principal
│   ├── DiscordAuthCard.tsx    # Cartão de autenticação
│   ├── DiscordAuthCard.module.css
│   ├── HeroWrapper.tsx        # Wrapper de camadas (z-index)
│   ├── HeroWrapper.module.css
│   ├── main.tsx               # Entry point com React Router
│   ├── index.css              # Estilos globais
│   └── vite-env.d.ts          # Declarações de tipo
├── vercel.json                # Configuração de roteamento Vercel
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔐 Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/auth/discord` | Redireciona para autorização do Discord |
| GET | `/callback` | Recebe código, troca por token, busca usuário |
| GET | `/api/user` | Retorna dados do usuário autenticado (via cookie) |
| POST | `/api/logout` | Limpa sessão do usuário |
| GET | `/health` | Health check com status da configuração |

## 🎨 Rotas do Frontend

| Rota | Descrição |
|------|-----------|
| `/` | Página de autenticação com animação |
| `/callback` | Mesma página (rota de redirecionamento OAuth2) |

## 🚨 Solução de Problemas

### Erro "redirect_uri inválido"

1. Verifique se a URL em `server/.env` (`REDIRECT_URI`) é **idêntica** à configurada no Discord Developer Portal
2. Atenção a detalhes: `http` vs `https`, barra no final, caminho exato
3. A mesma URI deve ser usada tanto na requisição de autorização (`/auth/discord`) quanto na troca de token (`/callback`)

### Canvas WebGL não renderiza

- Verifique se o navegador suporta WebGL2
- O componente usa fallback automático para dimensões padrão em ambientes headless
- Consulte os logs do console para erros de compilação de shader

### Cookie não persiste

- Em produção, garanta que `NODE_ENV=production` para ativar cookies seguros
- Verifique se o CORS está configurado corretamente com `credentials: true`
- O cookie `discord_user` tem duração de 7 dias

## 📝 Licença

Projeto privado - Fusion7