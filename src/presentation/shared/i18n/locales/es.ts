import type { TranslationKey } from '@/src/presentation/shared/i18n/types'

export const es: TranslationKey = {
  common: {
    loading: 'Cargando...',
    loading_more: 'Cargando más...',
    load_more: 'Cargar Más',
    error: 'Error',
    success: 'Éxito',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    done: 'Listo',
    close: 'Cerrar',
    ok: 'OK',
    go_back: 'Volver',
  },

  navigation: {
    home: 'Inicio',
    search: 'Buscar',
    library: 'Biblioteca',
    settings: 'Configuración'
  },

  home: {
    welcome: 'Bienvenido a VNYL',
    discover_content: 'Descubre películas y series increíbles',
    providers_active: '{{count}} de {{total}} proveedores activos',
    total_items: '{{count}} elementos disponibles',
    top_ten: 'Top 10',
    top_ten_description: 'Contenido más popular de todos los proveedores',
    award_winners: 'Ganadores de Premios',
    award_winners_description: 'Películas y series aclamadas por la crítica',
    no_catalogs: 'No Hay Contenido Disponible',
    no_catalogs_description: 'Configura tus proveedores en ajustes para descubrir contenido',
    error: 'No se Pudo Cargar el Contenido',
    generic_error: 'Algo salió mal al cargar el contenido'
  },

  catalog: {
    item_count: '{{count}} elementos',
    last_updated: 'Actualizado {{date}}',
    see_all: 'Ver Todo',
    load_more_items: 'Cargar más elementos',
    show_more: 'Mostrar {{count}} más',
    loading_more: 'Cargando más elementos...'
  },

  settings: {
    title: 'Configuración',
    theme: {
      title: 'Tema',
      description: 'Personalizar apariencia',
      dark_mode: 'Modo Oscuro',
      light_mode: 'Modo Claro',
      system_mode: 'Sistema',
      accent_color: 'Color de Acento',
      high_contrast: 'Alto Contraste',
      adapt_to_content: 'Adaptar al Contenido',
      appearance: 'Apariencia',
      appearance_description: 'Elige cómo se ve la app',
      accent_color_description: 'Selecciona tu color de acento preferido',
      preview: 'Vista Previa',
      preview_description: 'Ve cómo se ven tus elecciones de tema',
      preview_title: 'Título de Ejemplo',
      preview_subtitle: 'Texto de subtítulo de ejemplo',
      preview_body: 'Así es como aparecerá el texto regular con tu configuración de tema actual.',
      preview_button: 'Botón de Acción'
    },
    language: {
      title: 'Idioma',
      english: 'Inglés',
      spanish: 'Español'
    },
    locale: {
      title: 'Idioma y Región',
      description: 'Idioma y formato',
      language: 'Idioma',
      region: 'Región',
      date_format: 'Formato de Fecha',
      time_format: 'Formato de Hora',
      currency: 'Moneda'
    },
    display: {
      title: 'Pantalla',
      description: 'Tipografía y diseño',
      font_size: 'Tamaño de Fuente',
      font_family: 'Familia de Fuente',
      line_height: 'Altura de Línea',
      line_height_description: 'Ajustar espaciado entre líneas de texto',
      compact_mode: 'Modo Compacto',
      compact_mode_description: 'Reducir espaciado para un diseño más denso',
      animation_scale: 'Escala de Animación',
      typography: 'Tipografía',
      typography_description: 'Personalizar apariencia del texto',
      layout: 'Diseño',
      spacing: 'Espaciado',
      spacing_description: 'Controlar densidad y espaciado del diseño',
      preview: 'Vista Previa',
      preview_description: 'Ve cómo se ven tus elecciones de tipografía',
      preview_heading: 'Texto de Encabezado de Ejemplo',
      preview_body: 'Así es como aparecerá el texto regular de párrafo con tu configuración de pantalla actual. Puedes ajustar el tamaño de fuente, altura de línea y espaciado para que sea más cómodo de leer.',
      preview_caption: 'Este es el texto de leyenda más pequeño que aparece en varios lugares de la app.'
    },
    providers: {
      title: 'Proveedores',
      description: 'Configurar servicios API',
      status: {
        configured: 'Configurado',
        notConfigured: 'No Configurado'
      },
      sections: {
        database: 'Base de Datos',
        streaming: 'Transmisión',
        tracking: 'Seguimiento',
        info: 'Información'
      },
      info: {
        title: 'Información',
        description: 'Información y documentación de proveedores'
      },
      tmdb: {
        title: 'The Movie Database (TMDB)',
        description: 'Configurar ajustes de la API de TMDB',
        status: {
          connected_bearer_token: 'Conectado con Token Bearer Personalizado',
          connected_api_key: 'Conectado con Clave API Personalizada', 
          connected_default: 'Conectado con Clave API Predeterminada',
          hierarchy_description: 'Orden de prioridad de claves API (mayor prioridad se usa):',
          custom_bearer_token: 'Token Bearer Personalizado (mayor prioridad)',
          custom_api_key: 'Clave API Personalizada (prioridad media)',
          default_api_key: 'Clave API Predeterminada (menor prioridad)'
        },
        authentication: 'Autenticación',
        authentication_description: 'Credenciales de API para acceso a TMDB',
        api_key: 'Clave API',
        api_key_description: 'Tu clave API de TMDB para autenticación',
        api_key_placeholder: 'Ingresa tu clave API de TMDB',
        bearer_token: 'Token Bearer',
        bearer_token_description: 'Token Bearer para autenticación mejorada (recomendado)',
        bearer_token_placeholder: 'Ingresa tu token Bearer de TMDB',
        regional_settings: 'Configuración Regional',
        regional_description: 'Preferencias de idioma y ubicación',
        preferences: 'Preferencias',
        preferences_description: 'Preferencias de contenido y regionales',
        content_settings: 'Contenido y Medios',
        content_description: 'Calidad de imagen y filtrado de contenido',
        language: 'Idioma',
        language_description: 'Idioma preferido para datos de películas y series de TV',
        language_placeholder: 'Seleccionar idioma',
        country: 'País',
        country_description: 'Tu país para filtrado de contenido regional',
        country_placeholder: 'Seleccionar país',
        region: 'Región',
        region_description: 'Configuración regional para disponibilidad de contenido',
        include_adult: 'Incluir Contenido Adulto',
        include_adult_description: 'Incluir contenido adulto en resultados de búsqueda y recomendaciones',
        image_quality: 'Calidad de Imagen',
        image_quality_description: 'Calidad de imágenes (pósters, fondos, etc.)',
        image_quality_placeholder: 'Seleccionar calidad de imagen',
        save_settings: 'Guardar Configuración',
        reset_settings: 'Restablecer a Predeterminados',
        test_connection: 'Probar Conexión',
        validate_connection: 'Validar Conexión',
        validate_and_save: 'Validar y Guardar',
        setup_guide: 'Guía de Configuración',
        setup_guide_description: 'Cómo obtener tus credenciales de API de TMDB',
        setup_steps: {
          title: 'Cómo obtener credenciales de API de TMDB:',
          step_1: '1. Visita themoviedb.org y crea una cuenta gratuita',
          step_2: '2. Ve a Configuración → API en tu cuenta',
          step_3: '3. Solicita una clave API para uso personal',
          step_4: '4. Copia tu clave API o token Bearer',
          step_5: '5. Pégala en el formulario de arriba'
        },
        validation: {
          api_key_required: 'Se requiere Clave API o Token Bearer',
          api_key_invalid: 'Formato de clave API inválido',
          bearer_token_invalid: 'Formato de token Bearer inválido',
          connection_failed: 'Error al conectar con la API de TMDB',
          connection_success: 'Conectado exitosamente a la API de TMDB',
          settings_saved: 'Configuración de TMDB guardada exitosamente',
          settings_reset: 'Configuración de TMDB restablecida a predeterminados',
          no_custom_credentials: 'Por favor ingresa tu clave API o token Bearer para validar',
          invalid_credentials: 'Credenciales de API inválidas. Por favor verifica tu clave API o token Bearer'
        }
      }
    },
    about: {
      title: 'Acerca de',
      description: 'Información de la aplicación',
      version: 'Versión',
      build: 'Compilación',
      license: 'Licencia',
      privacy_policy: 'Política de Privacidad',
      terms_of_service: 'Términos de Servicio'
    }
  },

  colors: {
    blue: 'Azul',
    green: 'Verde',
    purple: 'Púrpura',
    red: 'Rojo',
    orange: 'Naranja'
  },

  sizes: {
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    extra_large: 'Extra Grande'
  },

  media: {
    movie: 'Película',
    tv: 'Serie de TV',
    title: 'Título',
    description: 'Descripción',
    cast: 'Reparto',
    director: 'Director',
    rating: 'Calificación',
    releaseDate: 'Fecha de Estreno',
    genre: 'Género',
    duration: 'Duración',
    watchNow: 'Ver Ahora',
    addToLibrary: 'Agregar a Biblioteca'
  },

  mediaDetail: {
    title: 'Detalles del Medio',
    id_placeholder: 'ID del Medio: {{id}}',
    coming_soon: 'La información detallada del medio se mostrará aquí.',
    
    // Loading states
    loading_details: 'Cargando detalles del medio...',
    loading_content: 'Cargando contenido enriquecido...',
    
    // Error states
    error_title: 'No se pueden cargar los detalles',
    error_message: 'Algo salió mal al cargar la información del medio. Por favor, intenta de nuevo.',
    
    // Hero section
    runtime_minutes: '{{minutes}}m',
    show_more: 'Mostrar más',
    show_less: 'Mostrar menos',
    
    // Action buttons
    play: 'Reproducir',
    play_title: 'Reproducir Medio',
    play_message: 'Esto comenzaría a reproducir el medio seleccionado.',
    watchlist: 'Lista de Reproducción',
    add_to_watchlist: 'Agregar a Lista',
    remove_from_watchlist: 'Quitar de Lista',
    in_watchlist: 'En Lista',
    added_to_watchlist: 'Agregado a la lista',
    removed_from_watchlist: 'Quitado de la lista',
    share: 'Compartir',
    share_title: 'Compartir Medio',
    share_message: 'Compartir "{{title}}" con amigos',
    
    // External services
    watch_on: 'Ver en',
    
    // Content sections
    trailers: 'Tráilers y Videos',
    seasons: 'Temporadas',
    cast_crew: 'Reparto y Equipo',
    you_might_like: 'También te puede gustar',
    recommended: 'Recomendado',
    similar: 'Similar',
    
    // Load more functionality
    load_more_title: 'Cargar Más',
    load_more_message: 'Esto cargaría más elementos de esta sección.',
    load_more_error_title: 'No se pudo cargar más',
    load_more_error_message: 'Algo salió mal al cargar más elementos. Inténtalo de nuevo.',
    
    // Season details
    episode_count: '{{count}} episodios',
    
    // Episodes section
    episodes: {
      title: 'Episodios',
      loading_season: 'Cargando episodios...',
      play_hint: 'Toca dos veces para reproducir episodio',
      show_more: 'Mostrar más',
      show_less: 'Mostrar menos',
      expand: 'Mostrar detalles del episodio',
      collapse: 'Ocultar detalles del episodio',
      episode_title: 'Episodio {{number}}',
      no_air_date: 'Fecha de emisión no disponible',
      no_runtime: 'Duración no disponible',
      no_rating: 'Calificación no disponible',
      minutes_short: 'm',
      hours_short: 'h',
      season_episode_format: 'T{{season}}E{{episode}}'
    },
    
    // Seasons subsection
    seasonsDetail: {
      title: 'Temporadas y Episodios',
      loading_text: 'Cargando...',
      episode_singular: 'episodio',
      episode_plural: 'episodios',
      season_selector_hint: 'Toca dos veces para abrir selector de temporada'
    },
    
    // Navigation
    go_back: 'Volver'
  },

  search: {
    placeholder: 'Buscar películas y programas de TV...',
    noResults: 'No se encontraron resultados',
    recentSearches: 'Búsquedas Recientes',
    clearHistory: 'Borrar Historial'
  },

  library: {
    title: 'Mi Biblioteca',
    empty: 'Tu biblioteca está vacía',
    favorites: 'Favoritos',
    watchlist: 'Lista de Reproducción',
    history: 'Historial de Reproducción'
  },

  errors: {
    networkError: 'Error de conexión de red. Verifica tu conexión a internet.',
    serverError: 'Error del servidor. Inténtalo más tarde.',
    notFound: 'Contenido no encontrado.',
    unauthorized: 'Acceso no autorizado. Por favor inicia sesión.',
    generic: 'Algo salió mal. Inténtalo de nuevo.'
  }
}