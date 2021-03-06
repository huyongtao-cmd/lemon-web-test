import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Card, Input, Switch, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import classnames from 'classnames';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { createConfirm } from '@/components/core/Confirm';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import SelectWithCols from '@/components/common/SelectWithCols';
import DataTable from '@/components/common/DataTable';
import { UdcSelect } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { TagOpt } from '@/utils/tempUtils';

const DOMAIN = 'sysUdcDetail';
const { Description } = DescriptionList;
const { Field } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, sysUdcDetail, dispatch }) => ({
  loading,
  sysUdcDetail,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      let val = null;
      if (name === 'pval') {
        val = value.code;
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { pval: value.code, pdefId: value.defId },
        });
      } else {
        val = value;
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: val },
        });
      }
    }
  },
})
// @mountToTab()
class UdcDetail extends PureComponent {
  state = {
    isVisible: false,
    operate: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { defId } = fromQs();

    if (defId) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: defId,
      });
      dispatch({
        type: `${DOMAIN}/list`,
        payload: defId,
      });
    }
  }

  handleCancel = () => {
    closeThenGoto('/sys/system/udc');
  };

  handleOk = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { operate } = this.state;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (operate === 'create') {
          dispatch({
            type: `${DOMAIN}/create`,
          });
        } else if (operate === 'edit') {
          dispatch({
            type: `${DOMAIN}/edit`,
          });
        }
        this.setState({
          isVisible: false,
        });
        dispatch({
          type: `${DOMAIN}/clean`,
        });
      }
    });
  };

  handleToggle = () => {
    const { isVisible } = this.state;
    this.setState({
      isVisible: !isVisible,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      sysUdcDetail: { formData, infoData, dataSource, udcData = [], udcDataSource = [] },
      form: { getFieldDecorator },
    } = this.props;
    const { isVisible, operate } = this.state;
    const readOnly = true;

    const tableProps = {
      rowKey: record => `${record.defId}-${record.udcVal}`,
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/list`],
      dataSource,
      scroll: {
        x: '150%',
      },
      showSearch: false,
      showColumn: false,
      leftButtons: [
        {
          key: 'create',
          title: '??????',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: !infoData.isBuiltIn,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // clear formData
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                formData: {
                  defId: infoData.defId,
                },
              },
            });
            this.setState({
              operate: 'create',
            });
            this.handleToggle();
          },
        },
        {
          key: 'edit',
          title: '??????',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: !infoData.isBuiltIn,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // input formData
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                formData: {
                  ...selectedRows[0],
                },
              },
            });
            this.setState({
              operate: 'edit',
            });
            this.handleToggle();
          },
        },
        {
          key: 'delete',
          title: '??????',
          className: 'tw-btn-error',
          icon: 'delete',
          loading: false,
          hidden: false,
          disabled: !infoData.isBuiltIn,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const delList = [];
            selectedRows.map(v => {
              delList.push({
                defId: v.defId,
                udcVal: v.udcVal,
                lang: v.lang,
                udcSeq: v.udcSeq,
              });
              return void 0;
            });
            createConfirm({
              content: '???????????????????',
              onOk: () => {
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: delList,
                });
              },
            });
          },
        },
      ],
      columns: [
        {
          title: '??????',
          dataIndex: 'defId',
          align: 'center',
        },
        {
          title: '??????',
          dataIndex: 'text',
          align: 'center',
        },
        {
          title: '???',
          dataIndex: 'udcVal',
        },
        {
          title: '????????????',
          dataIndex: 'udcSeq',
          align: 'center',
        },
        {
          title: '??????',
          dataIndex: 'langDesc',
          align: 'center',
        },
        {
          title: '??????UDC',
          dataIndex: 'pdefId',
          align: 'center',
        },
        {
          title: '?????????',
          dataIndex: 'pval',
          align: 'center',
        },
        {
          title: '?????????1',
          dataIndex: 'sphd1',
          align: 'center',
        },
        {
          title: '?????????2',
          dataIndex: 'sphd2',
          align: 'center',
        },
        {
          title: '?????????3',
          dataIndex: 'sphd3',
          align: 'center',
        },
        {
          title: '?????????4',
          dataIndex: 'sphd4',
          align: 'center',
        },
        {
          title: '?????????5',
          dataIndex: 'sphd5',
          align: 'center',
        },
        {
          title: '?????????6',
          dataIndex: 'sphd6',
          align: 'center',
        },
        {
          title: '?????????7',
          dataIndex: 'sphd7',
          align: 'center',
        },
        {
          title: '?????????8',
          dataIndex: 'sphd8',
          align: 'center',
        },
        {
          title: '?????????9',
          dataIndex: 'sphd9',
          align: 'center',
        },
        {
          title: '?????????10',
          dataIndex: 'sphd10',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'modifyTime',
          sorter: true,
          render: value => formatDT(value),
        },
      ],
    };

    return (
      <>
        <PageHeaderWrapper title="UDC">
          <Card className="tw-card-rightLine">
            {/* <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              onClick={this.handleSave}
            >
              {formatMessage({ id: `misc.save`, desc: '??????' })}
            </Button> */}

            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={this.handleCancel}
            >
              {formatMessage({ id: `misc.rtn`, desc: '??????' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" id="sys.system.udc.title.info" defaultMessage="UDC??????" />}
          >
            <DescriptionList size="large" col={2}>
              <Description term="???????????????">{infoData.defId}</Description>
              <Description term="UDC??????">{infoData.defName}</Description>
              <Description term="???????????????">
                <TagOpt
                  value={infoData.isBuiltIn}
                  opts={[{ code: 0, name: '???' }, { code: 1, name: '???' }]}
                  palette="red|green"
                />
              </Description>
              <Description term="??????UDC">
                {infoData.pdefId}
                &nbsp;&nbsp;
                {infoData.pdefName}
              </Description>
            </DescriptionList>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            style={{ marginTop: 8 }}
            title={
              <Title icon="profile" id="sys.system.udc.title.detail" defaultMessage="UDC?????????" />
            }
          >
            <DataTable {...tableProps} />
          </Card>
        </PageHeaderWrapper>

        {isVisible && (
          <Modal
            // destroyOnClose
            title="UDC?????????"
            visible={isVisible}
            onOk={this.handleOk}
            onCancel={this.handleToggle}
            width="60%"
          >
            <FieldList
              layout="horizontal"
              getFieldDecorator={getFieldDecorator}
              style={{ overflow: 'hidden' }}
              col={2}
            >
              <Field
                name="defId"
                label="??????"
                decorator={{
                  initialValue: formData.defId,
                  rules: [
                    {
                      required: true,
                      message: '???????????????',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} placeholder="???????????????" />
              </Field>

              <Field
                name="lang"
                label="??????"
                decorator={{
                  initialValue: formData.langDesc,
                  rules: [
                    {
                      required: true,
                      message: '???????????????',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  code="COM.LANG_CODE"
                  placeholder="???????????????"
                  disabled={operate === 'edit' && readOnly}
                />
              </Field>
              <Field
                name="text"
                label="??????"
                decorator={{
                  initialValue: formData.text,
                  rules: [
                    {
                      required: true,
                      message: '???????????????',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input placeholder="???????????????" />
              </Field>

              <Field
                name="udcVal"
                label="???"
                decorator={{
                  initialValue: formData.udcVal,
                  rules: [
                    {
                      required: true,
                      message: '????????????',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input placeholder="????????????" disabled={operate === 'edit' && readOnly} />
              </Field>
              <Field
                name="udcSeq"
                label="????????????"
                decorator={{
                  initialValue: formData.udcSeq,
                  rules: [
                    {
                      required: true,
                      message: '?????????????????????',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input placeholder="?????????????????????" />
              </Field>

              <Field
                name="pval"
                label="??????"
                decorator={{
                  initialValue: {
                    code: formData.pval,
                    name: formData.pdefName,
                  },
                  rules: [
                    {
                      required: false,
                      message: '???????????????',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  placeholder="???????????????"
                  columns={[
                    { dataIndex: 'code', title: '?????????', span: 10 },
                    { dataIndex: 'name', title: '??????', span: 10 },
                  ]}
                  dataSource={udcDataSource}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          udcDataSource: udcData.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                    disabled: !infoData.pdefId, // ?????????????????????UDC?????????????????????????????????
                  }}
                />
              </Field>

              <Field
                name="sphd1"
                label="?????????1"
                decorator={{
                  initialValue: formData.sphd1,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????1" />
              </Field>

              <Field
                name="sphd2"
                label="?????????2"
                decorator={{
                  initialValue: formData.sphd2,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????2" />
              </Field>

              <Field
                name="sphd3"
                label="?????????3"
                decorator={{
                  initialValue: formData.sphd3,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????3" />
              </Field>

              <Field
                name="sphd4"
                label="?????????4"
                decorator={{
                  initialValue: formData.sphd4,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????4" />
              </Field>

              <Field
                name="sphd5"
                label="?????????5"
                decorator={{
                  initialValue: formData.sphd5,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????5" />
              </Field>

              <Field
                name="sphd6"
                label="?????????6"
                decorator={{
                  initialValue: formData.sphd6,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????6" />
              </Field>

              <Field
                name="sphd7"
                label="?????????7"
                decorator={{
                  initialValue: formData.sphd7,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????7" />
              </Field>

              <Field
                name="sphd8"
                label="?????????8"
                decorator={{
                  initialValue: formData.sphd8,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????8" />
              </Field>

              <Field
                name="sphd9"
                label="?????????9"
                decorator={{
                  initialValue: formData.sphd9,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????9" />
              </Field>

              <Field
                name="sphd10"
                label="?????????10"
                decorator={{
                  initialValue: formData.sphd10,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="??????????????????10" />
              </Field>
            </FieldList>
          </Modal>
        )}
      </>
    );
  }
}

export default UdcDetail;
