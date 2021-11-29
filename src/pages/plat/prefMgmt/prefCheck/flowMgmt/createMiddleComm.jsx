import React, { Component } from 'react';
import { connect } from 'dva';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { Button, Card, Form, Input, Radio } from 'antd';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import router from 'umi/router';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'createMiddleComm';
@connect(({ loading, createMiddleComm, dispatch, user }) => ({
  loading,
  createMiddleComm,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedFields) {
    if (!isEmpty(changedFields)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedFields,
      });
    }
  },
})
@mountToTab()
class CreateMiddleComm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: null,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        communicateList: [],
        formData: {},
        pageConfig: {},
      },
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_COMMUNICATE_DETAIL' },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });

    dispatch({
      type: `${DOMAIN}/queryrelatedRoleDetail`,
      payload: {
        id,
      },
    });
  }

  handleSubmit = () => {
    const { communicateType, id } = fromQs();
    const { selectedRows } = this.state;
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      createMiddleComm: { formData },
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const relateResRule = [];
        if (selectedRows && selectedRows.length > 0) {
          selectedRows.map(item => {
            if (item.relatedRole === 'P_RES') {
              relateResRule.push('P_RES:');
            } else if (item.relatedRole === 'BU_PIC') {
              relateResRule.push('BU_PIC:');
            } else if (item.relatedRole === 'ASSIGN_RES') {
              relateResRule.push(`ASSIGN_RES:${item.apprResId}`);
            }
            return true;
          });
        }
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            communicateType: communicateType.substr(0, communicateType.length),
            performanceExamId: id,
            applyResId: resId,
            relateResRule: relateResRule.join(','),
            remark: formData.remark,
            applyDate: formData.applyDate ? formData.applyDate : formData.examPeriodStart,
            assessedVisible: formData.assessedVisible,
            examName: formData.examName,
          },
        });
      }
    });
  };

  render() {
    const { id } = fromQs();
    const { selectedRowKeys } = this.state;
    const {
      loading,
      form: { getFieldDecorator },
      createMiddleComm: { communicateList, formData, pageConfig },
      user: {
        user: {
          extInfo: { resName },
        },
      },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentBlockConfig = [];
    pageBlockViews.forEach(view => {
      if (view.blockKey === 'PERFORMANCE_EXAM_COMMUNICATE_PERSON') {
        // 绩效考核-沟通详情
        currentBlockConfig = view;
      }
    });
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      showColumn: false,
      showSearch: false,
      showExport: false,
      pagination: false,
      dataSource: communicateList,
      rowSelection: {
        type: 'checkbox',
        selectedRowKeys,
        onChange: (rowKey, rows) => {
          this.setState({
            selectedRowKeys: rowKey,
            selectedRows: rows,
          });
        },
      },
      columns: [
        pageFieldJson.relatedRole.visibleFlag && {
          title: `${pageFieldJson.relatedRole.displayName}`,
          dataIndex: 'name',
          align: 'center',
          sortNo: `${pageFieldJson.relatedRole.sortNo}`,
        },
        pageFieldJson.apprResId.visibleFlag && {
          title: `${pageFieldJson.apprResId.displayName}`,
          dataIndex: 'source',
          align: 'center',
          sortNo: `${pageFieldJson.apprResId.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            loading={loading.effects[`${DOMAIN}/submit`]}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={() => {
              const urls = getUrl();
              const from = stringify({ from: urls });
              router.push(
                `/hr/prefMgmt/communicate/communicatePlanFlowDetail?id=${id}&performanceExamContentType=CREATE`
              );
            }}
          >
            查看考核计划
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="绩效考核中期沟通" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="examName"
              label="考核名称"
              decorator={{
                initialValue: formData.examName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="assessedVisible"
              label="可查看被考核人意见"
              decorator={{
                initialValue: formData.assessedVisible,
              }}
            >
              <RadioGroup>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="resName"
              label="发起人"
              decorator={{
                initialValue: resName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="发起时间"
              decorator={{
                initialValue: formData.examPeriodStart,
                rules: [
                  {
                    required: true,
                    message: '请选择发起日期',
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
          </FieldList>
          <DescriptionList title="选择沟通参与人" size="large" col={1}>
            <DataTable {...tableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CreateMiddleComm;
