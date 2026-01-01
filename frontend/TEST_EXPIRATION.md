# 🧪 Guide de Test - Expiration du Token

## ✅ Checklist de Test

### Test 1 : Vérification de l'intégration
```bash
# 1. Vérifier que tous les fichiers sont créés
ls -la src/app/utils/tokenManager.ts
ls -la src/app/utils/apiClient.ts
ls -la src/app/hooks/useTokenExpiration.ts
ls -la src/app/components/AuthProvider.tsx
ls -la src/app/components/SessionExpiredModal.tsx

# 2. Vérifier layout.tsx
grep -n "AuthProvider" src/app/layout.tsx
```

**Résultat attendu** : Tous les fichiers existent, `AuthProvider` est importé et utilisé dans layout.tsx

---

### Test 2 : Démarrer l'application

```bash
cd /home/aadidevv/Epitech/Horas
docker-compose up
```

**Résultat attendu** : Frontend démarre sur http://localhost:3000 sans erreurs

---

### Test 3 : Test de connexion normale

1. Aller sur http://localhost:3000/login
2. Se connecter avec des identifiants valides
3. Vérifier que vous êtes redirigé vers le dashboard
4. Ouvrir la console navigateur (F12)
5. Vérifier localStorage :
   ```javascript
   console.log(localStorage.getItem('token'));
   console.log(localStorage.getItem('user'));
   ```

**Résultat attendu** : Token et user présents dans localStorage

---

### Test 4 : Test du décodage du token

Dans la console du navigateur :

```javascript
// Importer le module (ou copier la fonction decodeToken)
const token = localStorage.getItem('token');

// Décoder manuellement
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));

console.log('Token payload:', payload);
console.log('Expire à:', new Date(payload.exp * 1000));
console.log('Temps restant (secondes):', payload.exp - Math.floor(Date.now() / 1000));
```

**Résultat attendu** : Vous voyez l'email, role, et exp claim du token

---

### Test 5 : Test d'expiration simulée (RAPIDE)

1. Se connecter normalement
2. Dans la console navigateur, forcer un token expiré :
   ```javascript
   // Token expiré (exp = 1600000000 = 13 septembre 2020)
   const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6IlVzZXIiLCJyb2xlIjoiZW1wbG95ZSIsImlzQWN0aXZlIjp0cnVlLCJleHAiOjE2MDAwMDAwMDAsImlhdCI6MTYwMDAwMDAwMCwidHlwZSI6ImFjY2VzcyJ9.test';

   localStorage.setItem('token', expiredToken);
   console.log('Token expiré défini. Attendre 60 secondes max...');
   ```

3. Attendre **maximum 60 secondes** (intervalle du hook)

**Résultat attendu** :
- ✅ Modal "Session expirée" s'affiche
- ✅ localStorage est vidé
- ✅ Redirection vers /login après 2 secondes
- ✅ Console affiche : `⚠️ Token expiré détecté - Déconnexion automatique`

---

### Test 6 : Test d'expiration naturelle (LONG)

1. Se connecter normalement
2. **Attendre 30 minutes** (durée du token backend)
3. Le système devrait détecter l'expiration dans les 60 secondes suivantes

**Résultat attendu** : Même résultat que Test 5

---

### Test 7 : Test de l'apiClient (optionnel)

Modifier temporairement un service pour utiliser apiClient :

```typescript
// Dans dashboard-manager/services/apiService.ts
import { apiClient } from '@/app/utils/apiClient';

// Remplacer
const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
  method: 'GET',
  headers: getAuthHeaders()
});

// Par
const res = await apiClient.get(`${API_BASE_URL}/api/users/${id}`);
```

Puis tester avec un token expiré → la requête devrait être bloquée avant l'appel API.

---

### Test 8 : Test du modal visuel

1. Forcer un token expiré (comme Test 5)
2. Vérifier visuellement le modal :
   - ✅ Fond noir semi-transparent
   - ✅ Modal blanc arrondi centré
   - ✅ Icône rouge de déconnexion
   - ✅ Texte "Session expirée"
   - ✅ Spinner de chargement "Redirection en cours..."

---

## 🐛 Debugging

### Problème : Modal ne s'affiche pas

**Vérifier** :
```javascript
// Console navigateur
console.log('Token:', localStorage.getItem('token'));

// Forcer le check manuel
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
const now = Math.floor(Date.now() / 1000);
console.log('Expiré?', payload.exp < now);
```

### Problème : Erreur de compilation

**Vérifier** :
- Tous les imports sont corrects
- AuthProvider est bien en `"use client"`
- Pas de syntaxe JSX invalide

### Problème : Redirection en boucle

**Cause possible** : Le hook s'exécute sur /login aussi

**Solution** : Ajouter une condition dans useTokenExpiration :
```typescript
if (typeof window !== 'undefined' && window.location.pathname === '/login') {
  return; // Ne pas vérifier sur la page login
}
```

---

## 📊 Logs attendus

Dans la console du navigateur, vous devriez voir :

```
✅ Connexion réussie
[useTokenExpiration] Vérification initiale du token
[useTokenExpiration] Token valide, expire dans 1800 secondes

... (60 secondes plus tard)
[useTokenExpiration] Vérification périodique du token

... (quand le token expire)
⚠️ Token expiré détecté - Déconnexion automatique
🔒 Déconnexion effectuée - localStorage nettoyé
[Router] Redirection vers /login
```

---

## ✅ Validation finale

Cocher chaque point :

- [ ] Fichiers créés (5 fichiers)
- [ ] Layout.tsx modifié avec AuthProvider
- [ ] Application démarre sans erreur
- [ ] Connexion fonctionne
- [ ] Token décodable dans console
- [ ] Modal s'affiche avec token expiré
- [ ] Redirection vers /login fonctionne
- [ ] localStorage nettoyé après expiration

---

## 🎯 Critères de Succès

✅ **Fonctionnel** : Le système détecte l'expiration et déconnecte
✅ **UX** : Modal clair et redirection automatique
✅ **Sécurité** : Pas de requêtes avec token expiré
✅ **Non-invasif** : Compatible avec le code existant
✅ **Maintenable** : Code clair et documenté

---

## 📝 Notes

- Le délai de détection max est de **60 secondes** (intervalle du hook)
- Le délai de redirection est de **2 secondes** (temps de lecture du modal)
- Pour un test rapide, utilisez la méthode du token expiré forcé (Test 5)
