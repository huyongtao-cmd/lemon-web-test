import React, { Component, createContext } from 'react';
import { connect } from 'dva';
import { Button, Card, Form } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import classnames from 'classnames';
import { isEmpty } from 'ramda';

import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
// import { selectUsers } from '@/services/sys/user';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { genFakeId } from '@/utils/mathUtils';
// import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';

import ProdDetT1 from './sysProdDetT1';
import ProdDetT2 from './sysProdDetT2';
import ProdDetT3 from './sysProdDetT3';

const DOMAIN = 'sysProductDetail';
const SysProdContext = createContext();

@connect(({ loading, sysProductDetail }) => ({
  loading,
  ...sysProductDetail,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class SysProductDetail extends Component {
  state = {
    id: 0,
    canEdit: 0,
    tabkey: 'baseInfo',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.initData();
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_PRODUCT_MANAGEMENT_SAVE' },
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { id, canEdit } = fromQs();
    if (prevState.id !== id || +prevState.canEdit !== +canEdit) {
      return { id, canEdit: +canEdit };
      // this.initData();
    }
    return null;
  }

  initData = () => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (param.id) {
      this.fetchPageData(param.id);
      this.setState({
        id: param.id,
      });
    } else {
      this.fetchTree();
    }

    this.setState({
      canEdit: +param.canEdit,
    });
  };

  onTabChange = tabkey => {
    const param = fromQs();
    if (param.id) {
      this.setState({ tabkey });
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

  fetchPageData = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/fetch`,
      payload: {
        id,
      },
    }).then(() => {
      // 产品大类有值的时候，加载产品小类下拉数据源
      const {
        formData: { classId },
      } = this.props; // 表单数据返回后在获取classId，提前获取会取不到值
      if (classId && classId > 0) {
        dispatch({
          type: `${DOMAIN}/subTree`,
          payload: { pId: classId },
        });
      }
    });
    dispatch({
      type: `${DOMAIN}/queryCaseList`,
      payload: {
        id,
      },
    });
    this.fetchTree();
  };

  fetchTree = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/tree`,
    });
  };

  handleCardCheck = ({ target: { checked } }, item) => {
    const { dispatch, checkedItem } = this.props;
    // 勾选添加，不勾选去除
    if (checked) {
      // console.log('add item');
      if (!checkedItem.some(check => check.id === item.id)) {
        checkedItem.push(item);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            checkedItem,
          },
        });
      }
    } else {
      // console.log('evict item');
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          checkedItem: checkedItem.filter(check => check.id !== item.id),
        },
      });
    }
  };

  handleAddCards = () => {
    const { dispatch, caseList } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        // 不可以用push，数组是引用类型不会触发对象修改
        caseList: caseList.concat([
          {
            // id: -Date.now(), // hack, 不是必须的，但是dom-diff要当key用。
            id: genFakeId(-1),
          },
        ]),
      },
    });
  };

  handleDelCards = () => {
    const { dispatch, caseList, checkedItem } = this.props;
    // 过滤掉delete项重新update
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        caseList: caseList.filter(item => !checkedItem.some(check => check.id === item.id)),
      },
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      caseList,
    } = this.props;

    const { id, from } = fromQs();
    const { tabkey } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        switch (tabkey) {
          default:
          case 'baseInfo':
            dispatch({
              type: `${DOMAIN}/save`,
              payload: { from },
            });
            break;
          case 'prodCase':
            dispatch({
              type: `${DOMAIN}/saveProdCase`,
              payload: {
                buProdId: id,
                prodCaseList: caseList,
              },
            }).then(({ status, reason }) => {
              if (status === 100) {
                // 主动取消请求
                return;
              }
              if (reason === 'OK') {
                createMessage({
                  type: 'success',
                  description: '保存案例成功。',
                });
                this.initData();
              } else if (reason === 'NG_CASE_NAME') {
                createMessage({ type: 'error', description: `请填写产品名称。` });
              } else {
                createMessage({
                  type: 'error',
                  description: '保存案例失败。',
                });
              }
            });
            break;
          case 'prodCate':
            dispatch({
              type: `${DOMAIN}/saveCate`,
            }).then(({ status, reason }) => {
              if (status === 100) {
                // 主动取消请求
                return;
              }
              if (reason === 'OK') {
                createMessage({
                  type: 'success',
                  description: '保存产品类别码成功。',
                });
                this.initData();
              } else {
                createMessage({
                  type: 'error',
                  description: '保存产品类别码失败。',
                });
              }
            });
        }
      }
    });
  };

  handleUploadPic = formData => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/uploadPic`,
      payload: formData,
    });
  };

  getContext = () => {
    const {
      markTab,
      handleSaveCards,
      handleAddCards,
      handleDelCards,
      handleCardCheck,
      handleUploadPic,
      props: {
        form: { getFieldDecorator },
        dispatch,
        formData,
        treeData,
        subTreeData,
        caseList,
      },
      state: { tabkey, canEdit, id },
    } = this;

    return {
      dispatch,
      markTab,
      getFieldDecorator,
      handleSaveCards,
      handleAddCards,
      handleDelCards,
      handleCardCheck,
      handleUploadPic,
      id,
      formData,
      treeData,
      subTreeData,
      tabkey,
      canEdit,
      caseList,
    };
  };

  render() {
    const { tabkey, canEdit, id } = this.state;
    const { tabModified, loading, formData, pageConfig } = this.props;
    const { from } = fromQs();
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/fetch`] ||
      !!loading.effects[`${DOMAIN}/queryCaseList`] ||
      !!loading.effects[`${DOMAIN}/tree`] ||
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/saveCate`] ||
      !!loading.effects[`${DOMAIN}/saveProdCase`];
    return (
      <PageHeaderWrapper title="产品明细" id="prodDetailContent">
        <SysProdContext.Provider value={this.getContext()}>
          <Card className="tw-card-rightLine">
            {canEdit ? (
              <Button
                className="tw-btn-primary"
                type="primary"
                icon="save"
                size="large"
                disabled={disabledBtn}
                onClick={this.handleSave}
              >
                {formatMessage({ id: `misc.save`, desc: '保存' })}
              </Button>
            ) : (
              <Button
                className="tw-btn-primary"
                type="primary"
                icon="save"
                size="large"
                onClick={() => {
                  router.push(`/plat/market/productdetail?canEdit=1&id=${id}&from=${from}`);
                  // router.go();
                }}
              >
                {formatMessage({ id: `misc.edit`, desc: '编辑' })}
              </Button>
            )}
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() =>
                from === 'sys'
                  ? router.push('/plat/market/product')
                  : router.push('/org/bu/myproduct')
              }
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={tabkey}
            tabList={[
              {
                key: 'baseInfo',
                tab: (
                  <Title
                    dir="right"
                    icon={tabModified[0] ? 'warning' : null}
                    id="sys.baseinfo.prodDet.primary"
                    defaultMessage="基本信息"
                  />
                ),
              },
              {
                key: 'prodCase',
                tab: (
                  <span className={canEdit === 1 && !id ? 'tw-card-multiTab-disabled' : undefined}>
                    <Title
                      className={canEdit === 1 && !id ? 'tw-card-multiTab-disabled' : undefined}
                      dir="right"
                      icon={tabModified[1] ? 'warning' : null}
                      id="sys.baseinfo.prodDet.contacts"
                      defaultMessage="成功案例"
                    />
                  </span>
                ),
              },
              {
                key: 'prodCate',
                tab: (
                  <span className={canEdit === 1 && !id ? 'tw-card-multiTab-disabled' : undefined}>
                    <Title
                      dir="right"
                      icon={tabModified[2] ? 'warning' : null}
                      id="sys.baseinfo.prodDet.eduBg"
                      defaultMessage="类别码"
                    />
                  </span>
                ),
              },
            ]}
            onTabChange={this.onTabChange}
          >
            {
              {
                baseInfo: <ProdDetT1 onFieldChange={() => this.markTab(0)} />,
                prodCase: <ProdDetT2 onFieldChange={() => this.markTab(1)} />,
                prodCate: <ProdDetT3 onFieldChange={() => this.markTab(2)} />,
              }[tabkey]
            }
          </Card>
        </SysProdContext.Provider>
      </PageHeaderWrapper>
    );
  }
}

// 将上下文导出供子页面使用
export { SysProdContext, DOMAIN };

export default SysProductDetail;
