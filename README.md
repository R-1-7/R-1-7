# JARVIS — Assistant IA Personnel SaaS

Un assistant IA personnel autonome et intelligent, style Jarvis d'Iron Man. Branchez vos propres clés API, choisissez votre modèle favori, et conversez naturellement — même à la voix.

## Fonctionnalités

- **Multi-IA** : OpenAI GPT-4, Anthropic Claude, Google Gemini, Mistral, Groq
- **Interface Jarvis** : Design futuriste avec effets holographiques, glassmorphism
- **Streaming** : Réponses en temps réel avec indicateur de frappe
- **Voice** : Dictée vocale (Web Speech API) + synthèse vocale (TTS)
- **Historique** : Conversations sauvegardées, épinglables, recherchables
- **Outils autonomes** : Date/heure, calculs mathématiques, simulation de recherche
- **Gestion des clés** : Interface sécurisée pour vos clés API
- **PWA** : Installable sur mobile comme une app native
- **Markdown** : Rendu complet avec tables, code, listes, etc.
- **Responsive** : Optimisé desktop et mobile

## Stack Technique

- **Frontend** : Next.js 16 (App Router), TypeScript, TailwindCSS
- **Backend** : Next.js API Routes, NextAuth.js v5
- **Base de données** : SQLite via Prisma 7 + LibSQL
- **IA** : Vercel AI SDK v4 (streaming, tool calls)
- **UI** : Lucide React, React Hot Toast, React Markdown

## Installation rapide

```bash
# 1. Cloner le projet
git clone <repo>
cd <repo>

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env et ajoutez AUTH_SECRET (générer avec: openssl rand -base64 32)

# 4. Initialiser la base de données
npm run setup

# 5. Lancer le serveur
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Configuration

### Variables d'environnement (.env)

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="votre-secret-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### Ajouter vos clés API

1. Créez un compte sur [http://localhost:3000/register](http://localhost:3000/register)
2. Allez dans **Clés API** dans le menu
3. Ajoutez votre clé pour le provider souhaité :
   - **OpenAI** : [platform.openai.com](https://platform.openai.com/api-keys)
   - **Anthropic** : [console.anthropic.com](https://console.anthropic.com/)
   - **Google Gemini** : [aistudio.google.com](https://aistudio.google.com/app/apikey)
   - **Mistral** : [console.mistral.ai](https://console.mistral.ai/)
   - **Groq** : [console.groq.com](https://console.groq.com/keys)

## Architecture

```
src/
├── app/
│   ├── api/           # Routes API (chat, auth, conversations, keys, prefs, stats)
│   ├── dashboard/     # App principale (chat, clés, stats, paramètres)
│   ├── login/         # Page de connexion
│   ├── register/      # Page d'inscription
│   └── page.tsx       # Landing page
├── components/
│   ├── chat/          # Interface de chat (ChatWindow, MessageBubble, etc.)
│   ├── layout/        # Sidebar
│   └── ui/            # Composants réutilisables (Button, Input, Modal, Badge)
└── lib/
    ├── ai-providers.ts # Abstraction multi-IA
    ├── auth.ts         # Configuration NextAuth
    ├── prisma.ts       # Client Prisma
    └── utils.ts        # Utilitaires, constantes providers
```

## Déploiement (Vercel)

```bash
# Configurer les variables d'env sur Vercel
# DATABASE_URL → utilisez PlanetScale ou Turso pour la prod
# AUTH_SECRET → openssl rand -base64 32
# NEXTAUTH_URL → votre domaine

vercel deploy
```

## Sécurité

- Mots de passe hashés avec bcryptjs (rounds: 12)
- Sessions JWT sécurisées via NextAuth
- Clés API stockées localement (à chiffrer en production avec AES-256)
- Routes API protégées par vérification de session

## License

MIT
