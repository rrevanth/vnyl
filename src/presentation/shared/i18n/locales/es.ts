import type { TranslationKey } from '../types'

export const es: TranslationKey = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    done: 'Listo',
    close: 'Cerrar'
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
      light: 'Claro',
      dark: 'Oscuro'
    },
    language: {
      title: 'Idioma',
      english: 'Inglés',
      spanish: 'Español'
    },
    about: {
      title: 'Acerca de',
      version: 'Versión'
    }
  },

  providers: {
    title: 'Proveedores',
    comingSoon: 'Próximamente',
    status: {
      configured: 'Configurado',
      notConfigured: 'No Configurado'
    },
    sections: {
      database: 'Base de Datos de Medios',
      streaming: 'Servicios de Streaming',
      tracking: 'Servicios de Seguimiento',
      info: 'Información'
    },
    info: {
      title: 'Acerca de los Proveedores',
      description: 'Configura servicios externos para mejorar tu experiencia multimedia'
    },
    tmdb: {
      title: 'Configuración TMDB',
      header: {
        title: 'Estado de API',
        status: {
          bearerConfigured: 'Token Bearer Activo',
          apiKeyConfigured: 'Clave API Activa',
          defaultKeyActive: 'Clave por Defecto Activa',
          notConfigured: 'Autenticación Requerida'
        }
      },
      form: {
        title: 'Configuración',
        bearerToken: 'Token Bearer (Token de Acceso de Lectura)',
        bearerTokenPlaceholder: 'Ingresa tu token Bearer de TMDB',
        apiKey: 'Clave API',
        apiKeyPlaceholder: 'Ingresa tu clave API de TMDB',
        language: 'Idioma',
        region: 'Región',
        includeAdult: 'Incluir Contenido para Adultos',
        includeAdultDescription: 'Incluir contenido para adultos en los resultados de búsqueda'
      },
      status: {
        title: 'Estado de Configuración',
        authentication: 'Autenticación',
        apiKey: 'Clave API',
        bearerToken: 'Token Bearer',
        configured: 'Configurado',
        notConfigured: 'No Configurado',
        apiKeyConfigured: 'Clave API Configurada',
        bearerTokenConfigured: 'Token Bearer Configurado'
      },
      config: {
        title: 'Configuración de API',
        info: {
          title: 'Opciones de Autenticación',
          description: 'Usa Token Bearer (recomendado) o Clave API. El Token Bearer proporciona mejor seguridad y límites de velocidad.'
        },
        apiKey: 'Clave API',
        apiKeyPlaceholder: 'Ingresa tu clave API de TMDB',
        bearerToken: 'Token Bearer (Token de Acceso de Lectura)',
        bearerTokenPlaceholder: 'Ingresa tu token Bearer de TMDB',
        defaultApiKey: {
          title: 'Usando Clave API por Defecto',
          description: 'Actualmente usando clave API por defecto del entorno: {key}'
        }
      },
      preferences: {
        title: 'Preferencias',
        language: 'Idioma',
        region: 'Región',
        includeAdult: 'Incluir Contenido para Adultos',
        includeAdultDescription: 'Incluir contenido para adultos en los resultados de búsqueda'
      },
      language: {
        title: 'Seleccionar Idioma'
      },
      region: {
        title: 'Seleccionar Región'
      },
      actions: {
        save: 'Guardar Configuración',
        testConnection: 'Probar Conexión',
        validateAndSave: 'Validar y Guardar',
        reset: 'Restablecer a Predeterminados'
      },
      success: {
        title: 'Éxito',
        message: 'Configuración de TMDB guardada exitosamente'
      },
      error: {
        title: 'Error de Configuración',
        message: 'Error al guardar la configuración de TMDB. Verifica tu configuración e inténtalo de nuevo.'
      },
      validateSave: {
        success: {
          title: 'Configuración Validada',
          message: 'Configuración de TMDB validada y guardada exitosamente'
        },
        error: {
          title: 'Validación Fallida',
          message: 'Error al validar la configuración de TMDB. Verifica tus credenciales e inténtalo de nuevo.'
        }
      },
      test: {
        success: {
          title: 'Conexión Exitosa',
          message: 'Conectado exitosamente a la API de TMDB'
        },
        error: {
          title: 'Conexión Fallida',
          message: 'Error al conectar con la API de TMDB. Verifica tus credenciales.'
        }
      },
      reset: {
        title: 'Restablecer Configuración',
        message: 'Esto restablecerá todas las configuraciones de TMDB a los valores predeterminados. ¿Estás seguro?',
        confirm: 'Restablecer'
      }
    }
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

  errors: {
    networkError: 'Error de conexión de red. Verifica tu conexión a internet.',
    serverError: 'Error del servidor. Inténtalo más tarde.',
    notFound: 'Contenido no encontrado.',
    unauthorized: 'Acceso no autorizado. Por favor inicia sesión.',
    generic: 'Algo salió mal. Inténtalo de nuevo.'
  }
}