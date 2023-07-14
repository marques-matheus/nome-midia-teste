import { Article } from "./article"

export interface Artist {
    id?: string
    name: string
    keywords?: string[]
    articles?: Article[]
    date_created?: Date
    date_updated?: Date
    last_sync?: Date | null
    last_return?: Date | null
}