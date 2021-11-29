import React, { createContext } from 'react';
import { connect } from 'dva';
import { Button, Card, Form } from 'antd';
import classnames from 'classnames';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import update from 'immutability-helper';
import { indexOf, isEmpty } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import Loading from '@/components/core/DataLoading';

import AddrEditT1 from './AddrEditT1'; // eslint-disable-line
import AddrEditT2 from './AddrEditT2'; // eslint-disable-line
import AddrEditT3 from './AddrEditT3'; // eslint-disable-line
import AddrEditT4 from './AddrEditT4'; // eslint-disable-line
import AddrEditT5 from './AddrEditT5'; // eslint-disable-line
import AddrEditT6 from './AddrEditT6'; // eslint-disable-line
import AddrEditT7 from './AddrEditT7'; // eslint-disable-line
import AddrEditT8 from './AddrEditT8'; // eslint-disable-line
import AddrEditT9 from './AddrEditT9'; // eslint-disable-line
import AddrEditT10 from './AddrEditT10'; // eslint-disable-line
import AddrEditT11 from './AddrEditT11'; // eslint-disable-line
// import Title from '@/components/layout/Title';
// import Loading from '@/components/core/DataLoading';

const DOMAIN = 'platAddrEdit'; // 自己替换
const AddrEditContext = createContext();

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, platAddrEdit }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...platAddrEdit, // 代表与该组件相关redux的model
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { dispatch, formData, personData, ouData, custData, coopData } = props;
      const { name, value } = Object.values(changedFields)[0];
      // console.log('changedFields ->', { [name]: value });
      // 前3个tab页跟类别码是表单形式保存的，中间4个是行编辑，在自己的组件内保存。
      // 其实每一个tab页一个form比较好，最早设计的时候页面之间有关联关系不太好做校验，现在没有了所以残留成这样了。
      switch (props.tabkey) {
        default:
          // 其他key不做处理
          break;
        case 'basic':
        case 'code':
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              formData: update(formData, {
                [name]: {
                  $set: value,
                },
              }),
            },
          });
          break;
        case 'cust':
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              custData: update(custData, {
                [name]: {
                  $set: value,
                },
              }),
            },
          });
          break;
        case 'personDet':
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              personData: update(personData, {
                [name]: {
                  $set: value,
                },
              }),
            },
          });
          break;
        case 'compDet':
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              ouData: update(ouData, {
                [name]: {
                  $set: value,
                },
              }),
            },
          });
          break;
        case 'coop':
          if (name === 'pdmResId') return;
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              coopData: update(coopData, {
                [name]: {
                  $set: value,
                },
              }),
            },
          });
          break;
      }
    }
  },
})
@mountToTab()
class AddrEdit extends React.PureComponent {
  /**
   * 页面样式显示完成后，或者关键数据完成加载后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { no } = fromQs();
    if (no) {
      this.fetchData(no);
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

  fetchData = no => {
    const { dispatch } = this.props;
    if (no) {
      // 总数据
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { no },
      });
    } else {
      dispatch({ type: `${DOMAIN}/clearForm` });
    }
  };

  // 把要传递到子tab页面的属性啊什么的放在这个函数里面
  getContext = () => ({
    ...this.props,
    markTab: this.markTab,
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

  // 标记tab字段修改
  markTab = index => {
    const { dispatch, tabModified } = this.props;
    // 这里只记录变化 任何字段输入都会触发
    if (!tabModified[index]) {
      tabModified[index] = 1;

      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          tabModified,
        },
      });
    }
  };

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      invoiceList,
      tabkey,
    } = this.props;

    const { no } = fromQs();

    if (tabkey === 'invoice') {
      // =====增值税专用发票/增值税电子专用发票（发票抬头、税号、地址、开户行、账户、电话、币种必填）
      const tt1 = invoiceList.filter(
        v =>
          (v.invType === 'EXCLUSIVE' || v.invType === 'ELEC_EXCLUSIVE') &&
          (!v.invTitle ||
            !v.taxNo ||
            !v.invAddr ||
            !v.bankName ||
            !v.accountNo ||
            !v.invTel ||
            !v.currCode)
      );
      if (!isEmpty(tt1)) {
        const index = invoiceList.findIndex(v => v.id === tt1[0].id);
        createMessage({
          type: 'warn',
          description: `请补全开票信息第${index +
            1}条数据中的发票抬头、税号、地址、开户行、账户、电话、币种信息!`,
        });
        return;
      }
      // =====增值税普通发票/增值税电子发票（发票抬头、税号、币种必填）
      const tt2 = invoiceList.filter(
        v =>
          (v.invType === 'NORMAL' || v.invType === 'ELEC_NORMAL') &&
          (!v.invTitle || !v.taxNo || !v.currCode)
      );
      if (!isEmpty(tt2)) {
        const index = invoiceList.findIndex(v => v.id === tt2[0].id);
        createMessage({
          type: 'warn',
          description: `请补全开票信息第${index + 1}条数据中的发票抬头、税号、币种信息!`,
        });
        return;
      }
    }

    // if (tabkey === 'basic') {
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/${tabkey}Save`,
          payload: {
            abNo: no,
          },
          // 新增的时候如果保存成功，后端返回abNo之后重新刷新页面
        }).then(abNo => {
          if (!abNo) {
            return;
          }
          // 第一次新增成功返回abNo，拉取详情
          if (abNo && !no) {
            this.fetchData(abNo);
            router.replace('?no=' + abNo);
          } else {
            // 修改时通过no拉取详情
            this.fetchData(no);
          }
        });
      }
    });
    // }
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    // 是否变更放在redux中
    const { tabkey, tabModified } = this.props;

    // 每一个页面组件都是由一个PageHeaderWrapper来控制全局样式的。
    // 里面可能是很多的card，或者是自定义内容。如果很复杂，可以把复杂内容做成子组件放在同级目录下import进来
    return (
      <PageHeaderWrapper title="地址编辑">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/plat/addr/list')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <AddrEditContext.Provider value={this.getContext()}>
          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={tabkey}
            tabList={[
              {
                key: 'basic',
                tab: <AddrEditT1.Title />,
              },
              {
                key: 'personDet',
                tab: <AddrEditT2.Title />,
              },
              {
                key: 'compDet',
                tab: <AddrEditT3.Title />,
              },
              {
                key: 'connInfo',
                tab: <AddrEditT4.Title />,
              },
              {
                key: 'bankInfo',
                tab: <AddrEditT5.Title />,
              },
              {
                key: 'invoice',
                tab: <AddrEditT6.Title />,
              },
              {
                key: 'address',
                tab: <AddrEditT7.Title />,
              },
              {
                key: 'code',
                tab: <AddrEditT8.Title />,
              },
              {
                key: 'cust',
                tab: <AddrEditT9.Title />,
              },
              {
                key: 'supply',
                tab: <AddrEditT10.Title />,
              },
              {
                key: 'coop',
                tab: <AddrEditT11.Title />,
              },
            ]}
            onTabChange={this.onTabChange}
          >
            {{
              basic: <AddrEditT1 />,
              personDet: <AddrEditT2 />,
              compDet: <AddrEditT3 />,
              connInfo: <AddrEditT4 />,
              bankInfo: <AddrEditT5 />,
              invoice: <AddrEditT6 />,
              address: <AddrEditT7 />,
              code: <AddrEditT8 />,
              cust: <AddrEditT9 />,
              supply: <AddrEditT10 />,
              coop: <AddrEditT11 />,
            }[tabkey] || <Loading />}
          </Card>
        </AddrEditContext.Provider>
        <br />
      </PageHeaderWrapper>
    );
  }
}

// 将上下文导出供子页面使用 领域业务名称 + Context
export { AddrEditContext, DOMAIN };

export default AddrEdit;
