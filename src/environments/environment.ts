// Configuración de la app web de Firebase (proyecto «Equipo Basket Producto2»).
// Estos valores identifican el proyecto y son públicos por diseño: lo que protege los datos
// son las reglas de seguridad de Firestore (firebase/firestore.rules).
export const environment = {
  firebase: {
    apiKey: 'AIzaSyBdDp7R0gWho4HZSoWJ1lHjRxlD28Xb9xU',
    authDomain: 'equipo-basket-producto2-ee9e1.firebaseapp.com',
    projectId: 'equipo-basket-producto2-ee9e1',
    storageBucket: 'equipo-basket-producto2-ee9e1.firebasestorage.app',
    messagingSenderId: '428664606749',
    appId: '1:428664606749:web:c9cce3525bc3bf75aa36f4',
  },
  // Servidor de archivos (Cloudinary, plan gratuito): nombre de la cuenta y preajuste de subida
  // sin firma. Tampoco son secretos: solo permiten subir fotos y vídeos a la carpeta del equipo.
  cloudinary: {
    nube: 'cfto2t9j',
    preajuste: 'equipo-basket',
  },
};
