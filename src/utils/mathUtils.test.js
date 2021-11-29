import { genFakeId } from './mathUtils';

describe('Testing Math utils...', () => {
  // 雪花算法测试
  it('snowflake algorithm test ->', () => {
    const totalIdGen = 100; // 生成总条数
    const values = Array(totalIdGen)
      .fill(0)
      .map(() => genFakeId(-1));

    console.log('ID matrix generated:');
    console.table(values);

    expect(values).toHaveLength(totalIdGen);
    // 判断生成的id不重复
    expect(values.some((item, idx) => values.indexOf(item) !== idx)).toBe(false);
  });
});
