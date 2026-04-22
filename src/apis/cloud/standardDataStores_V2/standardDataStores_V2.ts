// [ Modules ] ///////////////////////////////////////////////////////////////////
import { createApiGroup } from "../../apiGroup"
import { cloneAndMutateObject, dataIsSuccess } from "../../../utils/utils"
//////////////////////////////////////////////////////////////////////////////////


// [ Types ] /////////////////////////////////////////////////////////////////////
import type { ArrayNonEmptyIfConst, Identifier, ISODateTime } from "typeforge"

import type { ApiMethod } from "../../apiGroup"
import type { PrettifiedCreateStandardDataStoreSnapshotData, PrettifiedFullDatastoreData, PrettifiedListStandardDatastoreEntriesData, PrettifiedListStandardDataStoreEntryRevisionsData, PrettifiedListStandardDatastoresData, RawCreateStandardDataStoreSnapshotData, RawFullDatastoreData, RawListStandardDatastoreEntriesData, RawListStandardDataStoreEntryRevisionsData, RawListStandardDatastoresData } from "./standardDataStores_V2.types"
//////////////////////////////////////////////////////////////////////////////////


// [ Variables ] /////////////////////////////////////////////////////////////////
const { createApiMethod } = createApiGroup({ name: "StandardDatastores_V2", baseUrl: "https://apis.roblox.com/cloud" })
//////////////////////////////////////////////////////////////////////////////////


// [ Private Functions ] /////////////////////////////////////////////////////////
const formatRevisionCreateTimeClamp = (createdBefore?: ISODateTime | Date, createdAfter?: ISODateTime | Date) => {
  if (createdBefore && createdBefore instanceof Date) createdBefore = createdBefore.toISOString() as ISODateTime
  if (createdAfter && createdAfter instanceof Date) createdAfter = createdAfter.toISOString() as ISODateTime

  return `${
    createdBefore ? `revision_create_time <= ${createdBefore}` : ""
  }${(createdBefore && createdAfter) ? " && " : ""}${
    createdAfter ? `revision_create_time >= ${createdAfter}` : ""
  }`
}
//////////////////////////////////////////////////////////////////////////////////


/**
 * Returns a list of data stores belonging to an experience.
 * @endpoint GET /v2/universes/{universeId}/data-stores
 * 
 * @param universeId The ID of the universe to list datastores for.
 * @param prefix Provide to return only data stores with this prefix.
 * @param limit The maximum number of data stores to return. The service might return fewer than this value. If unspecified, at most 10 data stores are returned. The maximum value is 100 and higher values are set to 100.
 * @param cursor The paging cursor for the previous or next page.
 * 
 * @example const { data:datastores } = await StandardDataStoresApi_V2.listStandardDataStores({ universeId: 5097539509, prefix: "Ba" })
 * @exampleData [{"path":"universes/5097539509/data-stores/Bans","id":"Bans"}] 
 * @exampleRawBody {"dataStores":[{"path":"universes/5097539509/data-stores/Bans","id":"Bans"}]}
 */
export const listStandardDataStores = createApiMethod(async <UniverseId extends Identifier, Prefix extends string>(
  { universeId, prefix, limit, cursor }: { universeId: UniverseId, prefix?: Prefix, limit?: number, cursor?: string }
): ApiMethod<RawListStandardDatastoresData<UniverseId, Prefix>, PrettifiedListStandardDatastoresData<UniverseId, Prefix>> => ({
  method: "GET",
  path: `/v2/universes/${universeId}/data-stores`,
  searchParams: { filter: prefix ? `id.startsWith("${prefix}")` : null, maxPageSize: limit, pageToken: cursor },
  name: `listStandardDataStores`,

  formatRawDataFn: ({ dataStores }) => dataStores
}))


/**
 * Creates a snapshot of standard datastores for a universe.
 * @endpoint POST /cloud/v2/universes/{universeId}/data-stores:snapshot
 * 
 * @param universeId The ID of the universe to create a snapshot for.
 * 
 * @example const { data:snapshot } = await StandardDataStoresApi_V2.createStandardDataStoreSnapshot({ universeId: 5097539509 })
 * @exampleData {"newSnapshotTaken":false,"latestSnapshotTime":"2024-07-29T22:08:49.588Z"}
 * @exampleRawBody {"newSnapshotTaken":false,"latestSnapshotTime":"2024-07-29T22:08:49.588Z"}
 */
export const createStandardDataStoreSnapshot = createApiMethod(async (
  { universeId }: { universeId: Identifier }
): ApiMethod<RawCreateStandardDataStoreSnapshotData, PrettifiedCreateStandardDataStoreSnapshotData> => ({
  method: "POST",
  path: `/v2/universes/${universeId}/data-stores:snapshot`,
  body: {},
  name: `createStandardDataStoreSnapshot`,

  formatRawDataFn: rawData => {
    if (!rawData.latestSnapshotTime) return rawData
    return cloneAndMutateObject(rawData, obj => obj.latestSnapshotTime = new Date(obj.latestSnapshotTime as any as ISODateTime))
  }
}))


/**
 * Lists entries for a standard datastore.
 * @endpoint
 * GET /v2/universes/{universe}/data-stores/{data-store}/entries
 * GET /v2/universes/{universe}/data-stores/{data-store}/scopes/{scope}/entries
 * 
 * @param universeId The ID of the universe to get data store entries for.
 * @param prefix Provide to return only data store entries with this prefix.
 * @param limit The maximum number of data store entries to return. The service might return fewer than this value. If unspecified, at most 10 data store entries are returned. The maximum value is 256 and higher values are set to 256.
 * @param cursor The paging cursor for the previous or next page.
 * 
 * @example
 * await StandardDataStoresApi_V2.listStandardDataStoreEntries({
     universeId: 5097539509, dataStore: "InventoryStore"
   })
 * @exampleData [{"path":"universes/5097539509/data-stores/InventoryStore/entries/user/45348281","id":"user/45348281"}]
 * @exampleRawBody {"dataStoreEntries":[{"path":"universes/5097539509/data-stores/InventoryStore/entries/user/45348281","id":"user/45348281"}]}
 */
export const listStandardDataStoreEntries = createApiMethod(async <
  UniverseId extends Identifier, Prefix extends string, DataStore extends string, Scope extends string
>(
  { universeId, dataStore, scope, prefix, limit, cursor }:
  { universeId: UniverseId, dataStore: DataStore, scope?: Scope, prefix?: Prefix, limit?: number, cursor?: string }
): ApiMethod<
  RawListStandardDatastoreEntriesData<UniverseId, Prefix, DataStore, Scope>,
  PrettifiedListStandardDatastoreEntriesData<UniverseId, Prefix, DataStore, Scope>
  > => ({
  method: "GET",
  path: (
    scope ? `/v2/universes/${universeId}/data-stores/${dataStore}/scopes/${scope}/entries`
    : `/v2/universes/${universeId}/data-stores/${dataStore}/entries`
  ),
  searchParams: { filter: prefix ? `id.startsWith("${prefix}")` : null, maxPageSize: limit, pageToken: cursor },
  name: `listStandardDataStoreEntries`,

  formatRawDataFn: rawData => rawData?.dataStoreEntries || [],

  getCursorsFn: rawData => [ null, rawData?.nextPageToken ]
}))


/**
 * Creates an entry in a standard datastore.
 * @endpoint
 * POST /v2/universes/{universe}/data-stores/{data-store}/entries
 * POST /v2/universes/{universe}/data-stores/{data-store}/scopes/{scope}/entries
 * 
 * @param universeId The ID of the universe to create the entry in.
 * @param dataStore the name of the datastore to create the entry in.
 * @param scope The optional scope for the dataStore.
 * @param entryId The ID (key / name) for the entry.
 * @param value The value (content) for the entry.
 * @param users Array metadata containing the IDs of the users this entry is affiliated with.
 * @param attributes Key-Value Pairs metadata containing arbitrary data.
 * 
 * @example
 * type InventorySchema = { Iron?: number, Gold?: number, Copper?: number, Stone?: number, Wood?: number }
 * const { data:entry } = await StandardDataStoresApi_V2.createStandardDataStoreEntry<InventorySchema>({
     universeId: 5097539509, dataStore: "InventoryStore", entryId: "users/45348281", value: { Iron: 50 }, users: [ 45348281 ]
   })
 * @exampleData {"path":"universes/5097539509/data-stores/InventoryStore/entries/users:45348281","createTime":"2024-07-22T19:06:55.829Z","revisionId":"08DCAA81744A406E.0000000001.08DCAA81744A406E.01","revisionCreateTime":"2024-07-22T19:06:55.829Z","state":"ACTIVE","etag":"08DCAA81744A406E.0000000001.08DCAA81744A406E.01","value":{"Iron":50},"id":"users:45348281","users":["users/45348281"],"attributes":{}}
 * @exampleRawBody {"path":"universes/5097539509/data-stores/InventoryStore/entries/users:45348281","createTime":"2024-07-22T19:06:55.829412600Z","revisionId":"08DCAA81744A406E.0000000001.08DCAA81744A406E.01","revisionCreateTime":"2024-07-22T19:06:55.829412600Z","state":"ACTIVE","etag":"08DCAA81744A406E.0000000001.08DCAA81744A406E.01","value":{"Iron":50},"id":"users:45348281","users":["users/45348281"],"attributes":{}}
 */
export const createStandardDataStoreEntry = createApiMethod(async <Schema extends Record<any, any> | any[] | null | boolean | string | number>(
  { universeId, dataStore, scope, entryId, value, users, attributes }:
  {
    universeId: Identifier, dataStore: string, scope?: string, entryId: string,
    value: Schema, users?: ArrayNonEmptyIfConst<Identifier>, attributes?: Record<any, any>
  }
): ApiMethod<RawFullDatastoreData<Schema>, PrettifiedFullDatastoreData<Schema>> => ({
  method: "POST",
  path: (
    scope ? `/v2/universes/${universeId}/data-stores/${dataStore}/scopes/${scope}/entries`
    : `/v2/universes/${universeId}/data-stores/${dataStore}/entries`
  ),
  searchParams: { id: entryId.replaceAll("/", ":") },
  body: { value, users: users?.map(user => `users/${user.toString()}`), attributes },
  name: `createStandardDataStoreEntry`,

  formatRawDataFn: rawData => cloneAndMutateObject(rawData, obj => {
    obj.createTime = new Date(obj.createTime)
    obj.revisionCreateTime = new Date(obj.revisionCreateTime)
  })
}))



/**
 * Gets an entry from a standard datastore.
 * @endpoint
 * GET /v2/universes/{universe}/data-stores/{data-store}/entries/{entryId}
 * GET /v2/universes/{universe}/data-stores/{data-store}/scopes/{scope}/entries/{entryId}
 * 
 * @param universeId The ID of the universe to get the entry in.
 * @param dataStore the name of the datastore to get the entry in.
 * @param scope The optional scope of the dataStore.
 * @param entryId The ID (key / name) of the entry.
 * 
 * @example
 * type InventorySchema = { Iron?: number, Gold?: number, Copper?: number, Stone?: number, Wood?: number }
   const { data, response:{body} } = await StandardDataStoresApi_V2.standardDataStoreEntry<InventorySchema>({
     universeId: 5097539509, dataStore: "InventoryStore", entryId: "users/45348281"
   })
 * @exampleData
 * @exampleRawBody
 */
export const standardDataStoreEntry = createApiMethod(async <Schema extends Record<any, any>>(
  { universeId, dataStore, scope, entryId, revisionId }:
  { universeId: Identifier, dataStore: string, scope?: string, entryId: string, revisionId?: string }
): ApiMethod<RawFullDatastoreData<Schema>, PrettifiedFullDatastoreData<Schema>> => ({
  method: "GET",
  path: (
    scope ? `/v2/universes/${universeId}/data-stores/${dataStore}/scopes/${scope}/entries/${entryId.replaceAll("/", ":")}${revisionId ? `@${revisionId}` : "@latest"}`
    : `/v2/universes/${universeId}/data-stores/${dataStore}/entries/${entryId.replaceAll("/", ":")}${revisionId ? `@${revisionId}` : "@latest"}`
  ),
  name: `standardDataStoreEntry`,

  formatRawDataFn: rawData => cloneAndMutateObject(rawData, obj => {
    obj.createTime = new Date(obj.createTime)
    obj.revisionCreateTime = new Date(obj.revisionCreateTime)
  })
}))


/**
 * Deletes an entry from a standard datastore.
 * @endpoint
 * DELETE /v2/universes/{universe}/data-stores/{data-store}/entries/{entryId}
 * DELETE /v2/universes/{universe}/data-stores/{data-store}/scopes/{scope}/entries/{entryId}
 * 
 * @param universeId The ID of the universe to delete the entry in.
 * @param dataStore the name of the datastore to delete the entry in.
 * @param scope The optional scope of the dataStore.
 * @param entryId The ID (key / name) of the entry.
 * 
 * @example
 * const { data:success } = await StandardDataStoresApi_V2.deleteStandardDataStoreEntry({
     universeId: 5097539509, dataStore: "InventoryStore", entryId: "users/45348281"
   })
 * @exampleData true
 * @exampleRawBody {}
 */
export const deleteStandardDataStoreEntry = createApiMethod(async (
  { universeId, dataStore, scope, entryId }:
  { universeId: Identifier, dataStore: string, scope?: string, entryId: string }
): ApiMethod<{}, boolean> => ({
  method: "DELETE",
  path: (
    scope ? `/v2/universes/${universeId}/data-stores/${dataStore}/scopes/${scope}/entries/${entryId.replaceAll("/", ":")}`
    : `/v2/universes/${universeId}/data-stores/${dataStore}/entries/${entryId.replaceAll("/", ":")}`
  ),
  name: `deleteStandardDataStoreEntry`,

  formatRawDataFn: dataIsSuccess
}))


/**
 * Updates an entry in a standard datastore.
 * @endpoint
 * PATCH /v2/universes/{universe}/data-stores/{data-store}/entries/{entryId}
 * PATCH /v2/universes/{universe}/data-stores/{data-store}/scopes/{scope}/entries/{entryId}
 * 
 * @param universeId The ID of the universe to update an entry in.
 * @param dataStore the name of the datastore to update an entry in.
 * @param scope The optional scope of the dataStore.
 * @param entryId The ID (key / name) of the entry.
 * @param allowMissing If set to true, and the data store entry is not found, a data store entry is created.
 * @param value The value (content) of the entry.
 * @param users Array metadata containing the IDs of the users this entry is affiliated with.
 * @param attributes Key-Value Pairs metadata containing arbitrary data.
 * 
 * @example
 * type InventorySchema = { Iron?: number, Gold?: number, Copper?: number, Stone?: number, Wood?: number }
   const { data, response:{body} } = await StandardDataStoresApi_V2.updateStandardDataStoreEntry<InventorySchema>({
      universeId: 5097539509, dataStore: "InventoryStore", entryId: "users/453482811", value: { Iron: 50, Gold: 26 }, users: [ 45348281 ]
   })
 * @exampleData {"path":"universes/5097539509/data-stores/InventoryStore/entries/users:453482811","createTime":"2024-07-22T19:02:27.811Z","revisionId":"08DCAA80D489FD52.0000000003.08DCAA8627CF76E1.01","revisionCreateTime":"2024-07-22T19:02:27.811Z","state":"ACTIVE","etag":"08DCAA80D489FD52.0000000003.08DCAA8627CF76E1.01","value":{"Iron":50,"Gold":26},"id":"users:453482811","users":["users/45348281"],"attributes":{}}
 * @exampleRawBody {"path":"universes/5097539509/data-stores/InventoryStore/entries/users:453482811","createTime":"2024-07-22T19:02:27.811669Z","revisionId":"08DCAA80D489FD52.0000000003.08DCAA8627CF76E1.01","revisionCreateTime":"2024-07-22T19:40:35.001520100Z","state":"ACTIVE","etag":"08DCAA80D489FD52.0000000003.08DCAA8627CF76E1.01","value":{"Iron":50,"Gold":26},"id":"users:453482811","users":["users/45348281"],"attributes":{}}
 */
export const updateStandardDataStoreEntry = createApiMethod(async <Schema extends Record<any, any>>(
  { universeId, dataStore, scope, entryId, value, allowMissing, users, attributes }:
  {
    universeId: Identifier, dataStore: string, scope?: string, entryId: string,
    value: Schema, allowMissing: boolean, users?: ArrayNonEmptyIfConst<Identifier>, attributes?: Record<any, any>
  }
): ApiMethod<RawFullDatastoreData<Schema>, PrettifiedFullDatastoreData<Schema>> => ({
  method: "PATCH",
  path: (
    scope ? `/v2/universes/${universeId}/data-stores/${dataStore}/scopes/${scope}/entries/${entryId.replaceAll("/", ":")}`
    : `/v2/universes/${universeId}/data-stores/${dataStore}/entries/${entryId.replaceAll("/", ":")}`
  ),
  searchParams: { allowMissing },
  body: { value, users: users?.map(user => `users/${user.toString()}`), attributes },
  name: `updateStandardDataStoreEntry`,

  formatRawDataFn: rawData => cloneAndMutateObject(rawData, obj => {
    obj.createTime = new Date(obj.createTime)
    obj.revisionCreateTime = new Date(obj.revisionCreateTime)
  })
}))


/**
 * Increments an entry in a standard datastore.
 * @endpoint
 * POST /v2/universes/{universe}/data-stores/{data-store}/entries/{entryId}:increment
 * POST /v2/universes/{universe}/data-stores/{data-store}/scopes/{scope}/entries/{entryId}:increment
 * 
 * @param universeId The ID of the universe to increment an entry in.
 * @param dataStore the name of the datastore to increment an entry in.
 * @param scope The optional scope of the dataStore.
 * @param entryId The ID (key / name) of the entry.
 * @param value The value (content) of the entry.
 * @param users Array metadata containing the IDs of the users this entry is affiliated with.
 * @param attributes Key-Value Pairs metadata containing arbitrary data.
 * 
 * @example
 * const { data:entry } = await StandardDataStoresApi_V2.incrementStandardDatastoreEntry({
     universeId: 5097539509, dataStore: "Deaths", entryId: "users/45348281", amount: 3, users: [ 45348281 ]
   })
 * @exampleData {"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281","createTime":"2024-07-22T19:46:42.453Z","revisionId":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","revisionCreateTime":"2024-07-22T19:46:42.453Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","value":9,"id":"users:45348281","users":["users/45348281"],"attributes":{}}
 * @exampleRawBody {"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281","createTime":"2024-07-22T19:46:42.453649200Z","revisionId":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","revisionCreateTime":"2024-07-22T19:50:08.205250100Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","value":9,"id":"users:45348281","users":["users/45348281"],"attributes":{}}
 */
export const incrementStandardDatastoreEntry = createApiMethod(async (
  { universeId, dataStore, scope, entryId, amount, users, attributes }:
  {
    universeId: Identifier, dataStore: string, scope?: string, entryId: string,
    amount: number, users?: ArrayNonEmptyIfConst<Identifier>, attributes?: Record<any, any>
  }
): ApiMethod<RawFullDatastoreData<number>, PrettifiedFullDatastoreData<number>> => ({
  method: "POST",
  path: (
    scope ? `/v2/universes/${universeId}/data-stores/${dataStore}/scopes/${scope}/entries/${entryId.replaceAll("/", ":")}:increment`
    : `/v2/universes/${universeId}/data-stores/${dataStore}/entries/${entryId.replaceAll("/", ":")}:increment`
  ),
  body: { amount, users: users?.map(user => `users/${user.toString()}`), attributes },
  name: `incrementStandardDatastoreEntry`,

  formatRawDataFn: rawData => cloneAndMutateObject(rawData, obj => {
    obj.createTime = new Date(obj.createTime)
    obj.revisionCreateTime = new Date(obj.revisionCreateTime)
  })
}))


/**
 * Lists revisions for a standard datastores entries.
 * @endpoint
 * GET /v2/universes/{universe}/data-stores/{data-store}/entries/{entryId}:listRevisions
 * GET /v2/universes/{universe}/data-stores/{data-store}/scopes/{scope}/entries/{entryId}:listRevisions
 * 
 * @param universeId The ID of the universe to get data store entry revisions for.
 * @param dataStore The name of the data store to get entry revisions for,
 * @param scope The optional scope for the dataStore.
 * @param entryId The ID (key / name) for the entry.
 * @param createdBefore Only include revisions made before (inclusive), this filter is combined with createdAfter.
 * @param createdAfter Only include revisions made after (inclusive), this filter is combined with createdBefore.
 * @param limit The service might return fewer than the maximum number of revisions. If unspecified, at most 10 revisions are returned. The maximum value is 100 values and higher values are set to 100.
 * @param cursor The paging cursor for the previous or next page.
 * 
 * @example
 * const { data:entries } = await StandardDataStoresApi_V2.listStandardDataStoreEntryRevisions({
     universeId: 5097539509, dataStore: "Deaths", entryId: "users/45348281"
   })
 * @exampleData [{"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281@08DCAA8702D435AC.0000000003.08DCAA877D776995.01","createTime":"2024-07-22T19:46:42.453Z","revisionId":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","revisionCreateTime":"2024-07-22T19:46:42.453Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","id":"users:45348281@08DCAA8702D435AC.0000000003.08DCAA877D776995.01"},{"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281@08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01","createTime":"2024-07-22T19:46:42.453Z","revisionId":"08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01","revisionCreateTime":"2024-07-22T19:46:42.453Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01","id":"users:45348281@08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01"},{"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281@08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01","createTime":"2024-07-22T19:46:42.453Z","revisionId":"08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01","revisionCreateTime":"2024-07-22T19:46:42.453Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01","id":"users:45348281@08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01"}]
 * @exampleRawBody {"dataStoreEntries":[{"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281@08DCAA8702D435AC.0000000003.08DCAA877D776995.01","createTime":"2024-07-22T19:46:42.453649200Z","revisionId":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","revisionCreateTime":"2024-07-22T19:50:08.205250100Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000003.08DCAA877D776995.01","id":"users:45348281@08DCAA8702D435AC.0000000003.08DCAA877D776995.01"},{"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281@08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01","createTime":"2024-07-22T19:46:42.453649200Z","revisionId":"08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01","revisionCreateTime":"2024-07-22T19:49:30.797636Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01","id":"users:45348281@08DCAA8702D435AC.0000000002.08DCAA87672B76A8.01"},{"path":"universes/5097539509/data-stores/Deaths/entries/users:45348281@08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01","createTime":"2024-07-22T19:46:42.453649200Z","revisionId":"08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01","revisionCreateTime":"2024-07-22T19:46:42.453649200Z","state":"ACTIVE","etag":"08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01","id":"users:45348281@08DCAA8702D435AC.0000000001.08DCAA8702D435AC.01"}],"nextPageToken":"eyJpbmxpbmVWZXJzaW9uIjpmYWxzZSwibGFzdFZlcnNpb24iOiIwOERDQUE4NzAyRDQzNUFDLjAwMDAwMDAwMDEuMDhEQ0FBODcwMkQ0MzVBQy4wMSIsIkN1cnNvclZlcnNpb24iOjF9"}
 */
export const listStandardDataStoreEntryRevisions = createApiMethod(async <
  UniverseId extends Identifier, DataStore extends string, Scope extends string, EntryId extends string
>(
  { universeId, dataStore, scope, entryId, createdBefore, createdAfter, limit, cursor }:
  {
    universeId: UniverseId, dataStore: DataStore, scope?: Scope, entryId: EntryId,
    createdBefore?: ISODateTime | Date, createdAfter?: ISODateTime | Date, limit?: number, cursor?: string
  }
): ApiMethod<
  RawListStandardDataStoreEntryRevisionsData<UniverseId, DataStore, Scope, EntryId>,
  PrettifiedListStandardDataStoreEntryRevisionsData<UniverseId, DataStore, Scope, EntryId>
> => ({
  method: "GET",
  path: (
    scope ? `/v2/universes/${universeId}/data-stores/${dataStore}/scopes/${scope}/entries/${entryId.replaceAll("/", ":")}:listRevisions`
    : `/v2/universes/${universeId}/data-stores/${dataStore}/entries/${entryId.replaceAll("/", ":")}:listRevisions`
  ),
  searchParams: { filter: formatRevisionCreateTimeClamp(createdBefore, createdAfter), maxPageSize: limit, pageToken: cursor },
  name: `listStandardDataStoreEntryRevisions`,

  formatRawDataFn: ({ dataStoreEntries }) => dataStoreEntries.map(
    entry => cloneAndMutateObject(entry, obj => {
      obj.createTime = new Date(obj.createTime)
      obj.revisionCreateTime = new Date(obj.revisionCreateTime)
    })
  ),

  getCursorsFn: rawData => [ null, rawData.nextPageToken ]
}))