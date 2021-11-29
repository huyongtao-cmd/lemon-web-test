import React, { Component } from 'react';
import { connect } from 'dva';
import { type, isEmpty, equals, isNil } from 'ramda';
import { Form, Select, Icon, Modal, Button, Row, Col, Transfer, Input } from 'antd';
import BaseSelect from '@/components/production/basic/BaseSelect';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import styles from './RelatedDocs.less';

const DOMAIN = 'contractFlowApprove';

@connect(({ contractFlowApprove, dispatch }) => ({
  ...contractFlowApprove,
  dispatch,
}))
class index extends Component {
  state = {
    visible: false,
    searchFormData: {
      relatedDocType: 'SO',
      documentStatus: 'ACTIVE',
    },
    selectedList: [],
  };

  componentDidMount() {}

  fetchData = () => {
    const { dispatch, disabled } = this.props;
    const { searchFormData } = this.state;

    if (disabled) {
      const { selectedList } = this.state;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          pcontractRelatedDocsList: [].concat(selectedList),
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/pcontractRelatedDocs`,
        payload: {
          offset: 0,
          limit: 100,
          ...searchFormData,
        },
      }).then(res => {
        const { selectedList } = this.state;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            pcontractRelatedDocsList: res
              .filter(v => !selectedList.map(v1 => v1.key).includes(v.key))
              .concat(selectedList),
          },
        });
      });
    }
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    this.setState(
      {
        visible: false,
      },
      () => {
        const { dispatch } = this.props;
        const { selectedList: tt } = this.state;
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            relateDocumentList: tt,
          },
        });
      }
    );
  };

  handleCancel = e => {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.cancelLastState();
      }
    );
  };

  handleChange = (nextTargetKeys, direction, moveKeys) => {
    const { pcontractRelatedDocsList } = this.props;
    const tt = pcontractRelatedDocsList.filter(v => nextTargetKeys.includes(v.key));
    this.setState(
      {
        selectedList: tt,
      },
      () => {
        // 如果删除的数据关联过合同，记录删除的id
        if (direction === 'left') {
          const {
            dispatch,
            formData: { docDelIds },
          } = this.props;
          const delItem = pcontractRelatedDocsList.filter(v => v.key === moveKeys[0]);

          if (!isEmpty(delItem) && delItem[0].relatedContractId) {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                docDelIds: docDelIds.concat(delItem),
              },
            });

            // 清除绑定的合同ID
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                pcontractRelatedDocsList: pcontractRelatedDocsList.map(v => ({
                  ...v,
                  relatedContractId: null,
                })),
              },
            });
          }
        }
      }
    );
  };

  handleRelatedDocsChange = () => {
    this.handleOk();
  };

  cancelLastState = () => {
    const {
      formData: { relateDocumentList },
    } = this.props;

    this.setState({
      selectedList: relateDocumentList,
    });
  };

  render() {
    const { visible, searchFormData, selectedList } = this.state;

    const {
      value = [],
      disabled,
      pcontractRelatedDocsList,
      pcontractRelatedDocsTotal,
      formData,
      ...restProps
    } = this.props;

    const { relateDocumentList = [] } = formData;

    const relateDocumentStr = relateDocumentList
      .map(v => `${v.type || ''} - ${v.no || ''} - ${v.name || ''}` || '')
      .join(',');

    const showHint =
      pcontractRelatedDocsList
        .filter(v => !selectedList.map(v1 => v1.key).includes(v.key))
        .filter(v => !!v.relatedContractId).length > 0;

    return (
      <div className={styles.relatedDocs}>
        <Input
          value={relateDocumentStr}
          disabled
          addonAfter={
            <a
              className="tw-link-primary"
              onClick={() => {
                this.setState({ visible: true }, () => {
                  const {
                    formData: { relateDocumentList: newRelateDocumentList },
                  } = this.props;

                  this.setState(
                    {
                      selectedList: newRelateDocumentList.map(v => ({ ...v, disabled: false })),
                    },
                    () => {
                      // 拉取相关单据
                      this.fetchData();
                    }
                  );
                });
              }}
            >
              <Icon type="search" />
            </a>
          }
          {...restProps}
        />
        <Modal
          title="相关单据查询选择"
          visible={visible}
          destroyOnClose
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          afterClose={() => {
            this.setState({
              searchFormData: {
                relatedDocType: 'SO',
                documentStatus: 'ACTIVE',
              },
            });
          }}
          footer={
            <div style={{ textAlign: 'center' }}>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                style={{ marginBottom: '5px' }}
                onClick={() => {
                  this.handleRelatedDocsChange();
                }}
              >
                确定
              </Button>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                style={{ marginBottom: '5px' }}
                onClick={() => {
                  this.handleCancel();
                }}
              >
                取消
              </Button>
            </div>
          }
          width="70%"
          className={styles.antdModal}
        >
          {!disabled && (
            <>
              <BusinessForm defaultColumnStyle={8} form={null}>
                <FormItem
                  fieldType="BaseSelect"
                  label="单据类型"
                  fieldKey="relatedDocType"
                  parentKey="ADM:RELATED_DOC_TYPE"
                  value={searchFormData.relatedDocType}
                  form={null}
                  onChange={e => {
                    const { searchFormData: data1 } = this.state;
                    this.setState({
                      searchFormData: {
                        ...data1,
                        relatedDocType: e,
                      },
                    });
                  }}
                />
                <FormItem
                  fieldType="BaseInput"
                  label="编号/名称"
                  fieldKey="documentNoOrName"
                  value={searchFormData.documentNoOrName}
                  form={null}
                  onChange={e => {
                    const { searchFormData: data1 } = this.state;
                    this.setState({
                      searchFormData: {
                        ...data1,
                        documentNoOrName: e,
                      },
                    });
                  }}
                />
                <FormItem
                  fieldType="BaseSelect"
                  label="单据状态"
                  fieldKey="documentStatus"
                  parentKey="COM:DOC_STATUS"
                  value={searchFormData.documentStatus}
                  form={null}
                  onChange={e => {
                    const { searchFormData: data1 } = this.state;
                    this.setState({
                      searchFormData: {
                        ...data1,
                        documentStatus: e,
                      },
                    });
                  }}
                />
              </BusinessForm>
              <br />
              <Row gutter={16}>
                <Col span={10} />
                <Col span={4} style={{ position: 'relative' }}>
                  <Button
                    className="tw-btn-info"
                    type="primary"
                    size="large"
                    style={{ position: 'absolute', left: '0' }}
                    onClick={() => {
                      this.fetchData();
                    }}
                  >
                    查询
                  </Button>
                  <Button
                    className="tw-btn-info"
                    type="primary"
                    size="large"
                    style={{ position: 'absolute', right: '0' }}
                    onClick={() => {
                      this.setState({
                        searchFormData: {},
                      });
                    }}
                  >
                    清空
                  </Button>
                </Col>
                <Col span={10} />
              </Row>
              <br />
              <br />
              {showHint && (
                <span style={{ color: 'red' }}>
                  已关联过其他合同的单据无法被选择，如需继续操作，请到相关单据的页面中确认或解除关联。
                </span>
              )}
            </>
          )}

          <Transfer
            style={{ width: '100%' }}
            listStyle={{ width: '47%', height: '300px' }}
            dataSource={pcontractRelatedDocsList}
            targetKeys={selectedList.map(v => v.key)}
            onChange={this.handleChange}
            render={item => `${item.type || ''} - ${item.no || ''} - ${item.name || ''}`}
            disabled={disabled}
            titles={[`共${pcontractRelatedDocsTotal}条，最多显示100条`]}
          />
        </Modal>
      </div>
    );
  }
}

export default index;
