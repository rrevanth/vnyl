/**
 * Shared UI Component Library
 *
 * Atomic Design System for VNYL detail screens following Apple TV+ design language.
 *
 * ## Structure
 * - **Atoms**: Basic UI elements (MetadataChip, ServiceBadge, ActionButton, ProgressIndicator)
 * - **Molecules**: Component combinations (PosterCard, ExpandableText, LoadMoreCard, SectionHeader)
 * - **Organisms**: Complex components (DetailHeroSection, DetailInfoSection, ContentGrid)
 * - **Templates**: Layout structures (DetailScreenTemplate)
 *
 * ## Usage
 * Import specific components:
 * ```tsx
 * import { MetadataChip, ActionButton } from '@/src/presentation/shared/components/atoms'
 * import { PosterCard, ExpandableText } from '@/src/presentation/shared/components/molecules'
 * import { DetailHeroSection } from '@/src/presentation/shared/components/organisms'
 * import { DetailScreenTemplate } from '@/src/presentation/shared/components/templates'
 * ```
 *
 * Or import everything:
 * ```tsx
 * import {
 *   MetadataChip,
 *   ActionButton,
 *   PosterCard,
 *   DetailHeroSection,
 *   DetailScreenTemplate
 * } from '@/src/presentation/shared/components'
 * ```
 */

// Re-export all atoms
export * from './atoms'

// Re-export all molecules
export * from './molecules'

// Re-export all organisms
export * from './organisms'

// Re-export all templates
export * from './templates'