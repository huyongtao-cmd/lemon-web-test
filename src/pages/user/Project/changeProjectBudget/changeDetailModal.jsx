import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  DatePicker,
  Switch,
  Radio,
  Modal,
} from 'antd';
import { isEmpty } from 'ramda';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import moment from 'moment';

const { Field, FieldLine } = FieldList;
const DOMAIN = 'changeDetailModal';

function groupBy(arr) {
  const map = {};
  const dest = [];
  arr.forEach((item, index) => {
    const ai = arr[index];
    if (!map[ai.viewGroup]) {
      dest.push({
        viewGroup: ai.viewGroup,
        viewGroupName: ai.viewGroupName,
        id: ai.id,
        data: [ai],
      });
      map[ai.viewGroup] = ai;
    } else {
      dest.forEach((itm, index1) => {
        const dj = dest[index1];
        if (dj.viewGroup === ai.viewGroup) {
          dj.data.push(ai);
        }
      });
    }
  });
  return dest;
}

@connect(({ loading, changeDetailModal, dispatch, user }) => ({
  loading,
  changeDetailModal,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
class ChangeDetailModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // optionLists:[]
    };
  }

  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId, resName },
        },
      },
      businessChangeDetailEntities,
    } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        applyResId: resId,
        applyResName: resName,
        // applyTime: moment().format('YYYY-MM-DD'),
        businessChangeDetailEntities,
      },
    });
  }

  onCellChanged = (row, rowField) => rowFieldValue => {
    const {
      dispatch,
      loading,
      businessChangeDetailEntities,
      changeDetailModal: { formData },
    } = this.props;
    // eslint-disable-next-line no-param-reassign
    row.changeOpinion = rowFieldValue.target.value;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { businessChangeDetailEntities },
    });
  };

  handleSumit = () => {
    const {
      onCheck,
      changeDetailModal: { formData },
    } = this.props;
    onCheck(formData);
  };

  renderTable = () => {
    const { loading, businessChangeDetailEntities } = this.props;
    const newList = groupBy(businessChangeDetailEntities).sort();
    const field = [];
    if (Array.isArray(newList)) {
      newList.forEach(list => {
        const tableProps = {
          rowKey: 'id',
          columnsCache: DOMAIN,
          loading: false,
          pagination: false,
          enableSelection: false,
          total: 0,
          dataSource: list.data,
          showSearch: false,
          showExport: false,
          showColumn: false,
          columns: [
            {
              title: '变更字段',
              dataIndex: 'changeLabel',
              align: 'center',
              width: 60,
            },
            {
              title: '变更前',
              dataIndex: 'beforeValue',
              align: 'center',
              width: 50,
              render: (value, row, index) => {
                if (
                  row.changeField === 'totalsControlFlag' ||
                  row.changeField === 'budgetControlFlag'
                ) {
                  // eslint-disable-next-line no-param-reassign
                  value = Number(value) === 1 ? '是' : '否';
                }
                return <span>{value}</span>;
              },
            },
            {
              title: '差异',
              dataIndex: 'deltaValue',
              align: 'center',
              width: 50,
              // render: (value, row, index) => {
              //   if (
              //     row.changeField === 'totalsControlFlag' ||
              //     row.changeField === 'budgetControlFlag'
              //   ) {
              //     // eslint-disable-next-line no-param-reassign
              //     value = Number(value) === 1 ? '是' : '否';
              //   }
              //   return <span>{value}</span>;
              // },
            },
            {
              title: '变更后',
              dataIndex: 'afterValue',
              align: 'center',
              width: 50,
              render: (value, row, index) => {
                if (
                  row.changeField === 'totalsControlFlag' ||
                  row.changeField === 'budgetControlFlag'
                ) {
                  // eslint-disable-next-line no-param-reassign
                  value = Number(value) === 1 ? '是' : '否';
                }
                return <span>{value}</span>;
              },
            },
            {
              title: '变更备注',
              dataIndex: 'changeOpinion',
              align: 'center',
              width: 200,
              render: (value, row, index) => (
                <Input
                  value={value}
                  size="small"
                  onChange={this.onCellChanged(row, 'changeOpinion')}
                />
              ),
            },
          ],
        };
        field.push(
          <>
            <Divider dashed />
            <DescriptionList size="large" col={1} title={`${list.viewGroupName}`}>
              <DataTable {...tableProps} />
            </DescriptionList>
          </>
        );
      });
    }
    return field;
  };

  render() {
    const {
      changeDetailsVisible,
      changeDetailsToggleModal,
      onCheck,
      businessChangeDetailEntities,
      form: { getFieldDecorator },
      changeDetailModal: { formData },
    } = this.props;
    return (
      <Modal
        centered
        width="60%"
        destroyOnClose
        title="预算变更明细"
        visible={changeDetailsVisible}
        onOk={this.handleSumit}
        onCancel={changeDetailsToggleModal}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            legend="变更基本信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="changeBrief"
              label="变更简述"
              decorator={{
                initialValue: formData.changeBrief || undefined,
              }}
            >
              <Input placeholder="请输入变更简述" />
            </Field>
            <Field
              name="remark"
              label="变更说明"
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea
                placeholder="请输入变更说明"
                autosize={{ minRows: 3, maxRows: 6 }}
                onChange={e => {
                  formData.remark = e.target.value;
                }}
              />
            </Field>
          </FieldList>
          {Array.isArray(businessChangeDetailEntities) && businessChangeDetailEntities.length > 0
            ? this.renderTable()
            : null}
        </Card>
      </Modal>
    );
  }
}

export default ChangeDetailModal;
