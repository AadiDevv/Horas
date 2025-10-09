// Une fonction simple à tester
function somme(a: number, b: number): number {
  return a + b;
}

// Test Jest
describe('somme', () => {
  it('additionne deux nombres', () => {
    expect(somme(2, 3)).toBe(5);
  });

  it('fonctionne avec des nombres négatifs', () => {
    expect(somme(-2, -3)).toBe(-5);
  });
});
