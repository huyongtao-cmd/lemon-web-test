import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Form, Tabs, Progress, Button, Card, Select, InputNumber, Modal } from 'antd';
import { mountToTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import createMessage from '@/components/core/AlertMessage';
import { selectUsersWithBu } from '@/services/gen/list';
import { isEmpty } from 'ramda';
import FieldList from '@/components/layout/FieldList';

import { queryCascaderUdc } from '@/services/gen/app';

const { Field, FieldLine } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'targetMgmt';

@connect(({ loading, targetMgmt, user, dispatch }) => ({
  targetMgmt,
  dispatch,
  user,
  loading,
}))
@Form.create({
  mapPropsToFields(props) {
    const { catData } = props.targetMgmt;
    const fields = {};
    Object.keys(catData).forEach(key => {
      fields[key] = Form.createFormField(catData[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    props.dispatch({
      type: `${DOMAIN}/updateCat`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class TargetMgmt extends PureComponent {
  state = {
    objectiveCat2Data: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh, completeStatus: completeParams } = fromQs();
    !(_refresh === '0') &&
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {},
      });
    dispatch({ type: `${DOMAIN}/cleanTargetList` }).then(res => {
      dispatch({ type: `${DOMAIN}/queryImplementList` });
    });

    // 从OKR首页点击跳转过来默认查找对应数据
    if (completeParams) {
      this.fetchData({ completeStatus: completeParams });
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  handleCatSave = params => {
    const {
      dispatch,
      targetMgmt: { selectedRows, catData },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateObjectiveCat`,
      payload: { entities: selectedRows, entity: catData },
    });
    this.updateModelState({ visible: false });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      targetMgmt: { list, total, searchForm, visible, catData },
      user: {
        user: { extInfo },
      },
    } = this.props;

    const { objectiveCat2Data } = this.state;

    const listLoading = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: listLoading,
      total,
      dataSource: list.map(v => ({ ...v, children: null })),
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '目标名称',
          dataIndex: 'objectiveName',
          options: {
            initialValue: searchForm.objectiveName || undefined,
          },
          tag: <Input placeholder="请输入目标名称" />,
        },
        {
          title: '目标主体',
          dataIndex: 'objectiveSubjectName',
          options: {
            initialValue: searchForm.objectiveSubjectName || undefined,
          },
          tag: <Input placeholder="请输入目标主体" />,
        },
        {
          title: '负责人',
          dataIndex: 'objectiveResId',
          options: {
            initialValue: searchForm.objectiveResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择负责人"
              limit={20}
            />
          ),
        },
        {
          title: '目标周期',
          dataIndex: 'periodName',
          options: {
            initialValue: searchForm.periodName || undefined,
          },
          tag: <Input placeholder="请输入目标周期" />,
        },
        {
          title: '目标状态',
          dataIndex: 'objectiveStatus',
          options: {
            initialValue: searchForm.objectiveStatus || undefined,
          },
          tag: <Selection.UDC code="OKR:OB_STATUS" placeholder="请选择目标状态" />,
        },
        {
          title: '目标查看权限',
          dataIndex: 'objectJurisdiction',
          options: {
            initialValue: searchForm.objectJurisdiction || undefined,
          },
          tag: <Selection.UDC code="OKR:OBJ_AUTH" placeholder="请选择目标查看权限" />,
        },
        {
          title: '审批状态',
          dataIndex: 'approvalStatus',
          options: {
            initialValue: searchForm.approvalStatus,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择审批状态" />,
        },
        {
          title: '目标层次',
          dataIndex: 'objectiveType',
          options: {
            initialValue: searchForm.objectiveType || undefined,
          },
          tag: (
            <Selection.UDC code="OKR:OBJ_TYPE" onChange={e => {}} placeholder="请选择目标层次" />
          ),
        },
        {
          title: '类别码1',
          dataIndex: 'objectiveCat1',
          options: {
            initialValue: searchForm.objectiveCat1 || undefined,
          },
          tag: <Selection.UDC code="OKR:OBJECTIVE_CAT1" placeholder="请选择" />,
        },
        {
          title: '类别码2',
          dataIndex: 'objectiveCat2',
          options: {
            initialValue: searchForm.objectiveCat2 || undefined,
          },
          tag: <Selection.UDC code="OKR:OBJECTIVE_CAT2" placeholder="请选择" />,
        },
      ],
      columns: [
        {
          title: '目标名称',
          dataIndex: 'objectiveName',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/okr/okrMgmt/targetMgmt/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '目标层次',
          dataIndex: 'objectiveTypeName',
          align: 'center',
        },
        {
          title: '目标状态',
          dataIndex: 'objectiveStatusName',
          align: 'center',
        },
        {
          title: '目标主体',
          dataIndex: 'objectiveSubjectName',
          align: 'center',
        },
        {
          title: '负责人',
          dataIndex: 'objectiveResName',
          align: 'center',
        },
        {
          title: '目标周期',
          dataIndex: 'periodName',
          align: 'center',
        },
        {
          title: '当前进度',
          dataIndex: 'objectiveCurProg',
          align: 'center',
          render: value => (
            <Progress
              style={{ width: '80%' }}
              percent={Number(value) || 0}
              status="active"
              strokeColor="#54A4ED"
            />
          ),
        },
        {
          title: '子目标',
          dataIndex: 'objTotalSon',
          align: 'center',
          render: value => (
            <span
              style={{
                display: 'inline-block',
                width: '40px',
                backgroundColor: '#54A4ED',
                color: '#fff',
                borderRadius: '4px',
              }}
            >
              {value}
            </span>
          ),
        },
        {
          title: '审批状态',
          dataIndex: 'approvalStatusName',
          align: 'center',
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          align: 'center',
        },
        {
          title: '最近修改时间',
          dataIndex: 'modifyTime',
          align: 'center',
        },
        {
          title: '类别码1',
          dataIndex: 'objectiveCat1Desc',
          align: 'center',
        },
        {
          title: '类别码2',
          dataIndex: 'objectiveCat2Desc',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'create',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: markAsNoTab(urls) });
            router.push(`/okr/okrMgmt/targetMgmt/edit?${from}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const tt = selectedRows.filter(
              v => v.objectiveStatus === 'SCORING' || v.objectiveStatus === 'COMPLETE'
            );
            if (tt.length) {
              createMessage({
                type: 'warn',
                description: '状态为结果打分中和已完成的目标不能修改！',
              });
              return;
            }
            const ttts = selectedRows.filter(v => v.approvalStatus === 'APPROVING');
            if (ttts.length) {
              createMessage({
                type: 'warn',
                description: '审批状态为审批中的目标不能修改！',
              });
              return;
            }
            console.warn(extInfo.resId);

            // 当前登录人不是负责人不是创建人时不能修改
            if (
              !isEmpty(extInfo) &&
              !(
                extInfo.resId === Number(selectedRows[0].objectiveResId) ||
                extInfo.resId === Number(selectedRows[0].createUserId)
              )
            ) {
              createMessage({
                type: 'warn',
                description: '仅有创建人和目标负责人可以修改目标！',
              });
              return;
            }

            const { id, approvalStatus } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: markAsNoTab(urls) });
            router.push(
              `/okr/okrMgmt/targetMgmt/edit?id=${id}&approvalStatus=${approvalStatus}&${from}`
            );
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const tt = selectedRows.filter(
              v => !(v.objectiveStatus === 'CREATE' && !v.objTotalSon)
            );
            if (tt.length) {
              createMessage({
                type: 'warn',
                description: '只有新建状态并且没有子目标的可以删除！',
              });
              return;
            }
            const tts = selectedRows.filter(
              v =>
                v.objectiveStatus === 'SCORING' ||
                v.objectiveStatus === 'COMPLETE' ||
                v.objectiveStatus === 'PROG'
            );
            if (tts.length) {
              createMessage({
                type: 'warn',
                description: '目标状态为结果打分中,进行中和已完成的目标不能删除！',
              });
              return;
            }
            const ttts = selectedRows.filter(
              v => v.approvalStatus === 'APPROVING' || v.approvalStatus === 'APPROVED'
            );
            if (ttts.length) {
              createMessage({
                type: 'warn',
                description: '审批状态为“审批中”/“已通过”的目标不能删除！',
              });
              return;
            }

            console.warn(extInfo.resId);

            // 当前登录人不是负责人不是创建人时不能删除
            if (
              !isEmpty(extInfo) &&
              !(
                extInfo.resId === Number(selectedRows[0].objectiveResId) ||
                extInfo.resId === Number(selectedRows[0].createUserId)
              )
            ) {
              createMessage({
                type: 'warn',
                description: '仅有创建人和目标负责人可以删除目标！',
              });
              return;
            }
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
        {
          key: 'score',
          className: 'tw-btn-info',
          title: '结果打分',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            selectedRows[0].objectiveStatus !== 'PROG' ||
            selectedRows[0].approvalStatus !== 'APPROVED',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const tt = selectedRows.filter(
              v => v.objectiveStatus !== 'PROG' || v.approvalStatus !== 'APPROVED'
            );
            if (tt.length) {
              createMessage({
                type: 'warn',
                description: '只有目标状态是进行中并且已审批通过的目标才可以进行打分！',
              });
              return;
            }
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: markAsNoTab(urls) });
            router.push(`/okr/okrMgmt/targetEval?id=${id}&${from}`);
          },
        },
        {
          key: 'path',
          className: 'tw-btn-info',
          title: '目标实现路径图',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: markAsNoTab(urls) });
            router.push(`/okr/okrMgmt/targetMgmt/targetPath?objectId=${id}&${from}`);
          },
        },
        {
          key: 'catManage',
          className: 'tw-btn-primary',
          title: '类别码管理',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.updateModelState({ visible: true, selectedRows, catData: {} });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="目标管理列表">
        <DataTable {...tableProps} />
        <Modal
          title="类别码管理"
          visible={visible}
          onOk={this.handleCatSave}
          onCancel={() => this.updateModelState({ visible: false })}
          width="80%"
          footer={[
            <Button
              key="confirm"
              type="primary"
              size="large"
              htmlType="button"
              onClick={() => this.handleCatSave()}
            >
              保存
            </Button>,
          ]}
        >
          <Card bordered={false} className="tw-card-adjust">
            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="objectiveCat1"
                label="类别码1"
                decorator={{
                  initialValue: catData.objectiveCat1,
                  rules: [{ required: true, message: '请输入类别码1' }],
                }}
              >
                <Selection.UDC
                  code="OKR:OBJECTIVE_CAT1"
                  placeholder="请选择"
                  onChange={v => {
                    v &&
                      queryCascaderUdc({
                        defId: 'OKR:OBJECTIVE_CAT2',
                        parentDefId: 'OKR:OBJECTIVE_CAT1',
                        parentVal: v,
                      }).then(({ response }) => {
                        this.setState({
                          objectiveCat2Data: response,
                        });
                        setFieldsValue({ objectiveCat2: undefined });
                      });
                  }}
                />
              </Field>
              <Field
                name="objectiveCat2"
                label="类别码2"
                decorator={{
                  initialValue: catData.objectiveCat2,
                  rules: [{ required: true, message: '请输入类别码2' }],
                }}
              >
                <Selection source={objectiveCat2Data} placeholder="请选择" />
              </Field>
            </FieldList>
          </Card>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default TargetMgmt;
