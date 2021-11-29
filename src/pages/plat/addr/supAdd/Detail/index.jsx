import React, { createContext } from 'react';
import { connect } from 'dva';
import { Button, Card, Form } from 'antd';
import classnames from 'classnames';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { indexOf } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import AddrDetT1 from './AddrDetT1';

const DOMAIN = 'platAddrSup'; // 自己替换
const AddrViewContext = createContext();

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, platAddrSup }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...platAddrSup, // 代表与该组件相关redux的model
  loading: loading.effects[`${DOMAIN}/queryInfo`],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { dispatch } = props;
      const { name, value } = Object.values(changedFields)[0];
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class AddrDet extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    // this.setState({});
  }

  /**
   * 页面样式显示完成后，或者关键数据完成加载后要做的事情
   */
  componentDidMount() {
    // const { dispatch } = this.props;
    const { dispatch } = this.props;
    const { no, id } = fromQs();
    if (no && id) {
      this.fetchData(no, id);
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
    // 母公司
    dispatch({
      type: `${DOMAIN}/queryAddrSel`,
      payload: { no },
    });
    // 法人地址
    dispatch({
      type: `${DOMAIN}/queryAbOuSel`,
      payload: { no },
    });
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = (no, id) => {
    const { dispatch } = this.props;
    if (no && id) {
      // 总数据
      dispatch({
        type: `${DOMAIN}/queryInfo`,
        payload: { no, id },
      });
    } else {
      dispatch({ type: `${DOMAIN}/clearForm` });
    }
  };

  // 把要传递到子tab页面的属性啊什么的放在这个函数里面
  getContext = () => ({
    ...this.props,
  });

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    // 是否变更放在redux中
    const { tabkey, tabModified, loading } = this.props;

    // 每一个页面组件都是由一个PageHeaderWrapper来控制全局样式的。
    // 里面可能是很多的card，或者是自定义内容。如果很复杂，可以把复杂内容做成子组件放在同级目录下import进来
    return (
      <PageHeaderWrapper title="地址详细">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              from ? closeThenGoto(from) : closeThenGoto('/plat/addr/sup');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <AddrViewContext.Provider value={this.getContext()}>
          <Card
            className="tw-card-multiTab"
            bordered={false}
            loading={loading}
            activeTabKey={tabkey}
          >
            <AddrDetT1 />
          </Card>
        </AddrViewContext.Provider>
        <br />
      </PageHeaderWrapper>
    );
  }
}

// 将上下文导出供子页面使用 领域业务名称 + Context
export { AddrViewContext, DOMAIN };

export default AddrDet;
