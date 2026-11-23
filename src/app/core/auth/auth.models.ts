/** Utilisateur connecté. Doit refléter le DTO renvoyé par l'API Spring Boot. */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  /** JWT renvoyé par l'API (absent tant que le backend n'est pas branché). */
  token?: string;
}

export interface Credentials {
  email: string;
  password: string;
  /** "Se souvenir de moi" : session persistante (localStorage) ou limitée à l'onglet. */
  remember: boolean;
}
