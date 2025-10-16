import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface PlanForm {
  id: FormControl<string | undefined>;
  title: FormControl<string>;
  description: FormControl<string>;
  interval?: FormControl<number>;
  price: FormControl<number>;
  priceDescription: FormControl<string>;
  type?: FormControl<string>;
  isService: FormControl<boolean>;
  serviceList?: FormArray<
    FormGroup<{
      name: FormControl<string>;
      description: FormControl<string>;
      type: FormControl<string>;
    }>
  >;
  tag: FormControl<string>;
  free?: FormControl<boolean>;
}

export interface PlanFormValue {
  id?: string;
  title: string;
  description: string;
  interval: string;
  price: number;
  priceDescription: string;
  type?: string;
  isService: boolean;
  serviceList: { name: string; description: string; type: string }[];
  tag?: string;
  free?: boolean;
}
