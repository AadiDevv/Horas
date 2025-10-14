import { EquipeProps } from "../types/entitiyProps";

export class Equipe {
    public readonly id?: number;
    public nom: string;
    public description: string;
    public managerId: number;
    public createdAt: Date;
    public updatedAt?: Date;
    public deletedAt?: Date | null;

    constructor(props: EquipeProps) {
        this.id = props.id;
        this.nom = props.nom;
        this.description = props.description;
        this.managerId = props.managerId;
        this.createdAt = props.createdAt || new Date(Date.now());
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
    }

    // TODO: Ajouter méthodes de validation si nécessaire
    // TODO: Ajouter méthodes métier (ex: addMembre, removeMembre, etc.)
}