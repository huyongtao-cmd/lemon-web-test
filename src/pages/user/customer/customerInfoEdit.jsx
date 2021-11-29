import React, { createContext } from 'react';
import { connect } from 'dva';
import { Button, Card, Form } from 'antd';
import classnames from 'classnames';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import update from 'immutability-helper';
import { indexOf, isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';

import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import AddrEditT0 from './components/AddrEditT0';
import AddrEditT1 from './components/AddrEditT1';
import AddrEditT2 from './components/AddrEditT2';
import AddrEditT3 from './components/AddrEditT3';
import AddrEditT4 from './components/AddrEditT4';
import AddrEditT5 from './components/AddrEditT5';
import AddrEditT6 from './components/AddrEditT6';
import AddrEditT7 from './components/AddrEditT7';
import AddrEditT8 from './components/AddrEditT8';

const DOMAIN = 'userCustEdit';
const AddrEditContext = createContext();

@connect(({ userCustEdit, customerCreate }) => ({ ...userCustEdit, customerCreate }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { dispatch, formData, codeData, personData, ouData, custData, coopData } = props;
      const { name, value } = Object.values(changedFields)[0];
      switch (props.tabkey) {
        default:
          break;
        case 'basic':
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
        case 'code':
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              codeData: update(codeData, {
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
  onValuesChange(props, changedValues) {
    if (props.tabkey === 'custDetail') {
      if (!isEmpty(changedValues)) {
        const { category } = changedValues;
        if (category) {
          props.dispatch({
            type: `customerCreate/updateForm`,
            payload: {
              custRegIon: category[0],
              provInce: category[1],
              city: category[2],
            },
          });
        }
        props.dispatch({
          type: `customerCreate/updateForm`,
          payload: changedValues,
        });
      }
    }
  },
})
@mountToTab()
class AddrEdit extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    if (props.getRef) {
      props.getRef(this);
    }
  }

  componentDidMount() {
    const { dispatch, isFlow, customerCreate } = this.props;
    const { id, no, isSubmit } = fromQs();
    dispatch({ type: `${DOMAIN}/updateState`, payload: isSubmit });
    dispatch({ type: 'customerCreate/clearForm' });
    dispatch({ type: 'customerCreate/res' }); // 拉取资源下拉表
    id &&
      dispatch({
        type: 'customerCreate/customerDetails',
        payload: id,
      });
    // 代办流程进入
    if (isFlow) {
      dispatch({
        type: `${DOMAIN}/initData`,
        payload: id,
      });
    } else {
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
  }

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

  getContext = () => ({
    ...this.props,
    markTab: this.markTab,
  });

  onTabChange = key => {
    const { dispatch, formData, custData, supplierData, coopData } = this.props;
    const relateType = formData.relateType || '';
    const relateTypeArr = Array.isArray(relateType) ? relateType : relateType.split(',');
    if (formData.abNo || key === 'basic' || key === 'custDetail') {
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
      if (key === 'coop' && (indexOf('03', relateTypeArr) < 0 || !coopData.id)) {
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
      tabkey,
    } = this.props;
    const { id, no } = fromQs();
    // if (isSubmit) {
    //   this.handleSaveAll()
    //   return;
    // }
    if (tabkey === 'custDetail') {
      // const {
      //   form: { validateFieldsAndScroll, setFields },
      //   customerCreate: {
      //     formData: {
      //       custRegIon,
      //       provInce,
      //       city,
      //       custStatus,
      //       switchBoard,
      //       companyEmail,
      //       headOfficeAddr,
      //       dataFrom,
      //       mark,
      //     },
      //   },
      // } = this.props;
      // if (custStatus === 'INACTIVE') {
      //   !mark &&
      //     setFields({
      //       mark: {
      //         value: undefined,
      //         errors: [new Error('必填')],
      //       },
      //     });
      // }
      // if (custStatus === 'ACTIVE') {
      //   (!custRegIon || !provInce || !city) &&
      //     setFields({
      //       category: {
      //         value: undefined,
      //         errors: [new Error('必填')],
      //       },
      //     });
      //   !switchBoard &&
      //     setFields({
      //       switchBoard: {
      //         value: undefined,
      //         errors: [new Error('必填')],
      //       },
      //     });
      //   !companyEmail &&
      //     setFields({
      //       companyEmail: {
      //         value: undefined,
      //         errors: [new Error('必填')],
      //       },
      //     });
      //   !headOfficeAddr &&
      //     setFields({
      //       headOfficeAddr: {
      //         value: undefined,
      //         errors: [new Error('必填')],
      //       },
      //     });
      //   !dataFrom &&
      //     setFields({
      //       dataFrom: {
      //         value: undefined,
      //         errors: [new Error('必填')],
      //       },
      //     });
      // }
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: 'customerCreate/save',
            payload: true,
          });
        }
      });
    } else {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/${tabkey}Save`,
            payload: {
              abNo: no,
            },
          }).then(abNo => {
            if (abNo && !no) {
              this.fetchData(abNo);
              router.replace(`?id=${id}&no=${abNo}`);
            }
          });
        }
      });
    }
  };

  handleSubmit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      tabkey,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.handleSaveAll();
      } else {
        createMessage({ type: 'error', description: `请输入必填项` });
      }
    });
  };

  // 校验表单信息
  checkFormValue = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      tabkey,
    } = this.props;
    let flag = false;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        flag = true;
      }
    });
    return flag;
  };

  handleSaveAll(flowPayload) {
    // 提交时需要一次保存所有tab数据
    const {
      isFlow,
      dispatch,
      form: { validateFieldsAndScroll },
      customerCreate,
      formData,
      personData,
      ouData,
      connList,
      connListDel,
      bankList,
      bankListDel,
      invoiceList,
      invoiceListDel,
      addressList,
      addressListDel,
      codeData,
    } = this.props;
    const { id } = fromQs();
    // eslint-disable-next-line prefer-destructuring
    let no = fromQs().no;
    if (isFlow) {
      no = customerCreate.formData.abNo;
    }
    const params = {
      custEntity: {
        ...customerCreate.formData,
        abNo: no,
      }, // 客户详情对象
      abEntity: {
        ...formData,
        custId: id,
        abNo: no,
      }, // 基本信息
      personEntity:
        formData.abType === '01'
          ? {
              ...personData,
              abNo: no,
            }
          : null, // 个人信息对象
      ouEntity:
        formData.abType === '02'
          ? {
              ...ouData,
              abNo: no,
            }
          : null, // 公司信息对象
      // 联系信息
      abContactSaveEntity:
        connList.length > 0 || connListDel.length > 0
          ? {
              abContactEntities: connList,
              ids: connListDel,
              abNo: no,
            }
          : null,
      // 银行账户
      abAccSaveEntity:
        bankList.length > 0 || bankListDel.length > 0
          ? {
              abAccEntities: bankList,
              ids: bankListDel,
              abNo: no,
            }
          : null,
      // 开票信息
      abInvinfoSaveEntity:
        invoiceList.length > 0 || invoiceListDel.length > 0
          ? {
              abInvoiceEntities: invoiceList,
              ids: invoiceListDel,
              abNo: no,
            }
          : null,
      // 地址信息
      abAddressSaveEntity:
        addressList.length > 0 || addressListDel.length > 0
          ? {
              abAddressEntities: addressList,
              ids: addressListDel,
              abNo: no,
            }
          : null,
      catEntity: no
        ? {
            // 类别码
            ...formData,
            ...codeData,
            abNo: no,
          }
        : null,
    };

    let tempFlag = false;
    // console.log('params', params);
    // eslint-disable-next-line consistent-return
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveAll`,
          payload: flowPayload ? { ...params, flowPayload } : params,
          // eslint-disable-next-line consistent-return
        }).then(resp => {
          if (resp) {
            const { response } = resp;
            if (response && response.ok) {
              if (response.datum && !flowPayload) {
                dispatch({
                  type: `${DOMAIN}/submit`,
                  payload: id,
                });
                // router.push(`/sale/management/customer`);
              } else if (response.datum) {
                closeThenGoto('/sale/management/customer');
              }
              createMessage({ type: 'success', description: response.reason });
              tempFlag = true;
            } else {
              createMessage({ type: 'error', description: response.reason });
              return tempFlag;
            }
          }
        });
      } else {
        createMessage({ type: 'error', description: `请输入必填项` });
        return tempFlag;
      }
    });
  }

  render() {
    const { tabkey, form, isFlow } = this.props;
    const { isSubmit } = fromQs();
    // console.log('tabkey', tabkey);
    return (
      <PageHeaderWrapper title="客户信息编辑">
        <Card className="tw-card-rightLine" style={isFlow ? { display: 'none' } : null}>
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={isSubmit ? this.handleSubmit : this.handleSave}
          >
            {formatMessage(
              isSubmit ? { id: `misc.submit`, desc: '提交' } : { id: `misc.save`, desc: '保存' }
            )}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/sale/management/customer')}
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
                key: 'custDetail',
                tab: <AddrEditT0.Title />,
              },
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
            ]}
            onTabChange={this.onTabChange}
          >
            {{
              custDetail: <AddrEditT0 form={form} />,
              basic: <AddrEditT1 />,
              personDet: <AddrEditT2 />,
              compDet: <AddrEditT3 />,
              connInfo: <AddrEditT4 />,
              bankInfo: <AddrEditT5 />,
              invoice: <AddrEditT6 />,
              address: <AddrEditT7 />,
              code: <AddrEditT8 />,
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
