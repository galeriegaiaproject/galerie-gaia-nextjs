import slugify from '../utils/slugify'

const seoField = {
  name: 'seo',
  label: 'SEO',
  type: 'object',
  ui: {
    defaultItem: {
      type: 'website',
    },
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Titre',
    },
    {
      type: 'string',
      name: 'heading',
      label: 'En tête',
    },
    {
      type: 'string',
      name: 'type',
      label: 'Type',
      list: false,
      defaultItem: 'website',
      options: [
        {
          value: 'website',
          label: 'Website',
        },
        {
          value: 'article',
          label: 'Article',
        },
      ],
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Image',
    },
  ],
}

const artistsCollection = {
  name: 'artists',
  label: 'Collection/Artistes',
  path: 'content/artists',
  ui: {
    filename: {
      readonly: true,
      slugify: (values) => slugify(values.title || ''),
    },
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Nom',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'location',
      label: 'Localisation',
    },
    {
      type: 'string',
      name: 'fields',
      label: 'Champs Artistique',
      list: true,
    },
    {
      type: 'string',
      name: 'styles',
      label: 'Styles Artistique',
      list: true,
    },
    {
      type: 'string',
      name: 'birth',
      label: 'Année de naissance',
    },
    {
      type: 'string',
      name: 'death',
      label: 'Année de décès',
    },
    {
      type: 'boolean',
      name: 'expose',
      label: 'Exposer',
    },
    {
      type: 'object',
      name: 'exhibitions',
      label: 'Expositions',
      list: true,
      itemProps: (item) => ({
        label: item.title,
      }),
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Titre',
          required: true,
        },
        {
          type: 'string',
          name: 'location',
          label: 'Localisation',
        },
        {
          type: 'string',
          name: 'start',
          label: 'Début',
        },
        {
          type: 'string',
          name: 'end',
          label: 'Fin',
        },
      ],
    },
    {
      type: 'rich-text',
      name: 'biography',
      label: 'Biography',
      isBody: true,
    },
    {
      type: 'reference',
      name: 'work',
      label: 'Oeuvre mis en avant',
      collections: ['works'],
    },
    {
      ...seoField,
      ui: {
        defaultItem: {
          type: 'article',
        },
      },
    },
  ],
}

const worksCollection = {
  name: 'works',
  label: 'Collection/Oeuvres',
  path: 'content/works',
  ui: {
    filename: {
      readonly: true,
      slugify: (values) => `${slugify((values.artist || '').split('/').pop())}-${slugify((values.title || ''))}`,
    },
  },
  defaultItem: () => ({
    contextual: true,
  }),
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Titre',
      required: true,
    },
    {
      type: 'string',
      name: 'reference',
      label: 'Reference',
      required: true,
      isTitle: true,
    },
    {
      type: 'image',
      name: 'image',
      label: 'Image',
    },
    {
      type: 'reference',
      name: 'artist',
      label: 'Artiste',
      collections: ['artists'],
      required: true,
    },
    {
      type: 'number',
      name: 'price',
      label: 'Prix',
    },
    {
      type: 'string',
      name: 'technique',
      label: 'Technique',
    },
    {
      type: 'string',
      name: 'fields',
      label: 'Champs Artistique',
      list: true,
    },
    {
      type: 'string',
      name: 'styles',
      label: 'Styles Artistique',
      list: true,
    },
    {
      type: 'boolean',
      name: 'sold',
      label: 'Vendu',
    },
    {
      type: 'boolean',
      name: 'contextual',
      label: "Autoriser l'affichage en mode contextuel",
    },
    {
      type: 'number',
      name: 'weight',
      label: 'Poids',
    },
    {
      type: 'object',
      name: 'dimensions',
      label: 'Dimensions',
      fields: [
        {
          type: 'number',
          name: 'height',
          label: 'Hauteur',
        },
        {
          type: 'number',
          name: 'width',
          label: 'Largeur',
        },
        {
          type: 'number',
          name: 'depth',
          label: 'Profondeur',
        },
      ],
    },
    {
      type: 'rich-text',
      name: 'description',
      label: 'Description',
      isBody: true,
    },
  ],
}

const pagesCollection = {
  name: 'pages',
  label: 'Collection/Pages',
  path: 'content/pages',
  fields: [
    seoField,
    {
      type: 'object',
      name: 'content',
      label: 'Contenu',
      list: true,
      fields: [
        {
          type: 'rich-text',
          name: 'column',
          label: 'Contenu',
          isBody: true,
        },
        {
          type: 'object',
          name: 'contact',
          label: 'Contact',
          fields: [
            {
              type: 'string',
              name: 'placeholder',
              label: 'Text',
            },
            {
              type: 'boolean',
              name: 'display',
              label: 'Afficher'
            }
          ],
        },
      ],
    },
  ],
}

const pageHome = {
  name: 'page_home',
  label: 'Page/Accueil',
  path: 'content/page_home',
  fields: [
    seoField,
    {
      type: 'object',
      name: 'carousel',
      label: 'Carousel',
      list: true,
      itemProps: (item) => ({
        key: item.work,
        label: item.work,
      }),
      fields: [
        {
          type: 'reference',
          name: 'work',
          label: 'Oeuvre',
          collections: ['works'],
        },
      ],
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
}

const pageArtists = {
  name: 'page_artists',
  label: 'Page/Artistes',
  path: 'content/page_artists',
  fields: [
    seoField,
    {
      type: 'object',
      name: 'artists',
      label: 'Artistes',
      list: true,
      itemProps: (item) => ({
        key: item.artist,
        label: item.artist,
      }),
      fields: [
        {
          type: 'reference',
          name: 'artist',
          label: 'Artiste',
          collections: ['artists'],
        },
      ],
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
}

const pageCatalogue = {
  name: 'page_catalogue',
  label: 'Page/Catalogue',
  path: 'content/page_catalogue',
  fields: [
    seoField,
    {
      type: 'string',
      name: 'title',
      label: 'Titre',
    },
    {
      type: 'rich-text',
      name: 'description',
      label: 'Description',
      isBody: true,
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
}

const pageActualites = {
  name: 'page_actualites',
  label: 'Page/Actualités',
  path: 'content/page_actualites',
  fields: [
    seoField,
    {
      type: 'object',
      name: 'articles',
      label: 'Articles',
      list: true,
      itemProps: (item) => ({
        label: item.title,
      }),
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Titre',
          required: true,
        },
        {
          type: 'datetime',
          name: 'date',
          label: 'Date',
          ui: {
            timeFormat: 'HH:mm',
          },
        },
        {
          type: 'string',
          name: 'categories',
          label: "Catégories de l'article",
          list: true,
        },
        {
          type: 'image',
          name: 'image',
          label: 'Image',
        },
        {
          type: 'rich-text',
          name: 'content',
          label: 'Contenu',
          isBody: true,
        },
      ],
    }
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
}

const pageWhere = {
  name: 'page_where',
  label: 'Page/Le Lieu',
  path: 'content/page_where',
  fields: [
    seoField,
    {
      type: 'rich-text',
      name: 'about',
      label: 'À propos',
    },
    {
      type: 'rich-text',
      name: 'content',
      label: 'Contenu',
      isBody: true,
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
}

const metadata = {
  name: 'metadata',
  label: 'Informations/Site',
  path: 'content/metadata',
  fields: [
    {
      type: 'string',
      name: 'siteUrl',
      label: 'URL du site',
      required: true,
    },
    {
      type: 'string',
      name: 'title',
      label: 'Titre du site',
      required: true,
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
      required: true,
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'object',
      name: 'menu',
      label: 'Menu (Studio)',
      list: true,
      itemProps: (item) => ({
        key: item.page,
        label: item.page,
      }),
      fields: [
        {
          type: 'reference',
          name: 'page',
          label: 'Page',
          collections: ['pages'],
        },
      ],
    },
    {
      type: 'string',
      name: 'caption',
      label: 'Légende du logo',
      required: true,
    },
    {
      type: 'rich-text',
      name: 'announcement',
      label: 'Annonce',
    },
    {
      type: 'string',
      name: 'opening',
      label: "Horaires d'ouverture",
      required: true,
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'string',
      name: 'phone',
      label: 'Numéro de téléphone',
      required: true,
    },
    {
      type: 'string',
      name: 'email',
      label: 'Adresse email',
      required: true,
    },
    {
      type: 'string',
      name: 'instagram',
      label: 'Instagram',
      required: true,
    },
    {
      type: 'string',
      name: 'facebook',
      label: 'Facebook',
      required: true,
    },
  ],
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
}

export default {
  collections: [
    artistsCollection,
    worksCollection,
    pagesCollection,
    pageHome,
    pageCatalogue,
    pageActualites,
    pageArtists,
    pageWhere,
    metadata,
  ],
}
