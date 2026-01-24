
export interface Province {
  id: string;
  name: string;
}

export interface District {
  id: string;
  provinceId: string;
  name: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  provinceId: string;
  districtId: string;
  constituency: string;
  photoUrl: string;
  symbolUrl: string; // New field for election symbol
}

export interface PoliticalParty {
  id: string;
  name: string;
}
