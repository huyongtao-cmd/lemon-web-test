import { queryProvince, queryCity } from './geographic';

describe('Geographic should be strong', () => {
  it('queryProvince test', async () => {
    const { response } = await queryProvince();
    expect(response).toHaveLength(34);
  });
  it('queryCity test', async () => {
    const { response } = await queryCity({ province: '130000' });
    expect(response).toHaveLength(12);
  });
});
