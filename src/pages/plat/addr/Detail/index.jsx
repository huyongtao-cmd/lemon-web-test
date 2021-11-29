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
import AddrDetT2 from './AddrDetT2';
import AddrDetT3 from './AddrDetT3';
import AddrDetT4 from './AddrDetT4';
import AddrDetT5 from './AddrDetT5';
import AddrDetT6 from './AddrDetT6';
import AddrDetT7 from './AddrDetT7';
import AddrDetT8 from './AddrDetT8';
import AddrDetT9 from './AddrDetT9';
import AddrDetT10 from './AddrDetT10';
import AddrDetT11 from './AddrDetT11';

const DOMAIN = 'platAddrDet'; // 自己替换
const AddrViewContext = createContext();

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, platAddrDet }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...platAddrDet, // 代表与该组件相关redux的model
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
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = (no, id) => {
    const { dispatch } = this.props;
    if (no && id) {
      // 总数据
      dispatch({
        type: `${DOMAIN}/query`,
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

  // 注意函数的写法，只有这样写，该函数的上下文this才是当前类，不然则是调用者的上下文
  onTabChange = key => {
    const { dispatch, formData, custData, supplierData, coopData } = this.props;
    const relateType = formData.relateType || '';
    const relateTypeArr = Array.isArray(relateType) ? relateType : relateType.split(',');
    if (formData.abNo) {
      // 公司不填个人信息 个人不填公司信息 BU两个都不填
      if (key === 'personDet' && formData.abType !== '01') {
        return;
      }
      if (key === 'compDet' && formData.abType !== '02') {
        return;
      }
      if (key === 'cust' && (!custData || !custData.abNo)) {
        return;
      }
      if (key === 'supply' && (!supplierData || !supplierData.abNo)) {
        return;
      }
      if (key === 'coop' && indexOf('03', relateTypeArr) < 0) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { tabkey: key },
      });
    }
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    // 是否变更放在redux中
    const { tabkey, tabModified, attachments, attachments1, attachments2 } = this.props;

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
              from ? closeThenGoto(from) : closeThenGoto('/plat/addr/list');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <AddrViewContext.Provider value={this.getContext()}>
          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={tabkey}
            tabList={[
              {
                key: 'basic',
                tab: <AddrDetT1.Title />,
              },
              {
                key: 'personDet',
                tab: <AddrDetT2.Title />,
              },
              {
                key: 'compDet',
                tab: <AddrDetT3.Title />,
              },
              {
                key: 'connInfo',
                tab: <AddrDetT4.Title />,
              },
              {
                key: 'bankInfo',
                tab: <AddrDetT5.Title />,
              },
              {
                key: 'invoice',
                tab: <AddrDetT6.Title />,
              },
              {
                key: 'address',
                tab: <AddrDetT7.Title />,
              },
              {
                key: 'code',
                tab: <AddrDetT8.Title />,
              },
              {
                key: 'cust',
                tab: <AddrDetT9.Title />,
              },
              {
                key: 'supply',
                tab: <AddrDetT10.Title />,
              },
              {
                key: 'coop',
                tab: <AddrDetT11.Title />,
              },
            ]}
            onTabChange={this.onTabChange}
          >
            {{
              basic: <AddrDetT1 />,
              personDet: <AddrDetT2 />,
              compDet: <AddrDetT3 />,
              connInfo: <AddrDetT4 />,
              bankInfo: <AddrDetT5 />,
              invoice: <AddrDetT6 />,
              address: <AddrDetT7 />,
              code: <AddrDetT8 />,
              cust: <AddrDetT9 />,
              supply: <AddrDetT10 />,
              coop: <AddrDetT11 />,
            }[tabkey] || <Loading />}
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
