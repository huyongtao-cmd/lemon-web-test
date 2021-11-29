import React, { PureComponent } from 'react';
import moment from 'moment';
import { Tag } from 'antd';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { ResModal } from '@/pages/gen/modal';
import { createConfirm } from '@/components/core/Confirm';
import { formatMessage } from 'umi/locale';

class DistributeSub extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {}

  handleModelOk = (e, checkedKeys, checkRows) => {
    const { responseList, dispatch, domain } = this.props;
    const choseRes = checkRows.map(item => {
      const choseResItem = {
        respondentResId: item.id,
        respondentResName: item.resName,
        accessLevel: item.accessLevel,
        creditPoint: item.creditPoint,
        inviteFlag: 1,
        id: genFakeId(-1),
      };
      return choseResItem;
    });

    const newResponseList = responseList.concat(choseRes);
    const obj = {};
    const clearResponseList = newResponseList.reduce((cur, next) => {
      obj[next.respondentResId] ? '' : (obj[next.respondentResId] = true && cur.push(next));
      return cur;
    }, []);

    dispatch({
      type: `${domain}/updateState`,
      payload: {
        responseList: clearResponseList,
      },
    });
    this.toggleVisible();
  };

  deleteChoseRes = ids => {
    const { responseList = [], dispatch, domain } = this.props;
    let newArray = responseList;
    for (let i = 0; i < ids.length; i += 1) {
      newArray = newArray.filter(item => item.id !== ids[i]);
    }
    dispatch({
      type: `${domain}/updateState`,
      payload: {
        responseList: newArray,
      },
    });
  };

  // 切换弹出窗。
  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      domain,
      formData,
      infoData,
      responseList,
      modalList,
      modalTotal,
    } = this.props;
    const { visible } = this.state;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: loading.effects[`${domain}/queryDistResponse`],
      total: responseList.length,
      dataSource: responseList,
      showCopy: false,
      showAdd: false,
      showDelete: false,
      columns: [
        {
          title: '资源',
          dataIndex: 'respondentResName',
        },
        /* {
          title: '安全级别',
          dataIndex: 'accessLevel',
          // align: 'center',
        },
        {
          title: '信用评分',
          dataIndex: 'creditPoint',
          // align: 'center',
        }, */
        {
          title: '响应状态',
          dataIndex: 'respStatusDesc',
          align: 'center',
        },
        {
          title: '响应时间',
          dataIndex: 'respTime',
          render: (value, row, index) =>
            value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null,
        },
        {
          title: '响应描述',
          dataIndex: 'respDesc',
        },
        {
          title: '是否邀请',
          dataIndex: 'inviteFlag',
          align: 'center',
          render: (value, row, index) =>
            value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
        },
      ],
      buttons: [
        {
          key: 'addInviter',
          title: '添加邀请人',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            this.toggleVisible();
          },
        },
        {
          key: 'setRes',
          title: '设为接收资源',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows && selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            dispatch({
              type: `${domain}/updateForm`,
              payload: {
                receiverResId: selectedRows[0].respondentResId,
                receiverResName: selectedRows[0].respondentResName,
              },
            });
          },
        },
        {
          key: 'reject',
          title: '谢绝',
          className: 'tw-btn-error',
          loading: false,
          hidden: false,
          minSelections: 0,
          disabled: selectedRows => selectedRows && selectedRows.length <= 0,
          cb: (selectedRowKeys, selectedRows) => {
            dispatch({
              type: `${domain}/rejectDistResponse`,
              payload: { distId: formData.id, ids: selectedRowKeys },
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows && selectedRows.length <= 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () => {
                this.deleteChoseRes(selectedRowKeys);
              },
            });
          },
        },
      ],
    };

    return (
      <div style={{ margin: 12 }}>
        <EditableDataTable {...tableProps} />
        <ResModal
          title="选择项目"
          domain={domain}
          visible={visible}
          dispatch={dispatch}
          dataSource={modalList}
          loading={loading.effects[`${domain}/queryModalList`]}
          total={modalTotal}
          onOk={this.handleModelOk}
          onCancel={this.toggleVisible}
          multiple
        />
      </div>
    );
  }
}

export default DistributeSub;
