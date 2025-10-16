import { FormControl, FormGroup } from "@angular/forms";
import { commercialTypeList, residentialTypeList } from "../mock/data";
import { PropertyFeature } from "../models";

export const getComponent = (components: google.maps.GeocoderAddressComponent[] | undefined, type: string): string | null => {
  if (!components) return null;
  const component = components.find((c) => c.types.includes(type));
  return component ? component.long_name : null;
}

export const updateAddressForm = (place: google.maps.places.PlaceResult, propertyAddressForm: FormGroup) => {
  const addressComponents = place.address_components;
  if (!addressComponents) return;

  const street = getComponent(addressComponents, 'route') || '';
  const street_number = getComponent(addressComponents, 'street_number') || '';
  const city = getComponent(addressComponents, 'locality') || '';
  const zip_code = getComponent(addressComponents, 'postal_code') || '';
  const country = getComponent(addressComponents, 'country') || '';

  // Use setTimeout to ensure the form controls are initialized
  setTimeout(() => {
    propertyAddressForm.patchValue(
      {
        street,
        street_number,
        zip_code,
        city,
        country,
      },
      { emitEvent: true }
    );
  });
}

export const getControl = (name: string, featureForm: FormGroup): FormControl => {
  return featureForm.get(name) as FormControl;
}
