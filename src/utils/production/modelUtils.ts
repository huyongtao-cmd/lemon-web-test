/**
 * 常用快速生成 updateState,updateForm,cleanState 方法
 * @param defaultState 清空状态方法的默认值
 */
const commonModelReducers = (defaultState:any)=> ({
  updateState:(state:any, { payload }:any ) => {
    return {
      ...state,
      ...payload,
    };
  },
  updateForm:(state:any, { payload }:any) => {
    const { formData } = state;
    return {
      ...state,
      formData: { ...formData, ...payload },
    };
  },

  cleanState:(state:any, { payload }:any) => {
    return defaultState;
  },
});


export {commonModelReducers};
