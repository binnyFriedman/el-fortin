export const spanishCampaign = {
  name: 'elfortin-search-es-v1',
  budgetName: 'elfortin-search-es-v1-budget',
  dailyBudgetMicros: '7000000',
  cpcBidCeilingMicros: '2000000',
  finalUrl: 'https://invest.elfortincapital.com/',
  finalUrlSuffix:
    'utm_source=google&utm_medium=cpc&utm_campaign=elfortin-search-es' +
    '&utm_content={creative}&utm_term={keyword}',
  displayPaths: ['valencia', 'obra-nueva'],
  languageConstantId: '1003',
  locationConstantIds: [
    '2724' // Spain
  ],
  adGroup: {
    name: 'ES | Compradores Valencia',
    keywords: [
      ['comprar piso valencia', 'PHRASE'],
      ['comprar piso valencia', 'EXACT'],
      ['comprar apartamento valencia', 'PHRASE'],
      ['comprar apartamento valencia', 'EXACT'],
      ['inversión inmobiliaria valencia', 'PHRASE'],
      ['inversión inmobiliaria valencia', 'EXACT'],
      ['obra nueva valencia', 'PHRASE'],
      ['obra nueva valencia', 'EXACT'],
      ['comprar vivienda inversión españa', 'PHRASE'],
      ['comprar vivienda inversión españa', 'EXACT'],
      ['piso en preventa valencia', 'PHRASE'],
      ['piso en preventa valencia', 'EXACT'],
      ['comprar piso riba roja', 'PHRASE'],
      ['comprar piso riba roja', 'EXACT'],
      ['obra nueva riba roja', 'PHRASE'],
      ['obra nueva riba roja', 'EXACT']
    ]
  },
  negativeKeywords: [
    'piso alquiler',
    'apartamento alquiler',
    'casa alquiler',
    'habitación alquiler',
    'habitaciones alquiler',
    'alquiler vacaciones',
    'alquiler semanal',
    'alquiler larga duración',
    'estudiante',
    'estudiantes',
    'barato',
    'empleo',
    'trabajo',
    'agosto',
    'rent',
    'rental',
    'room',
    'holiday',
    'vacation',
    'student',
    'cheap',
    'villa',
    'villas',
    'ibiza',
    'mallorca',
    'barcelona',
    'madrid'
  ],
  headlines: [
    'Apartamentos Cerca Valencia',
    'Obra Nueva Cerca de Valencia',
    'Compra Piso Cerca Valencia',
    'Inversión Inmobiliaria',
    'Desde 236.141 € Todo Incluido',
    'Entrega Prevista en 2027',
    'Alquiler Gestionado',
    '9 de 10 Viviendas Disponibles',
    'Vivienda con Escritura',
    'Comprar Vivienda en España',
    'Propiedad Cerca de Valencia',
    'Consulta Planos y Documentos',
    'Conoce El Fortín',
    'Promoción en Riba-roja',
    'Obra Nueva Riba-roja'
  ],
  descriptions: [
    'Apartamento de obra nueva cerca de Valencia, con escritura y entrega prevista en 2027.',
    'Desde 236.141 € todo incluido, con gastos estimados de compra y mobiliario. Ver detalles.',
    'Alquiler gestionado disponible. Consulta planos, licencia, contrato y detalles.',
    'Quedan nueve de diez viviendas. Pregunta al promotor o solicita la documentación.'
  ],
  sitelinks: [
    {
      linkText: 'Propiedad y Gestión',
      description1: 'Consulta la propiedad escriturada',
      description2: 'Conoce la gestión del alquiler',
      finalUrl: 'https://invest.elfortincapital.com/#ownership'
    },
    {
      linkText: 'Precio y Rentabilidad',
      description1: 'Consulta precio y rentabilidad',
      description2: 'Revisa el mínimo contractual',
      finalUrl: 'https://invest.elfortincapital.com/#deal'
    },
    {
      linkText: 'Equipo del Proyecto',
      description1: 'Conoce al equipo acreditado',
      description2: 'Consulta experiencia y obras',
      finalUrl: 'https://invest.elfortincapital.com/#evidence'
    },
    {
      linkText: 'Solicitar Documentos',
      description1: 'Solicita planos y documentos',
      description2: 'Pregunta al promotor',
      finalUrl: 'https://invest.elfortincapital.com/#ask'
    }
  ]
};
