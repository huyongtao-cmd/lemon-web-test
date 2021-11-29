import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Modal, Form, Divider } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty } from 'ramda';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';

const { Field } = FieldList;
const DOMAIN = 'trainAblityList';

@connect(({ loading, dispatch, trainAblityList, user, global }) => ({
  loading:
    loading.effects[`${DOMAIN}/checkSave`] || loading.effects[`${DOMAIN}/getcapaSetListByRes`],
  dispatch,
  trainAblityList,
  user,
  global,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class TrainInsertModal extends PureComponent {
  componentDidMount() {}

  handleSave = () => {
    const {
      form,
      closeModal,
      dispatch,
      trainAblityList: { resCapaSetList },
    } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      if (resCapaSetList.length < 1) {
        createMessage({ type: 'warn', description: '请勾选需要考核的能力' });
        return;
      }
      dispatch({
        type: `${DOMAIN}/checkSave`,
      }).then(data => {
        closeModal('YES');
      });
    });
  };

  render() {
    const {
      dispatch,
      loading,
      visible,
      closeModal,
      form: { getFieldDecorator },
      trainAblityList: { formData, trainingProgList, capaSetListOfRes },
      global: { userList },
    } = this.props;

    const capaSetTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      scroll: capaSetListOfRes.length > 5 ? { y: 200 } : {},
      loading,
      showColumn: false,
      showSearch: false,
      showExport: false,
      pagination: false,
      dataSource: capaSetListOfRes,
      onRowChecked: (selectedRowKeys, selectedRows) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            resCapaSetList: selectedRows,
          },
        });
      },
      onChange: filters => this.fetchCapaSetList(filters),
      columns: [
        {
          title: '复合能力',
          dataIndex: 'entryName',
          align: 'center',
        },
      ],
    };

    return (
      <Modal
        centered
        title="适岗考核新增"
        visible={visible}
        destroyOnClose
        onCancel={closeModal}
        width="60%"
        footer={[
          <Button
            key="confirm"
            type="primary"
            size="large"
            htmlType="button"
            loading={loading}
            onClick={() => this.handleSave()}
          >
            确定
          </Button>,
          <Button key="cancel" type="primary" size="large" onClick={() => closeModal()}>
            取消
          </Button>,
        ]}
      >
        <Card bordered={false} className="tw-card-adjust">
          <FieldList getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="resId"
              label="资源"
              decorator={{
                initialValue: formData.resId || undefined,
                rules: [{ required: true, message: '请选择资源' }],
              }}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 10, xxl: 10 }}
            >
              <Selection.Columns
                source={userList}
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                placeholder="请选择资源"
                showSearch
                onChange={value => {
                  dispatch({
                    type: `${DOMAIN}/getcapaSetListByRes`,
                    payload: {
                      resId: value,
                    },
                  });
                }}
              />
            </Field>
            <Field
              name="trainingProgId"
              label="适岗培训"
              decorator={{
                initialValue: formData.trainingProgId || undefined,
                rules: [{ required: true, message: '请选择适岗培训' }],
              }}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Selection
                source={trainingProgList}
                transfer={{ key: 'id', code: 'id', name: 'progName' }}
                placeholder="请选择适岗培训项目"
                showSearch
                mode="multiple"
              />
            </Field>
          </FieldList>
          <Divider />
          <FieldList legend="考核能力" noReactive>
            <DataTable {...capaSetTableProps} />
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default TrainInsertModal;
