/**
 * English translations export
 * Combines all English translation namespaces
 */

import { common } from './common'

// Simplified English translations - other modules can be added later
const home = {
  hero: {
    title: "Welcome to VNYL",
    subtitle: "Stream thousands of movies and TV shows"
  }
}

const search = {
  placeholder: "Search movies, shows, and people",
  no_results: "No results found"
}

const media_detail = {
  actions: {
    play: "Play",
    download: "Download"
  },
  metadata: {
    rating: "Rating",
    duration: "Duration"
  }
}

const player = {
  controls: {
    play: "Play",
    pause: "Pause",
    fullscreen: "Fullscreen"
  }
}

const settings = {
  theme: {
    title: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System"
  },
  display: {
    title: "Display",
    font_size: "Font Size",
    high_contrast: "High Contrast"
  }
}

const library = {
  title: "Library",
  empty: "Your library is empty"
}

const person_detail = {
  filmography: "Filmography",
  biography: "Biography"
}

const stream_selection = {
  title: "Select Stream",
  quality: "Quality",
  source: "Source"
}

export const en = {
  common,
  home,
  search,
  library,
  settings,
  media_detail,
  person_detail,
  stream_selection,
  player,
} as const

export default en