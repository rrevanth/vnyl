  ⎿  Final Plan: Unified Media & Person Support with Flexible Provider Interfaces

     Based on my investigation, PersonCatalogItem already exists and extends CatalogItem perfectly! This means:
     - Person entities already have external IDs
     - They can use enrichedData just like movies/TV
     - They can appear in catalogs (TMDB has getPopular for people)
     - Everything is already unified!

     1. Extend ProviderCapability Enum

     // src/domain/entities/context/content-context.entity.ts
     export enum ProviderCapability {
       // Existing...
       EXTERNAL_IDS = 'external_ids',
       SEASONS_EPISODES = 'seasons_episodes',
       SEARCH = 'search'  // NEW: Add search capability
       // Skip STREAMS for now as requested
     }

     2. Provider Interfaces - Simplified & Flexible

     IExternalIdsProvider

     export interface IExternalIdsProvider extends IProvider {
       /**
        * Get external IDs using full catalog item context
        * Works for movies, TV, AND persons
        */
       getExternalIds(item: CatalogItem): Promise<ExternalIds>
       getBulkExternalIds(items: CatalogItem[]): Promise<Map<string, ExternalIds>>
     }

     ISearchProvider

     export interface ISearchProvider extends IProvider {
       /**
        * Search returns regular Catalogs with mixed content
        * Can contain movies, TV shows, AND persons
        */
       search(query: string, options?: SearchOptions): Promise<Catalog[]>
     }

     export interface SearchOptions {
       mediaTypes?: MediaType[]  // Filter by [MOVIE, TV_SERIES, PERSON]
       page?: number
       limit?: number
     }

     ISeasonsEpisodesProvider

     export interface SeasonsResult {
       seasons: SeasonWithEpisodes[]  // All seasons with all episodes
       totalSeasons: number
       totalEpisodes: number
       currentSeason?: number
       nextEpisode?: Episode
     }

     export interface ISeasonsEpisodesProvider extends IProvider {
       /**
        * Get all seasons with all episodes in one call
        */
       getSeasonsWithEpisodes(item: CatalogItem): Promise<SeasonsResult>
     }

     IPeopleProvider

     export interface PeopleCatalog extends Catalog {
       // Just extends regular Catalog
       // items are PersonCatalogItem[] for cast/crew
     }

     export interface IPeopleProvider extends IProvider {
       /**
        * Returns organized catalogs of people (cast, crew, etc.)
        * Each catalog has PersonCatalogItems
        */
       getPeople(item: CatalogItem): Promise<Catalog[]>
     }

     IRecommendationsProvider

     export interface IRecommendationsProvider extends IProvider {
       /**
        * Returns regular Catalogs (not a new type!)
        * Each catalog is "Recommended", "Similar", etc.
        */
       getRecommendations(item: CatalogItem): Promise<Catalog[]>
     }

     3. TMDB Provider Implementation - Unified Approach

     // src/infrastructure/providers/tmdb/tmdb-provider.ts
     export class TMDBProvider implements 
       ICatalogProvider,
       IMetadataProvider,
       IExternalIdsProvider,
       ISearchProvider,
       ISeasonsEpisodesProvider,
       IPeopleProvider,
       IRecommendationsProvider {
       
       capabilities = [
         ProviderCapability.CATALOG,
         ProviderCapability.METADATA,
         ProviderCapability.EXTERNAL_IDS,
         ProviderCapability.SEARCH,
         ProviderCapability.SEASONS_EPISODES,
         ProviderCapability.PEOPLE,
         ProviderCapability.RECOMMENDATIONS
       ]
       
       // CATALOG - Now includes popular people!
       async getAllCatalogs(): Promise<Catalog[]> {
         const catalogs: Catalog[] = []
         
         // Movie catalogs
         const popularMovies = await this.tmdbService.client.movies.getPopular()
         catalogs.push(this.mapToCatalog(popularMovies, 'popular_movies', MediaType.MOVIE))
         
         // TV catalogs  
         const popularTV = await this.tmdbService.client.tv.getPopular()
         catalogs.push(this.mapToCatalog(popularTV, 'popular_tv', MediaType.TV_SERIES))
         
         // PERSON catalogs!
         const popularPeople = await this.tmdbService.client.people.getPopular()
         catalogs.push({
           id: 'popular_people',
           name: 'Popular People',
           mediaType: MediaType.PERSON,
           items: popularPeople.results.map(p => this.mapToPersonCatalogItem(p)),
           pagination: {
             page: popularPeople.page,
             totalPages: popularPeople.total_pages,
             totalItems: popularPeople.total_results,
             hasMore: popularPeople.page < popularPeople.total_pages
           },
           catalogContext: this.createCatalogContext('popular_people', MediaType.PERSON)
         })
         
         return catalogs
       }
       
       // EXTERNAL IDS - Works for all types including Person
       async getExternalIds(item: CatalogItem): Promise<ExternalIds> {
         const tmdbId = item.externalIds.tmdb || this.extractTmdbId(item.id)
         
         if (item.mediaType === MediaType.PERSON) {
           // Person external IDs
           const person = await this.tmdbService.client.people.getExternalIds(tmdbId)
           return {
             tmdb: tmdbId,
             imdb: person.imdb_id,
             facebook: person.facebook_id,
             instagram: person.instagram_id,
             twitter: person.twitter_id,
             // ... other person external IDs
           }
         } else if (item.mediaType === MediaType.MOVIE) {
           const movie = await this.tmdbService.client.movies.getExternalIds(tmdbId)
           return this.normalizeExternalIds(movie)
         } else {
           const tv = await this.tmdbService.client.tv.getExternalIds(tmdbId)
           return this.normalizeExternalIds(tv)
         }
       }
       
       // SEARCH - Returns regular Catalogs with mixed content
       async search(query: string, options?: SearchOptions): Promise<Catalog[]> {
         const catalogs: Catalog[] = []
         
         if (!options?.mediaTypes || options.mediaTypes.includes(MediaType.MOVIE)) {
           const movies = await this.tmdbService.client.search.searchMovies(query)
           if (movies.results.length > 0) {
             catalogs.push({
               id: 'search_movies',
               name: 'Movies',
               mediaType: MediaType.MOVIE,
               items: movies.results.map(m => this.mapToMovieCatalogItem(m)),
               pagination: this.mapPagination(movies)
             })
           }
         }
         
         if (!options?.mediaTypes || options.mediaTypes.includes(MediaType.TV_SERIES)) {
           const tv = await this.tmdbService.client.search.searchTV(query)
           if (tv.results.length > 0) {
             catalogs.push({
               id: 'search_tv',
               name: 'TV Shows',
               mediaType: MediaType.TV_SERIES,
               items: tv.results.map(t => this.mapToTVCatalogItem(t)),
               pagination: this.mapPagination(tv)
             })
           }
         }
         
         if (!options?.mediaTypes || options.mediaTypes.includes(MediaType.PERSON)) {
           const people = await this.tmdbService.client.search.searchPeople(query)
           if (people.results.length > 0) {
             catalogs.push({
               id: 'search_people',
               name: 'People',
               mediaType: MediaType.PERSON,
               items: people.results.map(p => this.mapToPersonCatalogItem(p)),
               pagination: this.mapPagination(people)
             })
           }
         }
         
         return catalogs
       }
       
       // PEOPLE - Returns regular Catalogs with PersonCatalogItems
       async getPeople(item: CatalogItem): Promise<Catalog[]> {
         const tmdbId = item.externalIds.tmdb || this.extractTmdbId(item.id)
         const credits = item.mediaType === MediaType.MOVIE
           ? await this.tmdbService.client.movies.getCredits(tmdbId)
           : await this.tmdbService.client.tv.getCredits(tmdbId)
         
         const catalogs: Catalog[] = []
         
         // Cast catalog
         if (credits.cast?.length > 0) {
           catalogs.push({
             id: 'cast',
             name: 'Cast',
             mediaType: MediaType.PERSON,
             items: credits.cast.map(c => this.mapCastToPersonCatalogItem(c)),
             pagination: { page: 1, totalPages: 1, totalItems: credits.cast.length, hasMore: false },
             catalogContext: this.createCatalogContext('cast', MediaType.PERSON)
           })
         }
         
         // Directors catalog
         const directors = credits.crew?.filter(c => c.job === 'Director') || []
         if (directors.length > 0) {
           catalogs.push({
             id: 'directors',
             name: 'Directors',
             mediaType: MediaType.PERSON,
             items: directors.map(d => this.mapCrewToPersonCatalogItem(d)),
             pagination: { page: 1, totalPages: 1, totalItems: directors.length, hasMore: false },
             catalogContext: this.createCatalogContext('directors', MediaType.PERSON)
           })
         }
         
         return catalogs
       }
       
       // RECOMMENDATIONS - Returns regular Catalogs!
       async getRecommendations(item: CatalogItem): Promise<Catalog[]> {
         const tmdbId = item.externalIds.tmdb || this.extractTmdbId(item.id)
         const catalogs: Catalog[] = []
         
         // Get recommendations
         const recommendations = item.mediaType === MediaType.MOVIE
           ? await this.tmdbService.client.movies.getRecommendations(tmdbId)
           : await this.tmdbService.client.tv.getRecommendations(tmdbId)
         
         if (recommendations.results.length > 0) {
           catalogs.push({
             id: 'recommendations',
             name: 'Recommended',
             mediaType: item.mediaType,
             items: recommendations.results.map(r => 
               item.mediaType === MediaType.MOVIE 
                 ? this.mapToMovieCatalogItem(r)
                 : this.mapToTVCatalogItem(r)
             ),
             pagination: this.mapPagination(recommendations),
             catalogContext: this.createCatalogContext('recommendations', item.mediaType)
           })
         }
         
         // Get similar
         const similar = item.mediaType === MediaType.MOVIE
           ? await this.tmdbService.client.movies.getSimilar(tmdbId)
           : await this.tmdbService.client.tv.getSimilar(tmdbId)
         
         if (similar.results.length > 0) {
           catalogs.push({
             id: 'similar',
             name: 'Similar',
             mediaType: item.mediaType,
             items: similar.results.map(s => 
               item.mediaType === MediaType.MOVIE 
                 ? this.mapToMovieCatalogItem(s)
                 : this.mapToTVCatalogItem(s)
             ),
             pagination: this.mapPagination(similar),
             catalogContext: this.createCatalogContext('similar', item.mediaType)
           })
         }
         
         return catalogs
       }
       
       // Helper to map to PersonCatalogItem
       private mapToPersonCatalogItem(person: any): PersonCatalogItem {
         return {
           id: CatalogItemUtils.createCatalogItemId(MediaType.PERSON, person.id, 'tmdb'),
           mediaType: MediaType.PERSON,
           title: person.name,
           originalTitle: person.name,
           profileUrl: this.getImageUrl(person.profile_path),
           knownForDepartment: person.known_for_department,
           gender: person.gender,
           knownFor: person.known_for?.map(k => ({
             id: k.id,
             mediaType: k.media_type === 'movie' ? MediaType.MOVIE : MediaType.TV_SERIES,
             title: k.title || k.name,
             posterUrl: this.getImageUrl(k.poster_path),
             voteAverage: k.vote_average
           })),
           popularity: person.popularity,
           externalIds: { tmdb: person.id },
           hasDetailedInfo: false,
           contentContext: this.createContentContext(MediaType.PERSON, person.id),
           originalMediaType: 'person',
           createdAt: new Date(),
           updatedAt: new Date()
         }
       }
     }

     4. Media Detail Screen - Works for Person Too!

     // src/presentation/features/media-detail/MediaDetailScreen.tsx
     export const MediaDetailScreen = observer(() => {
       const { enrichedItem } = useMediaDetail()
       
       // Works for Person details too!
       if (enrichedItem.mediaType === MediaType.PERSON) {
         return <PersonDetailScreen person={enrichedItem as PersonCatalogItem} />
       }
       
       // Get recommendations - they're just regular Catalogs
       const recommendationCatalogs = EnrichedDataUtils.getEnrichment(
         enrichedItem.enrichedData!,
         ProviderCapability.RECOMMENDATIONS
       )?.data as Catalog[]
       
       // Get people - they're regular Catalogs with PersonCatalogItems
       const peopleCatalogs = EnrichedDataUtils.getEnrichment(
         enrichedItem.enrichedData!,
         ProviderCapability.PEOPLE
       )?.data as Catalog[]
       
       return (
         <ScrollView>
           <MediaHero item={enrichedItem} />
           
           {/* People sections - just regular catalog rows */}
           {peopleCatalogs?.map(catalog => (
             <CatalogRow
               key={catalog.id}
               catalog={catalog}
               onItemPress={handlePersonPress}  // Navigate to person detail
             />
           ))}
           
           {/* Recommendations - also regular catalog rows */}
           {recommendationCatalogs?.map(catalog => (
             <CatalogRow
               key={catalog.id}
               catalog={catalog}
               onItemPress={handleMediaPress}
               onLoadMore={handleLoadMore}
             />
           ))}
         </ScrollView>
       )
     })

     Key Insights & Benefits:

     1. PersonCatalogItem Already Exists! - No changes needed, it already extends CatalogItem perfectly
     2. Everything is Unified - Person, Movie, TV all use same CatalogItem base with enrichedData
     3. Reuse Catalog Everywhere - Recommendations, People, Search all return regular Catalog entities
     4. No New Types Needed - No RecommendationsCatalog or PeopleCatalog, just use Catalog
     5. Flexible Provider Support - Same interfaces work for TMDB, Stremio, any future provider
     6. External IDs for All - Movies, TV, and Persons all have external IDs
     7. Popular People Catalogs - Can show trending actors/directors in home screen
     8. Search Everything - Unified search returns catalogs of movies, TV, and people

     This design maximizes reuse of existing entities while supporting all the capabilities you need!
