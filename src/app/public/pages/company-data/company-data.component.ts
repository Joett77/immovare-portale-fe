import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-company-data',
  standalone: true,
  imports: [],
  templateUrl: './company-data.component.html',
})
export class CompanyDataComponent implements OnInit {
  COMPANY_DATA = {
    companyName: 'IMMOVARE S.R.L.',
    companyType: 'Start Up Innovativa',
    sections: [
      {
        title: 'Sede Legale:',
        content: 'Via Corfù, 106 – 25124 Brescia (BS)',
      },
      {
        title: 'Sede Secondaria:',
        content: 'Via Giovanni Amendola, 172/C – Scala K4 – 70126 Bari (BA)',
      },
      {
        title: 'Partita IVA, Codice Fiscale e n. Registro Imprese:',
        content: '04288900980',
      },
      {
        title: 'REA C.C.I.A.A. Brescia:',
        content: 'BS-603287',
      },
      {
        title: 'REA C.C.I.A.A. Bari:',
        content: 'BA-642796',
      },
      {
        title: 'Capitale Sociale:',
        content: '€.50.000,00 I.V.',
      },
      {
        title: 'Polizza RC Professionale Agenti Immobiliari:',
        content: 'n.IAAPP000816 AIG Europe S.A.',
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
