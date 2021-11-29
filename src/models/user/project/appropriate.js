export default {
  namespace: 'userProjectAppropriate',
  state: {
    progressList: [], // 项目进度填报列表
    progressTotal: undefined,
    riskList: [], // 项目风险情况列表
    riskTotal: undefined,
    receiveList: [], // 确认收入分配列表，财务可以看到
    receiveTotal: undefined,
  },
  effects: {
    *query({ payload }, { call, put }) {
      // 拉项目，拉项目对应子合同，拉项目预算
      // 拉项目进度，拉项目风险
      // 拉确认收入分配
    },
  },
};
