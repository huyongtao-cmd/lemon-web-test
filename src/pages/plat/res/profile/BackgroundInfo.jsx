import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Tooltip } from 'antd';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { queryUdc } from '@/services/gen/app';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { genFakeId } from '@/utils/mathUtils';
import { FileManagerEnhance } from '@/pages/gen/field';
import { stringify } from 'qs';
import moment from 'moment';
import modal from './modal';
import style from './index.less';
// 弹出框
const { EdubgModal, WorkbgModal, CertModal } = modal;

const DOMAIN = 'platResProfileBackground';
// 教育经历明细初始化
const edubgFormDataModel = {
  id: null,
  resId: null, // 资源id
  dateFrom: null, // 时间
  dateTo: null, // 时间
  schoolName: null, // 学校
  qualification: null, // 学历
  edusysType: null, // 学制
  majorName: null, // 专业
  majorDesc: null, // 专业描述
};
// 工作经历明细初始化
const workbgFormDataModel = {
  id: null,
  resId: null, // 资源id
  dateFrom: null, // 时间
  dateTo: null, // 时间
  industry: null, // 行业
  companyName: null, // 公司
  deptName: null, // 部门
  jobtitle: null, // 职位
  dutyDesc: null, // 职责描述
};
// 资质证书明细初始化
const certFormDataModel = {
  id: null,
  resId: null, // 资源id
  certName: null, // 证书名称
  certNo: null, // 证书号码
  certStatus: null, // 状态
  obtainDate: null, // 获得时间
  validType: null, // 有效期类型
  validMonths: null, // 有效期长
  lastRenewDate: null, // 上次认证时间
  cert: null, // 证书附件
  score: null, // 分数
  grade: null, // 等级
  releaseBy: null, // 颁发机构
  sourceType: null, // 来源
  certDesc: null, // 说明
};

@connect(({ loading, platResProfileBackground }) => ({
  platResProfileBackground,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class BackgroundInfo extends PureComponent {
  state = {
    edubgVisible: false, // 教育经历弹框显示
    edubgFormData: {
      ...edubgFormDataModel,
    },
    workbgVisible: false, // 工作经历弹框显示
    workbgFormData: {
      ...workbgFormDataModel,
    },
    certVisible: false, // 资质证书弹框显示
    certFormData: {
      ...certFormDataModel,
    },
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { resId: param.id },
    });
  };

  // 教育经历保存按钮事件
  edubgSubmitModal = () => {
    const { edubgVisible, edubgFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/edubgSave`,
      payload: { edubgFormData: { ...edubgFormData, resId: param.id } },
    }).then(reason => {
      this.setState({
        edubgVisible: !edubgVisible,
        edubgFormData,
      });
      this.fetchData();
    });
  };

  // 教育经历新增弹出窗。
  edubgToggleModal = () => {
    const { edubgVisible } = this.state;
    this.setState({
      edubgVisible: !edubgVisible,
      edubgFormData: {
        ...edubgFormDataModel,
      },
    });
  };

  // 教育经历修改弹出窗。
  edubgEditModal = selectedRow => {
    const { edubgVisible } = this.state;
    this.setState({
      edubgVisible: !edubgVisible,
      edubgFormData: {
        id: selectedRow.id,
        resId: selectedRow.resId,
        dateFrom: selectedRow.dateFrom,
        dateTo: selectedRow.dateTo,
        schoolName: selectedRow.schoolName,
        qualification: selectedRow.qualification,
        edusysType: selectedRow.edusysType,
        majorName: selectedRow.majorName,
        majorDesc: selectedRow.majorDesc,
      },
    });
  };

  // 工作经历保存按钮事件
  workbgSubmitModal = () => {
    const { workbgVisible, workbgFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/workbgSave`,
      payload: { workbgFormData: { ...workbgFormData, resId: param.id } },
    }).then(reason => {
      this.setState({
        workbgVisible: !workbgVisible,
        workbgFormData,
      });
      this.fetchData();
    });
  };

  // 工作经历新增弹出窗。
  workbgToggleModal = () => {
    const { workbgVisible } = this.state;
    this.setState({
      workbgVisible: !workbgVisible,
      workbgFormData: {
        ...workbgFormDataModel,
      },
    });
  };

  // 工作经历修改弹出窗。
  workbgEditModal = selectedRow => {
    const { workbgVisible } = this.state;
    this.setState({
      workbgVisible: !workbgVisible,
      workbgFormData: {
        id: selectedRow.id,
        resId: selectedRow.resId,
        dateFrom: selectedRow.dateFrom,
        dateTo: selectedRow.dateTo,
        industry: selectedRow.industry,
        companyName: selectedRow.companyName,
        deptName: selectedRow.deptName,
        jobtitle: selectedRow.jobtitle,
        dutyDesc: selectedRow.dutyDesc,
      },
    });
  };

  // 资质证书保存按钮事件
  certSubmitModal = () => {
    const { certVisible, certFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/certSave`,
      payload: { certFormData: { ...certFormData, resId: param.id } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        certVisible: !certVisible,
        certFormData,
      });
      this.fetchData();
    });
  };

  // 资质证书新增弹出窗。
  certToggleModal = () => {
    const { certVisible } = this.state;
    this.setState({
      certVisible: !certVisible,
      certFormData: {
        ...certFormDataModel,
      },
    });
  };

  // 资质证书修改弹出窗。
  certEditModal = selectedRow => {
    const { certVisible } = this.state;
    this.setState({
      certVisible: !certVisible,
      certFormData: {
        id: selectedRow.id,
        resId: selectedRow.resId,
        certName: selectedRow.certName,
        certNo: selectedRow.certNo,
        certStatus: selectedRow.certStatus,
        obtainDate: selectedRow.obtainDate,
        validType: selectedRow.validType,
        validMonths: selectedRow.validMonths,
        lastRenewDate: selectedRow.lastRenewDate,
        cert: selectedRow.cert,
        score: selectedRow.score,
        grade: selectedRow.grade,
        releaseBy: selectedRow.releaseBy,
        sourceType: selectedRow.sourceType,
        certDesc: selectedRow.certDesc,
      },
    });
  };

  edubgRangeSofar = flag => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { edubgSofarFlag: flag },
    });
  };

  workbgRangeSofar = flag => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { workbgSofarFlag: flag },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResProfileBackground: {
        edubgDataSource,
        edubgTotal,
        workbgDataSource,
        workbgTotal,
        certDataSource,
        certTotal,
      },
    } = this.props;
    const {
      edubgVisible,
      edubgFormData,
      workbgVisible,
      workbgFormData,
      certVisible,
      certFormData,
    } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 教育经历表格
    const edubgTableProps = {
      rowKey: 'id',
      // columnsCache: DOMAIN,
      columnsCache: 'edubgTableProps',
      loading: false,
      pagination: false,
      total: edubgTotal,
      dataSource: edubgDataSource,
      showSearch: false,
      columns: [
        {
          title: '时间', // TODO: 国际化
          // dataIndex: 'dateView',
          width: '20%',
          render: (value, row, key) =>
            row.dateTo ? (
              <span>
                {moment(row.dateFrom).format('YYYY-MM') +
                  '~' +
                  moment(row.dateTo).format('YYYY-MM')}
              </span>
            ) : (
              <span>{moment(row.dateFrom).format('YYYY-MM') + '~至今'}</span>
            ),
        },
        {
          title: '学校', // TODO: 国际化
          dataIndex: 'schoolName',
          width: '15%',
        },
        {
          title: '学历', // TODO: 国际化
          dataIndex: 'qualificationName',
          align: 'center',
          width: '15%',
        },
        {
          title: '学制', // TODO: 国际化
          dataIndex: 'edusysTypeName',
          align: 'center',
          width: '15%',
        },
        {
          title: '专业', // TODO: 国际化
          dataIndex: 'majorName',
          width: '15%',
        },
        {
          title: '专业描述', // TODO: 国际化
          dataIndex: 'majorDesc',
          width: '30%',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.edubgToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.edubgEditModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/deleteEdubg`,
                  payload: { id: selectedRowKeys, queryParams: { resId: param.id } },
                }),
            });
          },
        },
      ],
    };
    // 工作经历表格
    const workbgTableProps = {
      rowKey: 'id',
      // columnsCache: DOMAIN,
      columnsCache: 'workbgTableProps',
      loading: false,
      pagination: false,
      total: workbgTotal,
      dataSource: workbgDataSource,
      showSearch: false,
      columns: [
        {
          title: '时间', // TODO: 国际化
          // dataIndex: 'dateView',
          width: '20%',
          render: (value, row, key) =>
            row.dateTo ? (
              <span>
                {moment(row.dateFrom).format('YYYY-MM') +
                  '~' +
                  moment(row.dateTo).format('YYYY-MM')}
              </span>
            ) : (
              <span>{moment(row.dateFrom).format('YYYY-MM') + '~至今'}</span>
            ),
        },
        {
          title: '行业', // TODO: 国际化
          dataIndex: 'industry',
          width: '15%',
        },
        {
          title: '公司', // TODO: 国际化
          dataIndex: 'companyName',
          width: '15%',
        },
        {
          title: '部门', // TODO: 国际化
          dataIndex: 'deptName',
          width: '15%',
        },
        {
          title: '职位', // TODO: 国际化
          dataIndex: 'jobtitle',
          width: '15%',
        },
        {
          title: '职责描述', // TODO: 国际化
          dataIndex: 'dutyDesc',
          width: '30%',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.workbgToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.workbgEditModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/deleteWorkbg`,
                  payload: { id: selectedRowKeys, queryParams: { resId: param.id } },
                }),
            });
          },
        },
      ],
    };
    // 资质证书表格
    const certTableProps = {
      rowKey: 'id',
      // columnsCache: DOMAIN,
      columnsCache: 'certTableProps',
      loading: false,
      pagination: false,
      total: certTotal,
      dataSource: certDataSource,
      showSearch: false,
      columns: [
        {
          title: '证书名称', // TODO: 国际化
          dataIndex: 'certName',
        },
        {
          title: '证书号码', // TODO: 国际化
          dataIndex: 'certNo',
          align: 'center',
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'certStatusName',
          align: 'center',
        },
        {
          title: '获得时间', // TODO: 国际化
          dataIndex: 'obtainDate',
        },
        {
          title: '有效期长（月）', // TODO: 国际化
          dataIndex: 'validMonths',
          align: 'right',
        },
        {
          title: '上次认证时间', // TODO: 国际化
          dataIndex: 'lastRenewDate',
        },
        {
          title: '到期日', // TODO: 国际化
          dataIndex: 'dueDate',
        },
        {
          title: '证书附件', // TODO: 国际化
          dataIndex: 'id',
          render: (value, row, key) => (
            <FileManagerEnhance
              api="/api/person/v1/res/cert/sfs/token"
              dataKey={value}
              listType="text"
              disabled
              preview
              key={genFakeId(-1)}
            />
          ),
        },
        {
          title: '分数', // TODO: 国际化
          dataIndex: 'score',
          align: 'right',
        },
        {
          title: '等级', // TODO: 国际化
          dataIndex: 'grade',
        },
        {
          title: '颁发机构', // TODO: 国际化
          dataIndex: 'releaseBy',
        },
        {
          title: '来源', // TODO: 国际化
          dataIndex: 'sourceTypeName',
          align: 'center',
        },
        {
          title: '说明', // TODO: 国际化
          dataIndex: 'certDesc',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.certToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.certEditModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/deleteCert`,
                  payload: { id: selectedRowKeys, queryParams: { resId: param.id } },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                const fromUrl = stringify({ from });
                closeThenGoto(
                  `/hr/res/profile/list/resDetail?id=${param.id}&mode=update&${fromUrl}`
                );
              } else {
                closeThenGoto(`/hr/res/profile/list/resDetail?id=${param.id}&mode=update`);
              }
            }}
          >
            {formatMessage({ id: `misc.prevstep`, desc: '上一步' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                const fromUrl = stringify({ from });
                closeThenGoto(`/hr/res/profile/list/projectExperience?id=${param.id}&${fromUrl}`);
              } else {
                closeThenGoto(`/hr/res/profile/list/projectExperience?id=${param.id}`);
              }
            }}
          >
            {formatMessage({ id: `misc.nextstep`, desc: '下一步' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                closeThenGoto(from);
              } else {
                closeThenGoto('/hr/res/profile/list');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="ui.menu.plat.res.background" defaultMessage="资源背景信息" />
          }
        >
          <FieldList legend="教育经历">
            <DataTable {...edubgTableProps} />
          </FieldList>
          <Divider dashed />
          <FieldList legend="工作经历">
            <DataTable {...workbgTableProps} />
          </FieldList>
          <Divider dashed />
          <FieldList legend="资质证书">
            <DataTable {...certTableProps} scroll={{ x: 2000 }} />
          </FieldList>
        </Card>
        <EdubgModal
          edubgFormData={edubgFormData}
          visible={edubgVisible}
          handleCancel={this.edubgToggleModal}
          handleOk={this.edubgSubmitModal}
          handleSofar={this.edubgRangeSofar}
        />
        <WorkbgModal
          workbgFormData={workbgFormData}
          visible={workbgVisible}
          handleCancel={this.workbgToggleModal}
          handleOk={this.workbgSubmitModal}
          handleSofar={this.workbgRangeSofar}
        />
        <CertModal
          certFormData={certFormData}
          visible={certVisible}
          handleCancel={this.certToggleModal}
          handleOk={this.certSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BackgroundInfo;
