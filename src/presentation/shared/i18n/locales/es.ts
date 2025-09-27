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