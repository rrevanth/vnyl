import type { TranslationKey } from '../types'

export const es: TranslationKey = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    reset: 'Restablecer',
    delete: 'Eliminar',
    edit: 'Editar',
    done: 'Listo',
    close: 'Cerrar',
    expand: 'Expandir',
    collapse: 'Contraer',
    refresh: 'Actualizar',
    and_more: 'y {{count}} más'
  },

  navigation: {
    home: 'Inicio',
    search: 'Buscar',
    library: 'Biblioteca',
    settings: 'Configuración'
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
        title: 'TMDB (The Movie Database)',
        description: 'Metadatos de películas y series',
        using_defaults: 'Usando Configuración Predeterminada',
        using_custom_config: 'Usando Configuración Personalizada',
        defaults_description: 'Usando claves API integradas y configuración predeterminada. Configura ajustes personalizados a continuación para usar tus propias claves API.',
        environment_credentials_description: 'Usando credenciales del entorno para autenticación. Aún puedes personalizar las preferencias de idioma y contenido a continuación.',
        custom_config_description: 'Usando tu configuración API personalizada. Todas las solicitudes usarán tus claves API proporcionadas.',
        authentication: 'Autenticación',
        authentication_description: 'Configura tus credenciales API de TMDB. Necesitas un Token Bearer o una Clave API.',
        bearer_token: 'Token Bearer',
        bearer_token_placeholder: 'Ingresa tu Token Bearer de TMDB',
        bearer_token_description: 'Método preferido. Obtener desde configuración API de TMDB.',
        api_key: 'Clave API',
        api_key_placeholder: 'Ingresa tu Clave API de TMDB',
        api_key_description: 'Alternativa al Token Bearer. Obtener desde configuración API de TMDB.',
        configuration: 'Configuración',
        configuration_description: 'Personalizar comportamiento de API de TMDB y preferencias de contenido.',
        language: 'Idioma',
        language_description: 'Idioma para metadatos de películas y series',
        include_adult: 'Incluir Contenido Adulto',
        include_adult_description: 'Mostrar contenido adulto/maduro en resultados de búsqueda',
        validation_error_title: 'Error de Validación',
        validation_error_message: 'Por favor proporciona un Token Bearer o una Clave API.',
        save_success_title: 'Configuración Guardada',
        save_success_message: 'Tu configuración de TMDB se ha guardado exitosamente.',
        save_error_message: 'Error al guardar configuración de TMDB. Por favor intenta de nuevo.',
        validate_and_save: 'Validar y Guardar',
        
        // Stack navigation titles
        account_settings_title: 'Configuración de Cuenta',
        capabilities_title: 'Capacidades',
        
        // Account settings screen
        capabilities_section_title: 'Capacidades del Proveedor',
        capabilities_section_description: 'Configura qué funciones de TMDB están habilitadas para tu aplicación',
        manage_capabilities: 'Gestionar Capacidades',
        manage_capabilities_description: 'Habilitar o deshabilitar funciones específicas de TMDB',
        
        // Capabilities screen
        capabilities_header_title: 'Capacidades de TMDB',
        capabilities_header_description: 'Controla qué funciones de TMDB están activas. Deshabilitar capacidades no utilizadas puede mejorar el rendimiento.',
        available_capabilities: 'Capacidades Disponibles',
        loading_capabilities: 'Cargando capacidades...',
        capabilities_error_title: 'Error al Cargar Capacidades',
        capabilities_save_success_title: 'Capacidades Guardadas',
        capabilities_save_success_message: 'Tus configuraciones de capacidades de TMDB se han actualizado exitosamente.',
        capabilities_save_error_message: 'Error al guardar configuraciones de capacidades',
        capabilities_reset_title: 'Restablecer Capacidades',
        capabilities_reset_message: 'Esto restablecerá todas las configuraciones de capacidades a sus valores guardados actuales. ¿Estás seguro?',
        
        // Individual capability descriptions
        capability_metadata_title: 'Metadatos',
        capability_metadata_description: 'Información detallada de películas y series',
        capability_catalog_title: 'Catálogo',
        capability_catalog_description: 'Navegar colecciones de películas y series',
        capability_search_title: 'Búsqueda',
        capability_search_description: 'Buscar películas y series',
        capability_stream_title: 'Transmisión',
        capability_stream_description: 'Enlaces de transmisión e información de reproducción',
        capability_recommendation_title: 'Recomendaciones',
        capability_recommendation_description: 'Contenido similar y recomendaciones',
        capability_collection_title: 'Colecciones',
        capability_collection_description: 'Colecciones de películas y series',
        capability_watchlist_title: 'Lista de Seguimiento',
        capability_watchlist_description: 'Gestión de lista de seguimiento personal',
        capability_progress_title: 'Seguimiento de Progreso',
        capability_progress_description: 'Progreso de visualización e historial',
        capability_rating_title: 'Calificaciones',
        capability_rating_description: 'Calificaciones de usuarios y críticos',
        capability_image_title: 'Imágenes',
        capability_image_description: 'Pósters, fondos y arte',
        capability_video_title: 'Videos',
        capability_video_description: 'Tráilers y contenido de video',
        capability_subtitle_title: 'Subtítulos',
        capability_subtitle_description: 'Archivos de subtítulos y captions'
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

  providers: {
    capabilities: {
      metadata: {
        title: 'Metadatos',
        description: 'Obtener información detallada sobre películas y series de TV'
      },
      catalog: {
        title: 'Catálogos',
        description: 'Explorar colecciones organizadas de contenido'
      },
      search: {
        title: 'Búsqueda',
        description: 'Buscar películas, series de TV y personas'
      },
      stream: {
        title: 'Transmisión',
        description: 'Encontrar enlaces y fuentes de transmisión'
      },
      recommendation: {
        title: 'Recomendaciones',
        description: 'Obtener sugerencias de contenido personalizadas'
      },
      collection: {
        title: 'Colecciones',
        description: 'Gestionar colecciones de contenido personalizadas'
      },
      watchlist: {
        title: 'Lista de Reproducción',
        description: 'Rastrear películas y series para ver más tarde'
      },
      progress: {
        title: 'Progreso de Visualización',
        description: 'Rastrear progreso de visualización e historial'
      },
      rating: {
        title: 'Calificaciones',
        description: 'Calificar y reseñar contenido'
      },
      image: {
        title: 'Imágenes',
        description: 'Acceder a pósters, fondos y otras ilustraciones'
      },
      video: {
        title: 'Videos',
        description: 'Acceder a tráilers, clips y documentales'
      },
      subtitle: {
        title: 'Subtítulos',
        description: 'Descargar subtítulos en múltiples idiomas'
      }
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

  catalog: {
    no_items: 'Sin elementos',
    one_item: '1 elemento',
    items_count: '{{count}} elementos',
    items_k_count: '{{count}}K elementos',
    items_m_count: '{{count}}M elementos',
    has_more: 'Más disponibles',
    updated: 'Actualizado {{date}}',
    card_accessibility: 'Catálogo {{title}} de {{provider}} con contenido {{type}}',
    loading_catalogs: 'Cargando catálogos...',
    no_catalogs: 'No hay catálogos disponibles',
    error_loading: 'Error al cargar catálogos',
    retry_loading: 'Reintentar carga de catálogos',
    all_providers: 'Todos los Proveedores',
    healthy_providers: 'Proveedores saludables: {{count}}',
    total_catalogs: 'Total de catálogos: {{count}}'
  },

  provider: {
    toggle_expansion: 'Alternar catálogos de {{provider}} ({{state}})',
    catalog_count: '{{count}} catálogos',
    catalog_count_one: '1 catálogo',
    show_more: 'Mostrar {{count}} más',
    show_more_catalogs: 'Mostrar {{count}} catálogos más de {{provider}}',
    no_catalogs: 'No hay catálogos disponibles',
    health: {
      healthy: 'Saludable',
      unhealthy: 'No saludable'
    },
    type: {
      official: 'Oficial',
      addon: 'Complemento',
      custom: 'Personalizado',
      local: 'Local'
    }
  },

  content_type: {
    movie: 'Películas',
    tv: 'Series de TV',
    person: 'Personas',
    collection: 'Colecciones',
    network: 'Cadenas',
    company: 'Empresas'
  },

  homescreen: {
    title: 'Inicio',
    welcome: 'Bienvenido a VNYL',
    loading_providers: 'Cargando proveedores...',
    no_providers: 'No hay proveedores configurados',
    provider_error: 'Error al cargar proveedores',
    stats: {
      providers: 'Proveedores',
      catalogs: 'Catálogos',
      healthy: 'Saludables',
      response_time: 'Tiempo de Respuesta Promedio'
    }
  },

  errors: {
    networkError: 'Error de conexión de red. Verifica tu conexión a internet.',
    serverError: 'Error del servidor. Inténtalo más tarde.',
    notFound: 'Contenido no encontrado.',
    unauthorized: 'Acceso no autorizado. Por favor inicia sesión.',
    generic: 'Algo salió mal. Inténtalo de nuevo.'
  }
}