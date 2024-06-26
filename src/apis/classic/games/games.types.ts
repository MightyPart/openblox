// [ Types ] /////////////////////////////////////////////////////////////////////
import type { ISODateTime, Identifier, ObjectPrettify, ObjectPrettifyDeep } from "typeforge"
//////////////////////////////////////////////////////////////////////////////////


type GameGearGenre = "All" | "TownAndCity" | "Fantasy" | "SciFi" | "Ninja" | "Scary" | "Pirate" | "Adventure" | "Sports" | "Funny" | "WildWest" | "War" | "SkatePark" | "Tutorial"

type GameGearCategories = "Building" | "Explosive" | "Melee" | "Musical" | "Navigation" | "PowerUp" | "Ranged" | "Social" | "Transportation"

// GET /v2/users/{userId}/games --------------------------------------------------------------------------------------
type GamesInfoData<TimeType> = ObjectPrettify<{
  rootPlaceId: Identifier,
  name: string,
  description: string | null,
  sourceName: string,
  creator: {
    id: number,
    name: string,
    type: "User" | "Group",
    isRNVAccount: boolean,
    hasVerifiedBadge: boolean
  },
  price: number | null,
  allowedGearGenres: GameGearGenre[],
  allowedGearCategories: GameGearCategories[],
  isGenreEnforced: boolean,
  copyingAllowed: boolean,
  playing: number,
  visits: number,
  maxPlayers: number,
  created: TimeType,
  updated: TimeType,
  studioAccessToApisAllowed: boolean,
  createVipServersAllowed: boolean,
  universeAvatarType: "MorphToR15" | "MorphToR6" | "PlayerChoice",
  genre: GameGearGenre,
  isAllGenre: boolean,
  isFavouritedByUser: boolean,
  favouriteCount: number
}>

export type RawGamesInfoData<UniverseId extends Identifier> = ObjectPrettify<{
  data: ObjectPrettify<{ id: UniverseId } & GamesInfoData<ISODateTime>>[]
}>


export type PrettifiedGamesInfoData<UniverseId extends Identifier> = ObjectPrettify<{
  [Key in UniverseId]: ObjectPrettify<GamesInfoData<Date>>
}>
// -------------------------------------------------------------------------------------------------------------------


// GET /v2/users/{userId}/games --------------------------------------------------------------------------------------
type UserGamesData<TimeType> = ObjectPrettify<{
  id: Identifier,
  name: string,
  description: string | null,
  creator: {
    id: number,
    type: "User"
  },
  rootPlace: {
    id: number,
    type: "Place"
  },
  created: TimeType,
  updated: TimeType,
  placeVisits: number
}>[]

export type RawUserGamesData = ObjectPrettify<{
  previousPageCursor: string | null,
  nextPageCursor: string | null,
  data: UserGamesData<ISODateTime>
}>

export type PrettifiedUserGamesData = UserGamesData<Date>
// -------------------------------------------------------------------------------------------------------------------