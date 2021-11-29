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
          title: '新增',
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
          title: '修改',
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
          title: '删除',
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
              content: '是否确认删除?',
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
          title: '编码',
          dataIndex: 'defId',
          align: 'center',
        },
        {
          title: '名称',
          dataIndex: 'text',
          align: 'center',
        },
        {
          title: '值',
          dataIndex: 'udcVal',
        },
        {
          title: '显示顺序',
          dataIndex: 'udcSeq',
          align: 'center',
        },
        {
          title: '语言',
          dataIndex: 'langDesc',
          align: 'center',
        },
        {
          title: '上级UDC',
          dataIndex: 'pdefId',
          align: 'center',
        },
        {
          title: '上级值',
          dataIndex: 'pval',
          align: 'center',
        },
        {
          title: '特殊码1',
          dataIndex: 'sphd1',
          align: 'center',
        },
        {
          title: '特殊码2',
          dataIndex: 'sphd2',
          align: 'center',
        },
        {
          title: '特殊码3',
          dataIndex: 'sphd3',
          align: 'center',
        },
        {
          title: '特殊码4',
          dataIndex: 'sphd4',
          align: 'center',
        },
        {
          title: '特殊码5',
          dataIndex: 'sphd5',
          align: 'center',
        },
        {
          title: '特殊码6',
          dataIndex: 'sphd6',
          align: 'center',
        },
        {
          title: '特殊码7',
          dataIndex: 'sphd7',
          align: 'center',
        },
        {
          title: '特殊码8',
          dataIndex: 'sphd8',
          align: 'center',
        },
        {
          title: '特殊码9',
          dataIndex: 'sphd9',
          align: 'center',
        },
        {
          title: '特殊码10',
          dataIndex: 'sphd10',
          align: 'center',
        },
        {
          title: '修改时间',
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
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button> */}

            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={this.handleCancel}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" id="sys.system.udc.title.info" defaultMessage="UDC数据" />}
          >
            <DescriptionList size="large" col={2}>
              <Description term="唯一识别码">{infoData.defId}</Description>
              <Description term="UDC名称">{infoData.defName}</Description>
              <Description term="是否可修改">
                <TagOpt
                  value={infoData.isBuiltIn}
                  opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
                  palette="red|green"
                />
              </Description>
              <Description term="上级UDC">
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
              <Title icon="profile" id="sys.system.udc.title.detail" defaultMessage="UDC明细项" />
            }
          >
            <DataTable {...tableProps} />
          </Card>
        </PageHeaderWrapper>

        {isVisible && (
          <Modal
            // destroyOnClose
            title="UDC明细项"
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
                label="编码"
                decorator={{
                  initialValue: formData.defId,
                  rules: [
                    {
                      required: true,
                      message: '请输入编码',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} placeholder="请输入编码" />
              </Field>

              <Field
                name="lang"
                label="语言"
                decorator={{
                  initialValue: formData.langDesc,
                  rules: [
                    {
                      required: true,
                      message: '请选择语言',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <UdcSelect
                  code="COM.LANG_CODE"
                  placeholder="请选择语言"
                  disabled={operate === 'edit' && readOnly}
                />
              </Field>
              <Field
                name="text"
                label="名称"
                decorator={{
                  initialValue: formData.text,
                  rules: [
                    {
                      required: true,
                      message: '请输入说明',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入说明" />
              </Field>

              <Field
                name="udcVal"
                label="值"
                decorator={{
                  initialValue: formData.udcVal,
                  rules: [
                    {
                      required: true,
                      message: '请输入值',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入值" disabled={operate === 'edit' && readOnly} />
              </Field>
              <Field
                name="udcSeq"
                label="显示顺序"
                decorator={{
                  initialValue: formData.udcSeq,
                  rules: [
                    {
                      required: true,
                      message: '请输入显示顺序',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入显示顺序" />
              </Field>

              <Field
                name="pval"
                label="上级"
                decorator={{
                  initialValue: {
                    code: formData.pval,
                    name: formData.pdefName,
                  },
                  rules: [
                    {
                      required: false,
                      message: '请选择上级',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <SelectWithCols
                  labelKey="name"
                  placeholder="请选择上级"
                  columns={[
                    { dataIndex: 'code', title: '识别码', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 10 },
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
                    disabled: !infoData.pdefId, // 主表没有选上级UDC的时候，这个就屏蔽掉了
                  }}
                />
              </Field>

              <Field
                name="sphd1"
                label="特殊码1"
                decorator={{
                  initialValue: formData.sphd1,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码1" />
              </Field>

              <Field
                name="sphd2"
                label="特殊码2"
                decorator={{
                  initialValue: formData.sphd2,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码2" />
              </Field>

              <Field
                name="sphd3"
                label="特殊码3"
                decorator={{
                  initialValue: formData.sphd3,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码3" />
              </Field>

              <Field
                name="sphd4"
                label="特殊码4"
                decorator={{
                  initialValue: formData.sphd4,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码4" />
              </Field>

              <Field
                name="sphd5"
                label="特殊码5"
                decorator={{
                  initialValue: formData.sphd5,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码5" />
              </Field>

              <Field
                name="sphd6"
                label="特殊码6"
                decorator={{
                  initialValue: formData.sphd6,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码6" />
              </Field>

              <Field
                name="sphd7"
                label="特殊码7"
                decorator={{
                  initialValue: formData.sphd7,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码7" />
              </Field>

              <Field
                name="sphd8"
                label="特殊码8"
                decorator={{
                  initialValue: formData.sphd8,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码8" />
              </Field>

              <Field
                name="sphd9"
                label="特殊码9"
                decorator={{
                  initialValue: formData.sphd9,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码9" />
              </Field>

              <Field
                name="sphd10"
                label="特殊码10"
                decorator={{
                  initialValue: formData.sphd10,
                }}
                {...FieldListLayout}
              >
                <Input placeholder="请输入特殊码10" />
              </Field>
            </FieldList>
          </Modal>
        )}
      </>
    );
  }
}

export default UdcDetail;
