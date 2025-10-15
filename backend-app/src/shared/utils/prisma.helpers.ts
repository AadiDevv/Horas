/**
 * Type utilitaire qui transforme tous les champs nullable (T | null) en (T | undefined)
 * Les champs non-nullable restent inchangés
 */
export type NullToUndefined<T> = {
    [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K];
};

/**
 * Convertit automatiquement toutes les propriétés null d'un objet en undefined
 * 
 * @example
 * const prismaUser = { id: 1, name: "John", teamId: null };
 * const user = nullToUndefined(prismaUser);
 * // Résultat: { id: 1, name: "John", teamId: undefined }
 * 
 * @usage
 * return new User(nullToUndefined(prismaUser));
 * // ou avec spread
 * return new User({ ...nullToUndefined(prismaUser), extraProp: value });
 */
export const nullToUndefined = <T extends Record<string, any>>(obj: T): NullToUndefined<T> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key as keyof T] = value === null ? undefined : value;
        return acc;
    }, {} as any) as NullToUndefined<T>;
};

