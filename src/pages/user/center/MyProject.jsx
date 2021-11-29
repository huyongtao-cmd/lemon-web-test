import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { UdcSelect } from '@/pages/gen/field';
import { queryUdc } from '@/services/gen/app';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';

const DOMAIN = 'userMyProject';

@connect(({ loading, userMyProject }) => ({
  userMyProject,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class MyProject extends PureComponent {
  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `user/fetchPrincipal`,
    }).then(currentUser => {
      if (!currentUser.user.extInfo) {
        createMessage({ type: 'warn', description: `当前登录人资源不存在` });
        return;
      }
      dispatch({
        type: `${DOMAIN}/query`,
        payload: params,
      });
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userMyProject: { dataSource, total },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '项目名称/编号', // TODO: 国际化
          dataIndex: 'projectSearchKey',
          tag: <Input placeholder="请输入项目名称/编号" />,
        },
        {
          title: '参考合同号', // TODO: 国际化
          dataIndex: 'userdefinedNo',
          tag: <Input placeholder="请输入参考合同号" />,
        },
        {
          title: '交付BU', // TODO: 国际化
          dataIndex: 'deliBuId',
          tag: (
            <AsyncSelect
              source={() => selectBus().then(resp => resp.response)}
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="请选择交付BU"
            />
          ),
        },
        {
          title: '项目经理', // TODO: 国际化
          dataIndex: 'pmResId',
          tag: (
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="请选择项目经理"
            />
          ),
        },
        {
          title: '工作类型', // TODO: 国际化
          dataIndex: 'workType',
          tag: <UdcSelect code="TSK.WORK_TYPE" placeholder="请选择工作类型" />,
        },
        {
          title: '项目状态', // TODO: 国际化
          dataIndex: 'projStatus',
          tag: <UdcSelect code="TSK.PROJ_STATUS" placeholder="请选择项目状态" />,
        },
        {
          title: '销售负责人', // TODO: 国际化
          dataIndex: 'salesmanResId',
          tag: (
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="请选择销售负责人"
            />
          ),
        },
      ],
      columns: [
        {
          title: '项目编号', // TODO: 国际化
          dataIndex: 'projNo',
          align: 'center',
          render: (value, row, key) => (
            <Link
              className="tw-link"
              to={`/user/Project/projectDetail?id=${row.id}&from=myproject`}
            >
              {value}
            </Link>
          ),
        },
        {
          title: '项目名称', // TODO: 国际化
          dataIndex: 'projName',
        },
        {
          title: '参考合同号', // TODO: 国际化
          dataIndex: 'userdefinedNo',
          align: 'center',
        },
        {
          title: '工作类型', // TODO: 国际化
          dataIndex: 'workTypeName',
          align: 'center',
        },
        {
          title: '项目状态', // TODO: 国际化
          dataIndex: 'projStatusName',
          align: 'center',
        },
        {
          title: '交付BU', // TODO: 国际化
          dataIndex: 'deliBuName',
        },
        {
          title: '项目经理', // TODO: 国际化
          dataIndex: 'pmResName',
        },
        {
          title: '销售负责人', // TODO: 国际化
          dataIndex: 'salesmanResName',
        },
        {
          title: '子合同', // TODO: 国际化
          dataIndex: 'contractName',
        },
        {
          title: '创建日期', // TODO: 国际化
          dataIndex: 'createTime',
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} scroll={{ x: 3000 }} />
      </PageHeaderWrapper>
    );
  }
}

export default MyProject;
