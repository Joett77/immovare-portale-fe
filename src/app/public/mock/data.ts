import { ApartmentIconComponent } from '../../shared/atoms/icons/apartment-icon/apartment-icon.component';
import { AtticIconComponent } from '../../shared/atoms/icons/attic-icon/attic-icon.component';
import { BalconyIconComponent } from '../../shared/atoms/icons/balcony-icon/balcony-icon.component';
import { BasementIconComponent } from '../../shared/atoms/icons/basement-icon/basement-icon.component';
import { CastelIconComponent } from '../../shared/atoms/icons/castel-icon/castel-icon.component';
import { ChurchIconComponent } from '../../shared/atoms/icons/church-icon/church-icon.component';
import { ColiseumIconComponent } from '../../shared/atoms/icons/coliseum-icon/coliseum-icon.component';
import { DepositIconComponent } from '../../shared/atoms/icons/deposit-icon/deposit-icon.component';
import { DuomoIconComponent } from '../../shared/atoms/icons/duomo-icon/duomo-icon.component';
import { ElevatorIconComponent } from '../../shared/atoms/icons/elevator-icon/elevator-icon.component';
import { GarageIconComponent } from '../../shared/atoms/icons/garage-icon/garage-icon.component';
import { GardenIconComponent } from '../../shared/atoms/icons/garden-icon/garden-icon.component';
import { GothicChurchIconComponent } from '../../shared/atoms/icons/gothic-church-icon/gothic-church-icon.component';
import { LabIconComponent } from '../../shared/atoms/icons/lab-icon/lab-icon.component';
import { LoftIconComponent } from '../../shared/atoms/icons/loft-icon/loft-icon.component';
import { OfficeIconComponent } from '../../shared/atoms/icons/office-icon/office-icon.component';
import { PalaceIconComponent } from '../../shared/atoms/icons/palace-icon/palace-icon.component';
import { ParkIconComponent } from '../../shared/atoms/icons/park-icon/park-icon.component';
import { PenthouseIconComponent } from '../../shared/atoms/icons/penthouse-icon/penthouse-icon.component';
import { PoolIconComponent } from '../../shared/atoms/icons/pool-icon/pool-icon.component';
import { ShedIconComponent } from '../../shared/atoms/icons/shed-icon/shed-icon.component';
import { ShopIconComponent } from '../../shared/atoms/icons/shop-icon/shop-icon.component';
import { TerraceIconComponent } from '../../shared/atoms/icons/terrace-icon/terrace-icon.component';
import { TerracedVillasIconComponent } from '../../shared/atoms/icons/terraced-villas-icon/terraced-villas-icon.component';
import { TurismLicenseIconComponent } from '../../shared/atoms/icons/turism-license-icon/turism-license-icon.component';
import { VillasIconComponent } from '../../shared/atoms/icons/villas-icon/villas-icon.component';
import { WarehouseIconComponent } from '../../shared/atoms/icons/warehouse-icon/warehouse-icon.component';
import { FAQItem, FavoriteProperties, NotLoggedSection, SavedSearches } from '../models';

export const propertyFloorList = [
  {
    id: 1,
    label: 'Piano terra',
    value: 'Piano terra',
  },
  {
    id: 2,
    label: 'Piano rialzato',
    value: 'Piano rialzato',
  },
  {
    id: 3,
    label: 'Ultimo piano',
    value: 'Ultimo piano',
  },
  {
    id: 4,
    label: 'Intero stabile',
    value: 'Intero stabile',
  },
  {
    id: 5,
    label: 'Seminterrato',
    value: 'Seminterrato',
  },
  {
    id: 6,
    label: 'Piano intermedio',
    value: 'Piano intermedio',
  },
  {
    id: 7,
    label: 'Piano ammezzato',
    value: 'Piano ammezzato',
  },
];

export const propertyHeatingList = [
  {
    id: 1,
    label: 'Autonomo',
    value: 'Autonomo',
  },
  {
    id: 2,
    label: 'Centralizzato',
    value: 'Centralizzato',
  },
  {
    id: 3,
    label: 'Assente',
    value: 'Assente',
  },
];

export const propertyStatusList = [
  {
    id: 1,
    label: 'Qualsiasi',
    value: 'Qualsiasi',
  },
  {
    id: 2,
    label: 'Nuovo costruzione',
    value: 'Nuovo costruzione',
  },
  {
    id: 3,
    label: 'Ristrutturato',
    value: 'Ristrutturato',
  },
  {
    id: 4,
    label: 'Da ristrutturare',
    value: 'Da ristrutturare',
  },
  {
    id: 5,
    label: 'In costruzione',
    value: 'In costruzione',
  },
];

export const residentialCleanTypeList = [
  { id: 0, value: '', label: 'Nessuna tipologia' },
  {
    id: 1,
    label: 'Appartamento',
    value: 'Appartamento',
    icon: ApartmentIconComponent,
  },
  {
    id: 2,
    label: 'Villa Indipendente',
    value: 'Villa Indipendente',
    icon: VillasIconComponent,
  },
  {
    id: 3,
    label: 'Villetta a schiera',
    value: 'Villetta a schiera',
    icon: TerracedVillasIconComponent,
  },
  {
    id: 4,
    label: 'Loft/Open space',
    value: 'Loft/Open space',
    icon: LoftIconComponent,
  },
  {
    id: 5,
    label: 'Mansarda',
    value: 'Mansarda',
    icon: AtticIconComponent,
  },
  {
    id: 6,
    label: 'Attico',
    value: 'Attico',
    icon: PenthouseIconComponent,
  },
];

export const residentialTypeList = [
  {
    id: 1,
    label: 'Appartamento',
    value: 'Appartamento',
    icon: ApartmentIconComponent,
  },
  {
    id: 2,
    label: 'Villa Indipendente',
    value: 'Villa Indipendente',
    icon: VillasIconComponent,
  },
  {
    id: 3,
    label: 'Villetta a schiera',
    value: 'Villetta a schiera',
    icon: TerracedVillasIconComponent,
  },
  {
    id: 4,
    label: 'Loft/Open space',
    value: 'Loft/Open space',
    icon: LoftIconComponent,
  },
  {
    id: 5,
    label: 'Mansarda',
    value: 'Mansarda',
    icon: AtticIconComponent,
  },
  {
    id: 6,
    label: 'Attico',
    value: 'Attico',
    icon: PenthouseIconComponent,
  },
];

export const commercialTypeList = [
  {
    id: 1,
    label: 'Negozio',
    icon: ShopIconComponent,
  },
  {
    id: 2,
    label: 'Ufficio',
    icon: OfficeIconComponent,
  },
  {
    id: 3,
    label: 'Laboratorio',
    icon: LabIconComponent,
  },
  {
    id: 4,
    label: 'Magazzino',
    icon: WarehouseIconComponent,
  },
  {
    id: 5,
    label: 'Capannone',
    icon: ShedIconComponent,
  },
  {
    id: 6,
    label: 'Deposito',
    icon: DepositIconComponent,
  },
];

export const propertyDestinations = [
  {
    id: 1,
    label: 'Residenziale',
    icon: VillasIconComponent,
  },
  {
    id: 2,
    label: 'Commerciale',
    icon: ShopIconComponent,
  },
];

export const propertySpaceFeatures = [
  {
    id: 2,
    label: 'Piano',
    key: 'floor_number',
  },
  {
    id: 3,
    label: 'Numero di stanze',
    key: 'number_rooms',
  },
  {
    id: 4,
    label: 'Numero di bagni',
    key: 'bathroom_number',
  },
];

export const extraFeatures = [
  {
    id: 1,
    label: 'Balcone',
    icon: BalconyIconComponent,
  },
  {
    id: 2,
    label: 'Ascensore',
    icon: ElevatorIconComponent,
  },
  {
    id: 3,
    label: 'Garage',
    icon: GarageIconComponent,
  },
  {
    id: 4,
    label: 'Giardino',
    icon: GardenIconComponent,
  },
  {
    id: 5,
    label: 'Parcheggio',
    icon: ParkIconComponent,
  },
  {
    id: 6,
    label: 'Cantina',
    icon: BasementIconComponent,
  },
  {
    id: 7,
    label: 'Piscina',
    icon: PoolIconComponent,
  },
  {
    id: 8,
    label: 'Terrazzo',
    icon: TerraceIconComponent,
  },
  {
    id: 9,
    label: 'Licenza Turistica',
    icon: TurismLicenseIconComponent,
  },
];

export const freePlan = {
  title: 'Free',
  callout: 'Prova <span>Gratis</span> per 30 giorni',
  price: '€ 0',
  promoText: 'Puoi disdire in qualuque momento',
  switch: false,
  select: false,
  features: [
    { title: 'Assistenza remota', included: true },
    { title: "Accesso a un'area personale dedicata", included: true },
    { title: 'Pubblicazione su Immovare.it', included: true },
    { title: 'Pubblicazione su Wikicasa', included: true },
    { title: 'Pubblicazione su Immobiliare.it', included: false },
    { title: 'Pubblicazione su Idealista.it', included: false },
    { title: 'Pubblicazione su Casa.it', included: false },
    { title: 'Pubblicazione su Trovacasa.it', included: false },
    { title: 'Pubblicazione su Commerciali.it', included: false },
    { title: "Redazione del testo per l'annuncio immobiliare", included: false },
    { title: 'Consulente personale', included: false },
    { title: 'Controllo e certificazione documentale', included: false },
    { title: 'Servizio fotografico professionale', included: false },
    { title: 'Virtual tour 3D con tecnologia Matterport', included: false },
  ],
};

export const proPlan = {
  title: 'PRO',
  callout: 'Professionalità a 360° gradi per vendere la tua casa.',
  price: '€ 19,90/mese*',
  promoText: 'IVA inclusa\n*Puoi disdire in qualunque momento',
  switch: false,
  select: true,
  features: [
    { title: 'Assistenza remota', included: true },
    { title: "Accesso a un'area personale dedicata", included: true },
    { title: 'Pubblicazione su Immovare.it', included: true },
    { title: 'Pubblicazione su Wikicasa', included: true },
    { title: 'Pubblicazione su Immobiliare.it', included: true },
    { title: 'Pubblicazione su Idealista.it', included: true },
    { title: 'Pubblicazione su Casa.it', included: true },
    { title: 'Pubblicazione su Trovacasa.it', included: true },
    { title: 'Pubblicazione su Commerciali.it', included: true },
    { title: "Redazione del testo per l'annuncio immobiliare", included: true },
    { title: 'Consulente personale', included: true },
    { title: 'Controllo e certificazione documentale', included: true },
    { title: 'Servizio fotografico professionale', included: false },
    { title: 'Virtual tour 3D con tecnologia Matterport', included: false },
  ],
};

export const exclusivePlan = {
  title: 'Exclusive',
  callout: 'Dai valore alla vendita con servizi esclusivi!',
  price: '€ 39/mese*',
  promoText: 'IVA inclusa\n*Vincolo di 6 mesi',
  select: true,
  features: [
    { title: 'Assistenza remota', included: true },
    { title: "Accesso a un'area personale dedicata", included: true },
    { title: 'Pubblicazione su Immovare.it', included: true },
    { title: 'Pubblicazione su Wikicasa', included: true },
    { title: 'Pubblicazione su Immobiliare.it', included: true },
    { title: 'Pubblicazione su Idealista.it', included: true },
    { title: 'Pubblicazione su Casa.it', included: true },
    { title: 'Pubblicazione su Trovacasa.it', included: true },
    { title: 'Pubblicazione su Commerciali.it', included: true },
    { title: "Redazione del testo per l'annuncio immobiliare", included: true },
    { title: 'Consulente personale', included: true },
    { title: 'Controllo e certificazione documentale', included: true },
    { title: 'Servizio fotografico professionale', included: true },
    { title: 'Virtual tour 3D con tecnologia Matterport', included: true },
  ],
};

export const faqSellItems: FAQItem[] = [
  {
    question: "Che cos'è Immovare.it?",
    answer:
      'Immovare.it non è solo un Agenzia Immobiliare On Line, ma anche un Portale Web ed una Software House che progetta e sviluppa soluzioni verticali rivolte ai clienti finali, con lo scopo di rendere più facile, sicuro ed economico il processo di compravendita immobiliare.',
    isOpen: false,
  },
  {
    question: 'Perché vendere casa con Immovare.it?',
    answer: 'La risposta dipende dalle tue esigenze specifiche...',
    isOpen: false,
  },
  {
    question: 'È possibile vendere casa velocemente?',
    answer: 'Sì, è possibile ottimizzare i tempi di vendita...',
    isOpen: false,
  },
  {
    question: 'Come scegliere il Piano più adatto alle mie esigenze?',
    answer: 'La scelta del piano dipende da diversi fattori...',
    isOpen: false,
  },
];

export const faqBuyItems: FAQItem[] = [
  {
    question: "Che cos'è Immovare.it?",
    answer:
      'Immovare.it non è solo un Agenzia Immobiliare On Line, ma anche un Portale Web ed una Software House che progetta e sviluppa soluzioni verticali rivolte ai clienti finali, con lo scopo di rendere più facile, sicuro ed economico il processo di compravendita immobiliare.',
    isOpen: false,
  },
  {
    question: 'Perché vendere casa con Immovare.it?',
    answer: 'La risposta dipende dalle tue esigenze specifiche...',
    isOpen: false,
  },
  {
    question: 'È possibile vendere casa velocemente?',
    answer: 'Sì, è possibile ottimizzare i tempi di vendita...',
    isOpen: false,
  },
  {
    question: 'Come scegliere il Piano più adatto alle mie esigenze?',
    answer: 'La scelta del piano dipende da diversi fattori...',
    isOpen: false,
  },
];

export const mapImage: string = '/assets/maps.png';

export const savedSearches: SavedSearches[] = [
  {
    id: 1,
    location: 'Milano - Tutto il comune',
    details: 'Appartamento, Villa, Nuove costruzioni',
    rooms: 3,
    area: 400,
    type: 'locali',
    price: '€ 300k - 400k',
    image: '/assets/maps.png',
  },
  {
    id: 2,
    location: 'Milano - Tutto il comune',
    details: 'Appartamento, Villa, Nuove costruzioni',
    rooms: 3,
    area: 400,
    type: 'locali',
    price: '€ 300k - 400k',
    image: '/assets/maps.png',
  },
  {
    id: 3,
    location: 'Milano - Tutto il comune',
    details: 'Appartamento, Villa, Nuove costruzioni',
    rooms: 3,
    area: 400,
    type: 'locali',
    price: '€ 300k - 400k',
    image: '/assets/maps.png',
  },
  {
    id: 4,
    location: 'Milano - Tutto il comune',
    details: 'Appartamento, Villa, Nuove costruzioni',
    rooms: 3,
    area: 400,
    type: 'locali',
    price: '€ 300k - 400k',
    image: '/assets/maps.png',
  },
  {
    id: 5,
    location: 'Milano - Tutto il comune',
    details: 'Appartamento, Villa, Nuove costruzioni',
    rooms: 3,
    area: 400,
    type: 'locali',
    price: '€ 300k - 400k',
    image: '/assets/maps.png',
  },
];

export const favoriteProperties: FavoriteProperties[] = [
  {
    id: 1,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 2,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 3,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 4,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 5,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 6,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 7,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 8,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 9,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
  {
    id: 10,
    details_1: ' MARINA DI PULSANO - TA - PUGLIA',
    location_1: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    subtle: 'Villa indipendente',
    rooms_1: 3,
    type_1: 'locali',
    size: '400 m2',
    bathrooms: 4,
    price_1: ' 320.000,00 €',
    image_1: '/assets/case.png',
  },
];

export const notLoggedSavedSearches: NotLoggedSection = {
  titleSection: 'Iscriviti per salvare le ricerche effettuate',
  bulletPoints: [
    'Riunisci in un unico posto le ricerche che ti interessano.',
    'Non perderti i nuovi immobili caricati nella zona di interesse.',
    'Ottimizza il tuo tempo concentrandoti sulle caratteristiche della tua futura casa!',
  ],
  button: true,
};

export const notLoggedFavoriteProperties: NotLoggedSection = {
  titleSection: 'Iscriviti per salvare gli immobili preferiti',
  bulletPoints: [
    'Riunisci in un unico posto gli immobili che preferisci.',
    'Condivi i tuoi preferiti con familiari e amici.',
    'Rimani aggiornato sullo stato e i prezzi degli immobili che segui.',
  ],
  button: true,
};
export const emptyStateSavedSearches: NotLoggedSection = {
  titleSection: 'Nessuna ricerca salvata',
  emptySubTitle: 'Qui troverai le ricerche che hai salvato.',
  bulletPoints: [
    'Riunisci in un unico posto le ricerche che ti interessano.',
    'Non perderti i nuovi immobili caricati nella zona di interesse.',
    'Ottimizza il tuo tempo concentrandoti sulle caratteristiche della tua futura casa!',
  ],
  button: false,
};

export const emptyStateFavoriteProperties: NotLoggedSection = {
  titleSection: 'Nessun immobile aggiunto ai preferiti.',
  emptySubTitle: 'Qui troverai gli immobili che hai aggiunto ai preferiti.',
  bulletPoints: [
    'Riunisci in un unico posto gli immobili che preferisci.',
    'Condivi i tuoi preferiti con familiari e amici.',
    'Rimani aggiornato sullo stato e i prezzi degli immobili che segui.',
  ],
  button: false,
};
