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
// import Title from '@/components/layout/Title';
// import Loading from '@/components/core/DataLoading';

const DOMAIN = 'platAddrSup'; // 自己替换
const AddrEditContext = createContext();

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, platAddrSup }) => ({
  ...platAddrSup, // 代表与该组件相关redux的model
  loadingInfo: loading.effects[`${DOMAIN}/queryInfo`], // 点击编辑的loading
  loadingSave: loading.effects[`${DOMAIN}/supSave`], // 点击保存的loading
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { dispatch, formData, personData, ouData, custData, coopData } = props;
      const { name, value } = Object.values(changedFields)[0];
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
   * 页面样式显示之前，或者关键数据完成加载后要做的事情
   */
  componentWillMount() {
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
        type: `${DOMAIN}/queryInfo`,
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
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (values.abType === '03') {
          createMessage({ type: 'warn', description: '【地址薄类型】请选择【个人】或【公司】' });
        } else if (values.relateType.some(v => v === '02')) {
          dispatch({
            type: `${DOMAIN}/supSave`,
            payload: {
              abNo: no,
            },
          });
        } else {
          createMessage({ type: 'warn', description: '【相关主档】请包含【供应商】' });
        }
      }
    });
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    // 是否变更放在redux中
    const { tabkey, selectAbType, loadingInfo, loadingSave } = this.props;

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
            loading={loadingSave}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/plat/addr/sup')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <AddrEditContext.Provider value={this.getContext()}>
          <Card
            className="tw-card-multiTab"
            bordered={false}
            loading={loadingInfo}
            activeTabKey={tabkey}
          >
            <AddrEditT1 />
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
