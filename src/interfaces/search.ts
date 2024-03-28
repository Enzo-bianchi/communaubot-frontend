import { Sector } from "./sector"

export interface Search {
    userId:string
    from:string
    to:string
    sector:Sector
    state?:string
    tokenFCM:string
}