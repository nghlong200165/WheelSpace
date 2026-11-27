// Fixed list of car makers for the "Hãng xe" field (admin) and filter (storefront).
// Makers Mini GT commonly produces; add or remove names here. Keep "Khác" last.
export const BRANDS = [
  "Acura",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Chevrolet",
  "Dodge",
  "Ford",
  "Honda",
  "Jaguar",
  "Koenigsegg",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Liberty Walk",
  "Lotus",
  "Mazda",
  "McLaren",
  "Mercedes-AMG",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Pagani",
  "Porsche",
  "Rolls-Royce",
  "Subaru",
  "Toyota",
  "Volkswagen",
  "Khác",
] as const;

export type Brand = (typeof BRANDS)[number];

export function isBrand(value: string): value is Brand {
  return (BRANDS as readonly string[]).includes(value);
}
