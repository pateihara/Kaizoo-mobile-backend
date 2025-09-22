# 🐾 Kaizoo - Mexa-se. Evolua. Divirta-se!  

Kaizoo é um aplicativo de fitness gamificado que transforma seus treinos em uma jornada divertida!  
Cuide de mascotes únicos, complete desafios personalizados e construa hábitos saudáveis com leveza e evolução contínua.  

---

### 🧭 Contexto
A prática de exercícios físicos está diretamente ligada à saúde física e mental, mas manter uma rotina ativa pode ser desafiador. Falta de tempo, cansaço e a ausência de motivação contínua fazem muitas pessoas desistirem antes de criar o hábito. Além disso, a maioria dos apps disponíveis no mercado são técnicos demais, voltados para performance, e não acolhem iniciantes ou pessoas em busca de leveza e bem-estar.

---

### 🚀 Proposta
Desenvolvemos o **Kaizoo**, um aplicativo de fitness gamificado que transforma o ato de se exercitar em uma jornada divertida e recompensadora. Inspirado na filosofia do _Kaizen_ (melhoria contínua), o Kaizoo incentiva a constância com leveza, mascotes evolutivos, desafios personalizados e recompensas simbólicas. Cada pequeno progresso é celebrado, tornando o autocuidado algo acessível, visual e motivador.

---

### 📊 Pesquisa Quantitativa
- **70%** têm dificuldade em manter motivação.  
- **60%** praticam exercícios de forma leve/moderada.  
- **85%** se sentiriam mais motivados com gamificação e recompensas.  
- **55%** já abandonaram apps de treino por acharem entediantes.  

**Conclusão:** existe uma forte demanda por uma solução leve, divertida e focada em progressos diários.

---

### 🔎 Análise de Concorrentes
**STRAVA** → forte interação social e desafios, mas foco técnico em performance.  
**Nike Training Club** → treinos guiados para diferentes níveis, mas baixa interação comunitária.  
**Adidas Running** → gamificação com medalhas, mas muitas funções apenas na versão paga.  

---

### 🧠 Inspirações Criativas
- **Tamagochis**: mascotes que evoluem com cuidado.  
- **Pokémon**: misturas de animais únicos e evolutivos.  
- **Dumb Ways to Die**: estilo divertido e descontraído.  
- **Filosofia Kaizen**: pequenas melhorias diárias para evolução constante.  

---

### 🎯 Público-alvo
**Mulheres e homens de 25 a 35 anos**, moradores de centros urbanos, com rotina intensa e dificuldade de manter constância nos treinos.  
Valorizam praticidade, recompensas simbólicas, mascotes e elementos de progresso visual.  

| Critério       | Perfil                                     |
| -------------- | ------------------------------------------ |
| Idade          | 25 a 35 anos                               |
| Gênero         | Predominantemente feminino (mas inclusivo) |
| Classe social  | Média a média-alta                         |
| Localização    | Centros urbanos                            |
| Estilo de vida | Ativo ou tentando ser                      |
| Motivações     | Saúde, estética, disposição e bem-estar    |
| Barreiras      | Falta de tempo, rotina puxada, filhos      |

---

### 👤 Persona
**Juliana Costa**, 27 anos, analista de marketing, vive em Curitiba.  
Rotina agitada com filha pequena, já tentou usar apps de fitness mas sente falta de motivação contínua.  
Adora visualizar progresso, valoriza recompensas e precisa de treinos curtos e realistas.

> 🧠 _“Eu quero me exercitar, mas preciso de uma ajudinha pra não desistir.”_

---

### ⚙️ Funcionalidades do App
0. Onboarding (concluído!)  
1. Cadastro e autenticação de usuário (concluído!)  
2. Escolha do mascote (concluído!)  
3. Registro de atividades físicas (em desenvolvimento)  
4. Monitoramento de progresso (em desenvolvimento)  
5. Comunidade e eventos temáticos (em desenvolvimento)  

---

### 🎨 Identidade Visual
- Estilo **cartoon** com cores suaves.  
- Mascotes evolutivos como elo emocional.  
- Interface limpa, modular (inspirada em Bento Design).  
- Cards independentes para progresso, desafios e conquistas.  

---

## 🛠️ Arquitetura Técnica e Desenvolvimento

- **Frontend:** React Native + Expo (com expo-router e React Navigation).  
- **Estilização:** Atomic Design (atoms, molecules, organisms, templates) + `src/theme`.  
- **Gerenciamento de Estado:** AsyncStorage para sessão e mascote.  
- **Acessibilidade:** contraste adequado, botões grandes, navegação simplificada.  
- **Mobile:** build em Expo para Android/iOS.  
- **Controle de Versão:** GitHub.  

### 🔌 Backend
- **Tecnologias:** Node.js + Express + Prisma.  
- **Banco de dados:** PostgreSQL no [Neon](https://neon.tech/) (serverless).  
- **Autenticação:** JWT (access + refresh tokens).  
- **Integração:** APIs REST consumidas pelo app mobile.  

### 🔐 Variáveis de Ambiente
As variáveis ficam no arquivo `.env` (não commitado).  
O repositório inclui um `.env.example` como modelo.  

```env
# Banco de dados Neon
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/neondb?sslmode=require&channel_binding=require"

# Chaves JWT
JWT_ACCESS_SECRET="sua_chave_super_secreta"
JWT_REFRESH_SECRET="sua_chave_refresh_super_secreta"

# Expiração dos tokens
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL="30d"
```

**Como usar:**  
```bash
cp .env.example .env
# edite com sua DATABASE_URL do Neon
```

---

## ⚙️ Como Executar o Projeto

### 🔧 Pré-requisitos
- [Node.js](https://nodejs.org/) (>= 18)  
- [Expo CLI](https://docs.expo.dev/get-started/installation/)  
- [Git](https://git-scm.com/)  
- [Expo Go](https://expo.dev/client) instalado no celular  

---

### ▶️ Passos de execução

#### Rodar o frontend
```bash
git clone https://github.com/pateihara/Kaizoo-Mobile.git
cd kaizoo-mobile
npm install
npx expo start
Escaneie o QR Code com o app **Expo Go** no celular.
```

#### Rodar o backend
```bash
git clone https://github.com/pateihara/Kaizoo-mobile-backend
cd mobile-kaizoo-auth-backend
npm install
cp .env.example .env   # configurar variáveis
npx prisma migrate dev --name init
npm run dev
```
O backend ficará em `http://localhost:3000`.
---

### ⚠️ Observação sobre o backend e localhost
No frontend, a URL do backend está configurada como:

```
http://localhost:3000
```

- Se você rodar o **frontend e o backend na mesma máquina** (ex: emulador Android/iOS no PC), funciona normalmente.  
- Se rodar no **celular físico via Expo Go**, o celular não enxerga o `localhost` do PC.  
  Nesse caso, altere a URL para o **IP da sua máquina** na rede local, por exemplo:  

```
http://192.168.1.10:3000
```

> 💡 Descubra seu IP com `ipconfig` (Windows) ou `ifconfig` (Linux/Mac).

---

### 📂 Estrutura do Repositório
```bash
.
├── kaizoo-mobile/              # App mobile (React Native + Expo)
└── mobile-kaizoo-auth-backend/ # Backend (Node.js + Express + Prisma + Neon)
```
---

### 🔗 Links Importantes
- 🎬 [Vídeo Pitch](https://www.youtube.com/watch?v=YhCOFLgWKoE)  
- 🔍 [Marca no Canva](https://www.canva.com/design/DAGl200Eld0/vIQVUn-K3Q9dTUG8oYHVBQ/view)  
- 🌐 [Frontend (GitHub)](https://github.com/pateihara/Kaizoo-Mobile)  
- 🌐 [Backend (GitHub)](https://github.com/pateihara/Kaizoo-mobile-backend)  
- 🎨 [Protótipo Figma](https://www.figma.com/proto/pVsIoJEYtDM3A3XYC5iQfM/KAIZOO---ENTERPRISE-CHALLENGE)  

---

### 👥 Equipe
- Natalia Guaita → Planejamento e design  
- Patricia Eihara → Planejamento e desenvolvimento  
- Rafael Santos → Planejamento, atualizações e videomaker  

---