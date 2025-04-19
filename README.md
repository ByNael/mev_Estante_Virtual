# Minha Estante Virtual (MEV)

Sistema de gerenciamento de livros com autenticação de usuários.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Frontend**: Aplicação React com TailwindCSS
- **Backend**: API Node.js com Express e MongoDB

## Requisitos

- Node.js (v14 ou superior)
- MongoDB (local ou remoto)

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mev_db
JWT_SECRET=sua_chave_secreta_muito_segura
\`\`\`

### 2. Instalação de Dependências

\`\`\`bash
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
\`\`\`

## Execução

### Método 1: Script de Inicialização

Execute o script de inicialização na raiz do projeto:

\`\`\`bash
node start.js
\`\`\`

### Método 2: Iniciar Separadamente

\`\`\`bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
\`\`\`

## Funcionalidades

- Registro de usuários
- Login com autenticação JWT
- Dashboard protegido
- Gerenciamento de perfil de usuário

## Tecnologias Utilizadas

- **Frontend**: React.js, TailwindCSS, React Router
- **Backend**: Node.js, Express
- **Banco de Dados**: MongoDB
- **Autenticação**: JWT (JSON Web Token)

## Estrutura de Arquivos

\`\`\`
mev/
├── backend/
│   ├── server.js       # Servidor Express
│   └── package.json    # Dependências do backend
├── frontend/
│   ├── public/         # Arquivos estáticos
│   ├── src/            # Código fonte React
│   └── package.json    # Dependências do frontend
└── start.js            # Script de inicialização
