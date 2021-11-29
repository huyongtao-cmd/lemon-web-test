import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'sysButempDetail';

@connect(({ loading, sysButempDetail, dispatch }) => ({
  loading,
  sysButempDetail,
  dispatch,
}))
class BuTemplateDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/queryEqvaList`, payload: { tmplId: param.id } });
  }

  render() {
    const {
      loading,
      dispatch,
      sysButempDetail: {
        formData,
        mode,
        subjtempList,
        financeList,
        roleList,
        incomeList,
        eqvaList,
        operateList,
        examPeriodList,
      },
    } = this.props;

    // // 让loading在页面正中心旋转，每次进页面只有一个loading
    // if (loading.effects[`${DOMAIN}/query`]) {
    //   return <PageLoading />;
    // }
    return <div className="text-center">敬请期待。。。</div>;
  }
}

export default BuTemplateDetail;
