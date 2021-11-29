import { getAuthority } from './authUtils';

describe('Testing Auth utils...', () => {
  it('empty', () => {
    expect(getAuthority(null)).toEqual(['admin']); // default value
  });

  it('string', () => {
    expect(getAuthority('admin')).toEqual(['admin']);
  });

  it('array with double quotes', () => {
    expect(getAuthority('"admin"')).toEqual(['admin']);
  });

  it('array with single item', () => {
    expect(getAuthority('["admin"]')).toEqual(['admin']);
  });

  it('array with multiple items', () => {
    expect(getAuthority('["admin", "guest"]')).toEqual(['admin', 'guest']);
  });
});
