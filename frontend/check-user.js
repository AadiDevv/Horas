const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Utilisateur connecté:', payload);
} else {
  console.log('Pas de token');
}
