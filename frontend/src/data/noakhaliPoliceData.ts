export interface NoakhaliPoliceStation {
  id: string;
  name: string;
  upazila: string;
  address: string;
  phone: string;
  dutyOfficerPhone: string;
  lat: number;
  lng: number;
  isHQ?: boolean;
}

export const NOAKHALI_POLICE_STATIONS: NoakhaliPoliceStation[] = [
  {
    id: 'sp-noakhali',
    name: 'Noakhali District Police SP Office & 24/7 Control Room',
    upazila: 'Maijdee / District HQ',
    address: 'Maijdee Court Road, Noakhali',
    phone: '+8801320-115898',
    dutyOfficerPhone: '+880321-61450',
    lat: 22.8717,
    lng: 91.0879,
    isHQ: true
  },
  {
    id: 'sudharam-model',
    name: 'Sudharam Model Police Station (Maijdee)',
    upazila: 'Noakhali Sadar',
    address: 'Maijdee Bazar Road, Noakhali Sadar',
    phone: '+8801320-115900',
    dutyOfficerPhone: '+880321-61333',
    lat: 22.8690,
    lng: 91.0910
  },
  {
    id: 'sonapur-outpost',
    name: 'Sonapur Police Outpost / Patrol Camp',
    upazila: 'Noakhali Sadar / Sonapur',
    address: 'Sonapur Zero Point, Noakhali',
    phone: '+8801320-115905',
    dutyOfficerPhone: '+8801713-374821',
    lat: 22.8250,
    lng: 91.1000
  },
  {
    id: 'begumganj-model',
    name: 'Begumganj Model Police Station',
    upazila: 'Begumganj (Chowmuhani)',
    address: 'Chowmuhani Rail Gate Road, Begumganj, Noakhali',
    phone: '+8801320-115920',
    dutyOfficerPhone: '+880321-51222',
    lat: 22.9238,
    lng: 91.1018
  },
  {
    id: 'kabirhat-ps',
    name: 'Kabirhat Police Station',
    upazila: 'Kabirhat',
    address: 'Kabirhat Bazar, Noakhali',
    phone: '+8801320-115940',
    dutyOfficerPhone: '+880321-71050',
    lat: 22.8419,
    lng: 91.1923
  },
  {
    id: 'companiganj-ps',
    name: 'Companiganj Police Station (Basurhat)',
    upazila: 'Companiganj',
    address: 'Basurhat Town, Companiganj, Noakhali',
    phone: '+8801320-115960',
    dutyOfficerPhone: '+880321-75022',
    lat: 22.8711,
    lng: 91.2825
  },
  {
    id: 'chatkhil-ps',
    name: 'Chatkhil Police Station',
    upazila: 'Chatkhil',
    address: 'Chatkhil Main Road, Noakhali',
    phone: '+8801320-115980',
    dutyOfficerPhone: '+880321-73022',
    lat: 23.0519,
    lng: 90.9634
  },
  {
    id: 'senbagh-ps',
    name: 'Senbagh Police Station',
    upazila: 'Senbagh',
    address: 'Senbagh Bazar, Noakhali',
    phone: '+8801320-116000',
    dutyOfficerPhone: '+880321-77022',
    lat: 22.9892,
    lng: 91.2292
  },
  {
    id: 'charjabbar-ps',
    name: 'Char Jabbar Police Station (Subarnachar)',
    upazila: 'Subarnachar',
    address: 'Char Jabbar Hospital Road, Subarnachar, Noakhali',
    phone: '+8801320-116020',
    dutyOfficerPhone: '+8801713-374828',
    lat: 22.6844,
    lng: 91.1347
  },
  {
    id: 'hatiya-ps',
    name: 'Hatiya Police Station',
    upazila: 'Hatiya Island',
    address: 'Oskhali Bazar, Hatiya Island, Noakhali',
    phone: '+8801320-116040',
    dutyOfficerPhone: '+8801713-374829',
    lat: 22.4285,
    lng: 91.1042
  }
];

export const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a));
};

export const findNearestPoliceStation = (userLat: number, userLng: number) => {
  let minDistance = Infinity;
  let nearest = NOAKHALI_POLICE_STATIONS[0];

  NOAKHALI_POLICE_STATIONS.forEach(station => {
    const d = getDistanceKm(userLat, userLng, station.lat, station.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = station;
    }
  });

  return {
    station: nearest,
    distanceKm: Number(minDistance.toFixed(1))
  };
};
