// #region BASIC TYPES
export type NonUndefined<T> = {
    [K in keyof T]: Exclude<T[K], undefined>
};
// #endregion

/**
 * Représente une entité nettoyée pour une mise à jour :
 * - Exclut 'id'
 * - Exclut les propriétés commençant par '_'
 * - Exclut les fonctions
 * - Exclut les valeurs undefined
 * - Toutes les propriétés sont optionnelles
 */
export type CleanedPartialEntity<T> = NonUndefined<Partial<Omit<T, 'id'>>>;
