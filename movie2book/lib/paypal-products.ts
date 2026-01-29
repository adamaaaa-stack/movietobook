/** One-time purchase products: book credits. */
export const PRODUCTS = [
  { id: '1', books: 1, price: '2.00', label: '1 book' },
  { id: '3', books: 3, price: '5.00', label: '3 books' },
  { id: '10', books: 10, price: '12.00', label: '10 books' },
] as const;

export type ProductId = (typeof PRODUCTS)[number]['id'];

export function getProduct(id: string): (typeof PRODUCTS)[number] | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
