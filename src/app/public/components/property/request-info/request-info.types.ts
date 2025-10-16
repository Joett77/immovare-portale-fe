export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface RequestInfoForm {
  name: string;
  lastname: string;
  email: string;
  phone: string;
  countryCode: string;
  message: string;
  privacyConsent: boolean;
  title: string;
  propertyId: number | null;
}
