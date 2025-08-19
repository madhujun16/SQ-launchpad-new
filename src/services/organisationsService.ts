export interface Organisation {
  id: string;
  name: string;
  sector: string;
  unitCodePrefix: string;
}

// Actual organizations with correct sector mappings from Platform Configuration
export const organisations: Organisation[] = [
  // Sector: Chartwells
  {
    id: '1',
    name: 'University of Cumbria',
    sector: 'Chartwells',
    unitCodePrefix: 'UC'
  },
  {
    id: '2',
    name: 'University of Kent',
    sector: 'Chartwells',
    unitCodePrefix: 'UK'
  },
  {
    id: '3',
    name: 'Swansea University',
    sector: 'Chartwells',
    unitCodePrefix: 'SU'
  },
  {
    id: '4',
    name: 'Marjon',
    sector: 'Chartwells',
    unitCodePrefix: 'MJ'
  },
  
  // Sector: RA
  {
    id: '5',
    name: 'HSBC',
    sector: 'RA',
    unitCodePrefix: 'HS'
  },
  {
    id: '6',
    name: 'Minley Station',
    sector: 'RA',
    unitCodePrefix: 'MS'
  },
  {
    id: '7',
    name: 'Peabody',
    sector: 'RA',
    unitCodePrefix: 'PB'
  },
  {
    id: '8',
    name: 'Morgan Stanley',
    sector: 'RA',
    unitCodePrefix: 'MS'
  },
  
  // Sector: Levy
  {
    id: '9',
    name: 'The NEC',
    sector: 'Levy',
    unitCodePrefix: 'NE'
  },
  
  // Sector: B&I
  {
    id: '10',
    name: 'SSE',
    sector: 'B&I',
    unitCodePrefix: 'SS'
  },
  {
    id: '11',
    name: 'Ford Dunton',
    sector: 'B&I',
    unitCodePrefix: 'FD'
  },
  {
    id: '12',
    name: 'Penner Road',
    sector: 'B&I',
    unitCodePrefix: 'PR'
  },
  {
    id: '13',
    name: 'Thatcham',
    sector: 'B&I',
    unitCodePrefix: 'TH'
  },
  {
    id: '14',
    name: 'Ty Calon',
    sector: 'B&I',
    unitCodePrefix: 'TC'
  },
  {
    id: '15',
    name: 'NEXT',
    sector: 'B&I',
    unitCodePrefix: 'NX'
  },
  {
    id: '16',
    name: 'Porsche',
    sector: 'B&I',
    unitCodePrefix: 'PC'
  },
  
  // Sector: Compass One
  {
    id: '17',
    name: 'Rolls Royce',
    sector: 'Compass One',
    unitCodePrefix: 'RR'
  },
  {
    id: '18',
    name: 'Baxter Health',
    sector: 'Compass One',
    unitCodePrefix: 'BH'
  },
  
  // Sector: JLR - Whitley
  {
    id: '19',
    name: 'JLR - Whitley',
    sector: 'JLR - Whitley',
    unitCodePrefix: 'JW'
  }
];

export const getOrganisations = (): Promise<Organisation[]> => {
  return Promise.resolve(organisations);
};

export const getOrganisationById = (id: string): Promise<Organisation | undefined> => {
  const org = organisations.find(o => o.id === id);
  return Promise.resolve(org);
};

export const getOrganisationByName = (name: string): Promise<Organisation | undefined> => {
  const org = organisations.find(o => o.name === name);
  return Promise.resolve(org);
};
