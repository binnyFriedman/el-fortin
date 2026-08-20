export const englishCampaign = {
  name: 'elfortin-search-en-v1',
  budgetName: 'elfortin-search-en-v1-budget',
  dailyBudgetMicros: '11000000',
  cpcBidCeilingMicros: '2500000',
  finalUrl: 'https://invest.elfortincapital.com/en',
  finalUrlSuffix:
    'utm_source=google&utm_medium=cpc&utm_campaign=elfortin-search-en' +
    '&utm_content={creative}&utm_term={keyword}',
  displayPaths: ['valencia', 'new-build'],
  languageConstantId: '1000',
  locationConstantIds: [
    '2826', // United Kingdom
    '2372', // Ireland
    '2276', // Germany
    '2528', // Netherlands
    '2056', // Belgium
    '2040', // Austria
    '2756', // Switzerland
    '2752', // Sweden
    '2578', // Norway
    '2208', // Denmark
    '2246' // Finland
  ],
  adGroup: {
    name: 'EN | Valencia buyer intent',
    keywords: [
      ['buy apartment valencia', 'PHRASE'],
      ['buy apartment valencia', 'EXACT'],
      ['buy property valencia spain', 'PHRASE'],
      ['buy property valencia spain', 'EXACT'],
      ['new build apartments valencia', 'PHRASE'],
      ['new build apartments valencia', 'EXACT'],
      ['pre construction apartments valencia', 'PHRASE'],
      ['pre construction apartments valencia', 'EXACT'],
      ['valencia property investment', 'PHRASE'],
      ['valencia property investment', 'EXACT'],
      ['buy rental property spain', 'PHRASE'],
      ['buy rental property spain', 'EXACT'],
      ['spain buy to let', 'PHRASE'],
      ['spain buy to let', 'EXACT'],
      ['valencia real estate for foreigners', 'PHRASE'],
      ['valencia real estate for foreigners', 'EXACT']
    ]
  },
  negativeKeywords: [
    'apartment for rent',
    'apartments for rent',
    'flat to rent',
    'property to rent',
    'house for rent',
    'houses for rent',
    'room for rent',
    'rooms for rent',
    'roommate',
    'holiday rental',
    'vacation rental',
    'weekly rental',
    'long term rental',
    'student',
    'cheap',
    'job',
    'jobs',
    'visa',
    'alquiler',
    'alquilar',
    'habitación',
    'habitaciones',
    'agosto',
    'house',
    'houses',
    'villa',
    'villas',
    'condo',
    'condos',
    'ibiza',
    'mallorca',
    'barcelona',
    'madrid'
  ],
  headlines: [
    'New-Build Valencia Apartments',
    'Buy Apartment Near Valencia',
    'Apartments Near Valencia',
    'Valencia Property for Sale',
    'Buy Property Valencia Spain',
    'Valencia Apartments for Sale',
    'Valencia Property Investment',
    'Spain Buy-to-Let Property',
    'Property Near Valencia',
    'From €236,141 All-In',
    'Deeded Apartment Ownership',
    'Expected Completion 2027',
    'Managed Rental Available',
    '9 of 10 Homes Available',
    'Explore El Fortín'
  ],
  descriptions: [
    'Own a deeded new-build apartment near Valencia. Expected completion in 2027.',
    'From €236,141 all-in, including estimated purchase costs and furniture. View details.',
    'Managed rental available. Review the plans, licence, contract terms and project details.',
    'Nine of ten homes remain. Ask the developer a question or request the property documents.'
  ],
  sitelinks: [
    {
      linkText: 'Ownership & Management',
      description1: 'Deeded ownership explained',
      description2: 'See managed rental details',
      finalUrl: 'https://invest.elfortincapital.com/en#ownership'
    },
    {
      linkText: 'Price & Returns',
      description1: 'Review price and target return',
      description2: 'Understand the contractual floor',
      finalUrl: 'https://invest.elfortincapital.com/en#deal'
    },
    {
      linkText: 'Project Team',
      description1: 'Meet the licensed project team',
      description2: 'See experience and prior work',
      finalUrl: 'https://invest.elfortincapital.com/en#evidence'
    },
    {
      linkText: 'Request Documents',
      description1: 'Request plans and legal documents',
      description2: 'Ask the developer directly',
      finalUrl: 'https://invest.elfortincapital.com/en#ask'
    }
  ]
};
