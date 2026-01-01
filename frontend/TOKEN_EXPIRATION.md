# Gestion de l'Expiration du Token JWT

## 📋 Vue d'ensemble

Ce système gère automatiquement l'expiration des tokens JWT côté frontend. Lorsqu'un token expire (30 minutes par défaut), l'utilisateur est déconnecté automatiquement avec un modal informatif.

## 🏗️ Architecture

### Fichiers créés

```
frontend/src/app/
├── utils/
│   ├── tokenManager.ts       # Utilitaires JWT (décodage, vérification)
│   └── apiClient.ts          # Wrapper fetch avec validation token
│
├── hooks/
│   └── useTokenExpiration.ts # Hook de surveillance du token
│
└── components/
    ├── AuthProvider.tsx          # Provider global d'authentification
    └── SessionExpiredModal.tsx   # Modal "Session expirée"
```

### Fonctionnement

```
┌─────────────────────────────────────────────────┐
│  1. AuthProvider (layout.tsx)                   │
│     - Wrapper global autour de toute l'app      │
│     - Active le hook useTokenExpiration         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. useTokenExpiration (hook)                   │
│     - Vérifie le token toutes les 60 secondes   │
│     - Détecte l'expiration                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. Token expiré détecté                        │
│     - Nettoie localStorage                      │
│     - Affiche SessionExpiredModal               │
│     - Redirige vers /login (2 secondes)         │
└─────────────────────────────────────────────────┘
```

## 🔧 Utilisation

### 1. Le système est automatique

Aucune configuration nécessaire ! Le système fonctionne automatiquement grâce à `AuthProvider` dans `layout.tsx`.

### 2. Utiliser apiClient (recommandé)

Pour une protection supplémentaire, utilisez `apiClient` dans vos services API :

```typescript
import { apiClient } from '@/app/utils/apiClient';

// Au lieu de fetch natif
const response = await apiClient.get('http://localhost:8080/api/users');

// Avec POST
const response = await apiClient.post('http://localhost:8080/api/teams', {
  name: 'Équipe Alpha'
});

// Avec PATCH
const response = await apiClient.patch('http://localhost:8080/api/users/1', {
  firstName: 'John'
});

// Avec DELETE
const response = await apiClient.delete('http://localhost:8080/api/users/1');
```

**Avantage** : Vérifie le token **avant** chaque requête, évite les erreurs 401.

### 3. Utilitaires disponibles

```typescript
import {
  decodeToken,
  isTokenExpired,
  getTimeUntilExpiration,
  isAuthenticated,
  logout
} from '@/app/utils/tokenManager';

// Vérifier si l'utilisateur est authentifié
if (isAuthenticated()) {
  console.log('User connecté');
}

// Décoder le token
const payload = decodeToken(token);
console.log(payload.email, payload.role);

// Vérifier expiration
if (isTokenExpired(token)) {
  console.log('Token expiré');
}

// Temps restant en secondes
const secondsLeft = getTimeUntilExpiration(token);
console.log(`Expire dans ${secondsLeft}s`);

// Déconnexion manuelle
logout(); // Nettoie localStorage
```

## ⚙️ Configuration

### Modifier l'intervalle de vérification

Par défaut : **60 secondes**

Modifier dans [useTokenExpiration.ts:45](/home/aadidevv/Epitech/Horas/frontend/src/app/hooks/useTokenExpiration.ts#L45) :

```typescript
const intervalId = setInterval(() => {
  checkTokenExpiration();
}, 30000); // 30 secondes au lieu de 60
```

### Modifier le délai de redirection

Par défaut : **2 secondes**

Modifier dans [useTokenExpiration.ts:36](/home/aadidevv/Epitech/Horas/frontend/src/app/hooks/useTokenExpiration.ts#L36) :

```typescript
setTimeout(() => {
  router.push('/login');
}, 3000); // 3 secondes au lieu de 2
```

### Modifier le style du modal

Éditer [SessionExpiredModal.tsx](/home/aadidevv/Epitech/Horas/frontend/src/app/components/SessionExpiredModal.tsx)

## 🧪 Test manuel

### Simuler une expiration

1. **Méthode 1 : Modifier le token dans localStorage**
   ```javascript
   // Dans la console du navigateur
   const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTYwMDAwMDAwMH0.test';
   localStorage.setItem('token', expiredToken);
   ```

2. **Méthode 2 : Attendre 30 minutes**
   - Se connecter normalement
   - Attendre 30 minutes (durée du token backend)
   - Le modal apparaîtra automatiquement

3. **Méthode 3 : Modifier temporairement l'intervalle**
   - Mettre 5000ms (5 secondes) dans useTokenExpiration
   - Se connecter
   - Le check sera plus rapide (test dev uniquement)

## 🔒 Sécurité

### Points clés

✅ **Token vérifié périodiquement** - Toutes les 60 secondes
✅ **Déconnexion automatique** - Pas de requêtes avec token expiré
✅ **Nettoyage complet** - localStorage vidé (token, user, role)
✅ **Double vérification** - Hook + apiClient wrapper
✅ **Pas de dépendances externes** - Utilise seulement atob() natif

### Limitations

⚠️ **localStorage vulnérable XSS** - Le token reste dans localStorage (risque XSS)
⚠️ **Pas de refresh token** - L'utilisateur doit se reconnecter après 30 min
⚠️ **Client-side seulement** - Pas de middleware Next.js SSR

## 📊 Comportement UX

```
User connecté → Travaille normalement
       ↓
Token expire (30 min)
       ↓
Hook détecte (max 60s de délai)
       ↓
Modal "Session expirée" s'affiche
       ↓
Redirection /login après 2s
       ↓
User doit se reconnecter
```

## 🔧 Migration progressive vers apiClient

Pour migrer vos services existants vers `apiClient` :

**Avant** (apiService.ts) :
```typescript
const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
  method: 'GET',
  headers: getAuthHeaders()
});
```

**Après** :
```typescript
import { apiClient } from '@/app/utils/apiClient';

const res = await apiClient.get(`${API_BASE_URL}/api/users/${id}`);
```

## 🐛 Debugging

Activer les logs :
- Les logs sont déjà présents dans `tokenManager.ts` et `useTokenExpiration.ts`
- Ouvrir la console navigateur (F12)
- Rechercher : `⚠️ Token expiré` ou `🔒 Déconnexion effectuée`

## 📝 Notes

- Le système est **non-invasif** : compatible avec l'architecture existante
- Les services existants continuent de fonctionner sans modification
- La migration vers `apiClient` est **optionnelle mais recommandée**
- Le modal utilise le même design system que `SettingsModal`

## 🚀 Prochaines améliorations possibles

1. **Refresh Token** - Renouveler le token automatiquement avant expiration
2. **httpOnly cookies** - Stocker le token de manière plus sécurisée
3. **Warning modal** - Avertir l'utilisateur 5 min avant expiration
4. **Next.js middleware** - Protection au niveau du routing SSR
5. **Tests unitaires** - Tester le décodage JWT et la logique d'expiration
