export interface Organisation {
  id: string;
  name: string;
  sector: string;
  unitCodePrefix: string;
}

// Mock organisations data
export const organisations: Organisation[] = [
  {
    id: '1',
    name: 'Compass Group UK',
    sector: 'Eurest',
    unitCodePrefix: 'LC'
  },
  {
    id: '2',
    name: 'Sodexo',
    sector: 'Healthcare',
    unitCodePrefix: 'SH'
  },
  {
    id: '3',
    name: 'Aramark',
    sector: 'Education',
    unitCodePrefix: 'ED'
  },
  {
    id: '4',
    name: 'Elior',
    sector: 'Business & Industry',
    unitCodePrefix: 'BI'
  },
  {
    id: '5',
    name: 'BaxterStorey',
    sector: 'Corporate',
    unitCodePrefix: 'CP'
  },
  {
    id: '6',
    name: 'Mitie',
    sector: 'Facilities Management',
    unitCodePrefix: 'FM'
  },
  {
    id: '7',
    name: 'ISS',
    sector: 'Support Services',
    unitCodePrefix: 'SS'
  },
  {
    id: '8',
    name: 'Bidvest Noonan',
    sector: 'Security & Cleaning',
    unitCodePrefix: 'SC'
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
