describe('Grup de teste Demo pentru PawBook', () => {
  
  test('Ar trebui sa verifice o adunare simpla', () => {
    const rezultat = 2 + 2;
    expect(rezultat).toBe(4);
  });

  test('Ar trebui sa verifice ca un text se potriveste', () => {
    const numeSalon = 'PawBook';
    expect(numeSalon).toContain('Paw');
  });

});