import { CleanedPartialEntity } from "@/domain/types";
export const cleanDto = <T extends Record<string, any>>(dto: T): T => {
    return Object.fromEntries(
        Object.entries(dto).filter(([_, value]) => value !== undefined)
    ) as T;
};
type PrismaUpdateInput<T> = {
    [K in keyof T]?: T[K];
};

export const cleanEntityForUpdate = <T extends Record<string, any>>(
    entity: T
): PrismaUpdateInput<Omit<T, 'id'>> => {
    return Object.fromEntries(
        Object.entries(entity)
            .filter(([_, value]) => !(value === undefined || typeof value === 'function'))
            .filter(([key, _]) => !(key.startsWith('_') || key === 'id'))
    ) as any;
};