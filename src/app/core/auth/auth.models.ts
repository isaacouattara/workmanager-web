/** Utilisateur connecté. Doit refléter le DTO renvoyé par l'API Spring Boot. */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  /** accessToken renvoyé par l'API, conservé pour les requêtes protégées. */
  token?: string;
}

export interface Credentials {
  email: string;
  password: string;
  /** "Se souvenir de moi" : session persistante (localStorage) ou limitée à l'onglet. */
  remember: boolean;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
