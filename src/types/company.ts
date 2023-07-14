import { Artist } from "./artist"
import { User } from "./user"

export interface Company {
    uid: string
    name?: string
    users?: User[]
    artists?: Artist[]
    cnpj?: string
    address?: string; 
    city?: string;
    state?: string;
    email?: string; 
    phone?: string; 
    date_created?: Date;
    date_updated?: Date; 
}