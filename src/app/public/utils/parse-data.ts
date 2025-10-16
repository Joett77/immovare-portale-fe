export const parseEnergyClass = (energyClass: string) => {
  switch (energyClass) {
    case 'Classe A4':
      return 'A++++';
    case 'Classe A3':
      return 'A+++';
    case 'Classe A2':
      return 'A++';
    case 'Classe A1':
      return 'A+';
    case 'Classe A':
      return 'A';
    case 'Classe B':
      return 'B';
    case 'Classe C':
      return 'C';
    case 'Classe D':
      return 'D';
    case 'Classe E':
      return 'E';
    case 'Classe F':
      return 'F';
    case 'Classe G':
      return 'G';
    default:
      return energyClass;
  }
};
