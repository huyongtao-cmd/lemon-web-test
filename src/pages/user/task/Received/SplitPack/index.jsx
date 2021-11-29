import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Spin, Card, Button, Table, Tooltip, Icon, Checkbox, InputNumber, Modal } from 'antd';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import PackInfo from './component/PackInfo';
import OtherUnpackInfo from './component/OtherUnpackInfo';
import UnpackInfo from './component/UnpackInfo';
import { add } from '@/utils/mathUtils';
import './splitPack.less';

const DOMAIN = 'splitPack';

@connect(({ loading, splitPack, dispatch }) => ({
  loading,
  splitPack,
  dispatch,
}))
// @mountToTab()
class SplitPack extends PureComponent {
  componentDidMount() {
    const { dispatch, fromFlow } = this.props;
    const { id, opMode } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({
      type: `${DOMAIN}/queryUsersAll`,
    });
    dispatch({
      type: `${DOMAIN}/queryBusAll`,
    });
    dispatch({
      type: `${DOMAIN}/queryUdc`,
      payload: 'COM.JOB_TYPE1',
    });
    if (fromFlow || opMode === 'UPDATE') {
      dispatch({
        type: `${DOMAIN}/querySplitPackId`,
        payload: { id },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/querySplitPackInfo`,
        payload: { id },
      });
      dispatch({
        type: `${DOMAIN}/querySplitPackActivityInfo`,
        payload: { id },
      });
      dispatch({
        type: `${DOMAIN}/querySplitPackOtherInfo`,
        payload: {
          id,
          offset: 0,
          limit: 10,
        },
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          updateData: [
            {
              taskName: '',
              guaranteeRate: 0,
              receiverBuId: '',
              receiverResId: '',
              jobType1: '',
              jobType2: '',
              capasetLeveldId: '',
              resActivityList: [],
            },
            {
              taskName: '',
              guaranteeRate: 0,
              receiverBuId: '',
              receiverResId: '',
              jobType1: '',
              jobType2: '',
              capasetLeveldId: '',
              resActivityList: [],
            },
          ],
        },
      });
    }
  }

  componentDidUpdate = prevProps => {
    // 上下两张表滚动同步
    const rootNode = document.getElementsByClassName('splitPack_table')[0];
    const footer = rootNode.getElementsByClassName('ant-table-footer')[0];
    const footerBody = footer.getElementsByClassName('ant-table-body')[0];
    const tableBody = rootNode.getElementsByClassName('ant-table-body')[0];
    footerBody.onscroll = e => {
      tableBody.scrollLeft = e.target.scrollLeft;
    };
    tableBody.onscroll = e => {
      footerBody.scrollLeft = e.target.scrollLeft;
    };
    // const offsetX = this.props.splitPack.isFold.reduce((prev, cur, index, arr) => {
    //   if (cur) {
    //     return prev + 100;
    //   }
    //   return prev + 400;
    // }, 400 * this.props.splitPack.updateData.length + 400);
    // if (prevProps.splitPack.updateData.length < this.props.splitPack.updateData.length) {
    //   tableBody.scrollLeft = offsetX
    // }
  };

  handleFoldClick = index => {
    // 其他拆包信息折叠
    const {
      dispatch,
      splitPack: { isFold },
    } = this.props;
    const [...arr] = isFold;
    arr[index] = !isFold[index];
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        isFold: arr,
      },
    });
  };

  // 新增本次拆包
  handleAdd = () => {
    const {
      splitPack: { updateData },
      dispatch,
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: [
          ...updateData,
          {
            taskName: '',
            guaranteeRate: 0,
            receiverBuId: '',
            receiverResId: '',
            jobType1: '',
            jobType2: '',
            capasetLeveldId: '',
            resActivityList: [],
          },
        ],
      },
    });
  };

  // 本次拆包选择
  handleCheckChange = (e, index, record) => {
    const {
      splitPack: { updateData },
      dispatch,
    } = this.props;
    const [...arr] = updateData;
    if (e.target.checked) {
      arr[index].resActivityList.push({
        resActivityPid: record.id,
        projActivityId: record.projActivityId,
        actNo: record.actNo,
        eqvaQty: null,
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          updateData: arr,
        },
      });
    } else {
      updateData[index].resActivityList.forEach((item, i) => {
        if (
          record.projActivityId
            ? record.projActivityId === item.projActivityId
            : record.actNo === item.actNo
        ) {
          arr[index].resActivityList.splice(i, 1);
        }
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          updateData: arr,
        },
      });
    }
  };

  // 本次拆包当量调整
  handleUnpackQtyChange = (value, index, record) => {
    const {
      splitPack: { updateData },
      dispatch,
    } = this.props;
    const [...arr] = updateData;
    updateData[index].resActivityList.forEach((item, i) => {
      if (
        record.projActivityId
          ? record.projActivityId === item.projActivityId
          : record.actNo === item.actNo
      ) {
        arr[index].resActivityList[i].eqvaQty = value;
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: arr,
      },
    });
  };

  // 其他转包信息上一页下一页
  handlePageChange = val => {
    const {
      dispatch,
      fromFlow,
      splitPack: { offset, limit, total, packId },
    } = this.props;
    const { id, opMode } = fromQs();
    if (val === 'next') {
      if (total <= offset + limit) return;
      if (fromFlow || opMode === 'UPDATE') {
        dispatch({
          type: `${DOMAIN}/querySplitPackOtherInfo`,
          payload: {
            id: packId,
            splitId: id,
            offset: offset + limit,
            limit,
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/querySplitPackOtherInfo`,
          payload: {
            id,
            offset: offset + limit,
            limit,
          },
        });
      }
    } else {
      if (offset - limit < 0) return;
      if (fromFlow || opMode === 'UPDATE') {
        dispatch({
          type: `${DOMAIN}/querySplitPackOtherInfo`,
          payload: {
            id: packId,
            splitId: id,
            offset: offset - limit,
            limit,
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/querySplitPackOtherInfo`,
          payload: {
            id,
            offset: offset - limit,
            limit,
          },
        });
      }
    }
  };

  // 检查上表中的值有没有空
  checkoutUpdateDataForm = () => {
    const {
      dispatch,
      splitPack: { updateData, actData },
    } = this.props;
    let err = false;
    const objArr = [];
    updateData.forEach((item, index) => {
      objArr[index] = {};
      if (
        !item.taskName ||
        (!item.guaranteeRate && item.guaranteeRate !== 0) ||
        !item.receiverBuId ||
        !item.receiverResId ||
        !item.jobType1 ||
        !item.jobType2 ||
        !item.capasetLeveldId
      ) {
        err = true;
        !item.taskName ? (objArr[index].taskName = true) : '';
        !item.guaranteeRate && item.guaranteeRate !== 0 ? (objArr[index].guaranteeRate = true) : '';
        !item.receiverBuId ? (objArr[index].receiverBuId = true) : '';
        !item.receiverResId ? (objArr[index].receiverResId = true) : '';
        !item.jobType1 ? (objArr[index].jobType1 = true) : '';
        !item.jobType2 ? (objArr[index].jobType2 = true) : '';
        !item.capasetLeveldId ? (objArr[index].capasetLeveldId = true) : '';
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formCheckRes: objArr,
      },
    });
    return err;
  };

  // 接收资源不能重复
  checkoutReceiverResId = () => {
    const {
      splitPack: { updateData },
    } = this.props;
    const obj = {};
    let err = false;
    updateData.forEach((item, index) => {
      obj[item.receiverResId] ? (err = true) : (obj[item.receiverResId] = 1);
    });
    return err;
  };

  // 不能什么活动都不选
  checkoutResActivityList = () => {
    const {
      splitPack: { updateData, actData },
    } = this.props;
    let err = false;
    updateData.forEach((item, index) => {
      if (item.resActivityList.length === 0) {
        err = true;
      }
    });
    return err;
  };

  // 检查已选择的，拆包当量数不能为空
  checkoutQty = () => {
    const {
      dispatch,
      splitPack: { updateData, actData },
    } = this.props;
    let err = false;
    const objArr = [];
    updateData.forEach((item, index) => {
      item.resActivityList.forEach((x, i) => {
        if (!x.eqvaQty && x.eqvaQty !== 0) {
          err = true;
          objArr[index] ? null : (objArr[index] = {});
          x.projActivityId
            ? (objArr[index][x.projActivityId] = true)
            : (objArr[index][x.actNo] = true);
        }
      });
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        actCheckRes: objArr,
      },
    });
    return err;
  };

  // 检查每行相加结果
  // checkoutSum = () => {
  //   const {
  //     splitPack: { updateData, pastData, actData },
  //   } = this.props;
  //   const obj = {};
  //   pastData.forEach((item, index) => {
  //     item.resActivityList.forEach((x, i) => {
  //       if (x.projActivityId) {
  //         obj[x.projActivityId]
  //           ? (obj[x.projActivityId] = add(obj[x.projActivityId], parseFloat(x.eqvaQty)))
  //           : (obj[x.projActivityId] = parseFloat(x.eqvaQty));
  //       } else {
  //         obj[x.actNo]
  //           ? (obj[x.actNo] = add(obj[x.actNo], parseFloat(x.eqvaQty)))
  //           : (obj[x.actNo] = parseFloat(x.eqvaQty));
  //       }
  //     });
  //   });
  //   updateData.forEach((item, index) => {
  //     item.resActivityList.forEach((x, i) => {
  //       if (x.projActivityId) {
  //         obj[x.projActivityId]
  //           ? (obj[x.projActivityId] = add(obj[x.projActivityId], parseFloat(x.eqvaQty)))
  //           : (obj[x.projActivityId] = parseFloat(x.eqvaQty));
  //       } else {
  //         obj[x.actNo]
  //           ? (obj[x.actNo] = add(obj[x.actNo], parseFloat(x.eqvaQty)))
  //           : (obj[x.actNo] = parseFloat(x.eqvaQty));
  //       }
  //     });
  //   });
  //   let err = false;
  //   actData.forEach((item, index) => {
  //     if (item.projActivityId) {
  //       obj[item.projActivityId] > item.eqvaQty ? (err = true) : '';
  //     } else {
  //       obj[item.actNo] > item.eqvaQty ? (err = true) : '';
  //     }
  //   });
  //   return err;
  // };

  handleSubmit = () => {
    const {
      dispatch,
      splitPack: { updateData, actData },
    } = this.props;
    const { opMode, remark, taskId } = fromQs();
    if (this.checkoutUpdateDataForm()) {
      createMessage({ type: 'error', description: '请检查拆包信息！' });
      return false;
    }
    if (this.checkoutReceiverResId()) {
      createMessage({ type: 'error', description: '接收资源不能重复！' });
      return false;
    }
    if (this.checkoutResActivityList()) {
      createMessage({ type: 'error', description: '请选择活动！' });
      return false;
    }
    if (this.checkoutQty()) {
      createMessage({ type: 'error', description: '拆包当量数不能为空！' });
      return false;
    }
    // if (this.checkoutSum()) {
    //   createMessage({ type: 'error', description: '拆包当量数总和不能超过活动当量！' });
    //   return false;
    // }
    if (opMode === 'UPDATE') {
      dispatch({
        type: `${DOMAIN}/updateSplitPack`,
        payload: { updateData, remark, taskId },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/addSplitPack`,
        payload: updateData,
      });
    }
    return true;
  };

  // 构建上表数据结构
  structureResData = () => {
    const {
      splitPack: { packData, pastData, updateData },
    } = this.props;
    const arr = [{ ...packData }];
    pastData.forEach((item, index) => {
      arr[0][`past${index}`] = item;
    });
    updateData.forEach((item, index) => {
      arr[0][`up${index}`] = item;
    });
    return arr;
  };

  // 构建上表表格结构
  structureResColumns = () => {
    const {
      fromFlow,
      taskKey,
      splitPack: { pastData, updateData, formCheckRes, isFold, offset, limit, total },
    } = this.props;
    const arr = [
      {
        // dataIndex: 'pakeName',
        title: '来源任务包信息',
        width: '400px',
        align: 'center',
        render: (value, record) => <PackInfo dataSource={record} taskKey={taskKey} />,
      },
    ];
    pastData.forEach((item, index) => {
      arr.push({
        dataIndex: `past${index}`,
        colSpan: index === 0 ? pastData.length : 0,
        width: isFold[index] ? '100px' : '400px',
        title: () => (
          <div style={{ position: 'relative' }}>
            <Icon
              type="left"
              className="page-prev"
              style={offset - limit < 0 ? { opacity: '0.4', cursor: 'unset' } : {}}
              onClick={() => this.handlePageChange('prev')}
            />
            {pastData.length === 1 && isFold[0] ? (
              <Tooltip title="其他拆包信息">
                <span>其他...</span>
              </Tooltip>
            ) : (
              <span>其他拆包信息</span>
            )}
            <Icon
              type="right"
              className="page-next"
              style={total <= offset + limit ? { opacity: '0.4', cursor: 'unset' } : {}}
              onClick={() => this.handlePageChange('next')}
            />
          </div>
        ),
        align: 'center',
        className: 'other-unpack-info-td',
        render: (value, record) =>
          isFold[index] ? (
            <div>
              <Icon
                className="other-unpack-info-title-i"
                type="caret-right"
                onClick={() => this.handleFoldClick(index)}
              />
              <div style={{ width: '22px', margin: '0 auto' }}>{value.receiverResName}</div>
            </div>
          ) : (
            <div>
              <Icon
                className="other-unpack-info-title-i"
                style={{ right: '5px', left: 'unset' }}
                type="caret-left"
                onClick={() => this.handleFoldClick(index)}
              />
              <OtherUnpackInfo taskKey={taskKey} dataSource={value} />
            </div>
          ),
      });
    });
    updateData.forEach((item, index) => {
      arr.push({
        dataIndex: `up${index}`,
        colSpan: index === 0 ? updateData.length : 0,
        width: '400px',
        // title: '本次拆包信息',
        className: 'unpack-info-td',
        title: () => (
          <div style={{ position: 'relative' }}>
            <span>本次拆包信息</span>
            {!fromFlow ? <Icon type="plus" className="add" onClick={this.handleAdd} /> : ''}
          </div>
        ),
        render: (value, record) => (
          <UnpackInfo
            order={index}
            fromFlow={fromFlow}
            formCheckRes={formCheckRes[index] ? formCheckRes[index] : {}}
          />
        ),
      });
    });
    return arr;
  };

  // 构造下表数据
  structureQtyData = () => {
    const {
      splitPack: { actData, pastData, updateData, actCheckRes },
    } = this.props;
    const [...arr] = actData;
    const totalObj = {};
    pastData.forEach((item, index) => {
      let total = 0;
      actData.forEach((y, j) => {
        arr[j][`checked${index}`] = false;
        arr[j][`splitQty${index}`] = null;
        item.resActivityList.forEach((x, i) => {
          if (
            y.projActivityId || y.projActivityId === 0 // 用来判断projActivityId是否是一个有效值，不是判断一个固定id的特殊记录，不用多租户改造
              ? y.projActivityId === x.projActivityId
              : y.actNo === x.actNo
          ) {
            arr[j][`checked${index}`] = true;
            arr[j][`splitQty${index}`] = x.eqvaQty;
            total = add(total, parseFloat(x.eqvaQty) ? parseFloat(x.eqvaQty) : 0);
          }
        });
      });
      totalObj[`splitQty${index}`] = total;
    });
    updateData.forEach((item, index) => {
      let total = 0;
      actData.forEach((y, j) => {
        arr[j][`up_checked${index}`] = false;
        arr[j][`hasError${index}`] = false;
        arr[j][`up_splitQty${index}`] = null;
        item.resActivityList.forEach((x, i) => {
          if (
            y.projActivityId || y.projActivityId === 0 // 用来判断projActivityId是否是一个有效值，不是判断一个固定id的特殊记录，不用多租户改造
              ? y.projActivityId === x.projActivityId
              : y.actNo === x.actNo
          ) {
            arr[j][`up_checked${index}`] = true;
            arr[j][`up_splitQty${index}`] = x.eqvaQty;
            if (
              (y.projActivityId || y.projActivityId === 0) && // 用来判断projActivityId是否是一个有效值，不是判断一个固定id的特殊记录，不用多租户改造
              actCheckRes[index] &&
              actCheckRes[index][y.projActivityId]
            ) {
              arr[j][`hasError${index}`] = true;
            } else if (
              (y.actNo || y.actNo === 0) &&
              actCheckRes[index] &&
              actCheckRes[index][y.actNo]
            ) {
              arr[j][`hasError${index}`] = true;
            }
            total = add(total, parseFloat(x.eqvaQty) ? parseFloat(x.eqvaQty) : 0);
          }
        });
      });
      totalObj[`up_splitQty${index}`] = total;
    });
    arr.push({
      id: '-1',
      actName: '总计',
      eqvaQty: actData.reduce((prev, cur, index) => add(prev, cur.eqvaQty), 0),
      ...totalObj,
    });
    return arr;
  };

  // 构造下表列配置，将后端返回的数组转换为列
  structureQtyColumns = () => {
    const {
      fromFlow,
      splitPack: { pastData, updateData, isFold },
    } = this.props;
    const arr = [
      {
        dataIndex: 'actName',
        title: '活动名称',
        width: '300px',
      },
      {
        dataIndex: 'eqvaQty',
        title: '活动当量',
        width: '100px',
        align: 'center',
      },
    ];
    pastData.forEach((item, index) => {
      arr.push({
        dataIndex: `checked${index}`,
        // colSpan: index === 0 ? pastData.length : 0,
        title: '选择',
        width: '100px',
        align: 'center',
        render: (value, record) =>
          record.id !== '-1' ? <Checkbox disabled checked={value} /> : null,
      });
      isFold[index]
        ? null
        : arr.push({
            dataIndex: `splitQty${index}`,
            title: '拆包当量数',
            width: '300px',
            align: 'center',
          });
    });
    updateData.forEach((item, index) => {
      arr.push({
        dataIndex: `up_checked${index}`,
        title: '选择',
        width: '100px',
        align: 'center',
        render: (value, record, i) =>
          record.id !== '-1' ? (
            <Checkbox
              disabled={fromFlow}
              checked={value}
              onChange={e => this.handleCheckChange(e, index, record)}
            />
          ) : null,
      });
      arr.push({
        dataIndex: `up_splitQty${index}`,
        title: '拆包当量数',
        width: '300px',
        align: 'center',
        render: (value, record, i) =>
          record.id !== '-1' ? (
            <InputNumber
              style={record[`hasError${index}`] ? { borderColor: 'red' } : {}}
              min={0}
              disabled={!record[`up_checked${index}`] || fromFlow}
              value={value}
              onChange={e => this.handleUnpackQtyChange(e, index, record)}
            />
          ) : (
            value
          ),
      });
    });
    return arr;
  };

  // 上下两张表实际上是上面表格的footer里套着另一张表
  render() {
    const {
      splitPack: { updateData, isFold },
      fromFlow,
      loading,
    } = this.props;
    // 计算整张表的宽度
    const offsetX = isFold.reduce((prev, cur, index, arr) => {
      if (cur) {
        return prev + 100;
      }
      return prev + 400;
    }, 400 * updateData.length + 400);

    const tableProps = {
      rowKey: 'id',
      className: 'splitPack_table',
      style: { width: 'max-content' },
      dataSource: this.structureResData(),
      columns: this.structureResColumns(),
      pagination: false,
      bordered: true,
      scroll: { x: offsetX },
      footer: () => (
        <Table
          columns={this.structureQtyColumns()}
          dataSource={this.structureQtyData()}
          pagination={false}
          scroll={{ x: offsetX }}
          rowKey="id"
        />
      ),
    };

    return (
      <Spin
        spinning={
          loading.effects[`${DOMAIN}/querySplitPackId`] ||
          loading.effects[`${DOMAIN}/querySplitPackInfo`] ||
          loading.effects[`${DOMAIN}/querySplitPackActivityInfo`] ||
          loading.effects[`${DOMAIN}/querySplitPackOtherInfo`] ||
          loading.effects[`${DOMAIN}/querySplitPackEditInfo`] ||
          // loading.effects[`${DOMAIN}/queryBuSettleInfo`] ||
          loading.effects[`${DOMAIN}/addSplitPack`] ||
          loading.effects[`${DOMAIN}/updateSplitPack`] ||
          false
        }
      >
        {!fromFlow ? (
          <PageHeaderWrapper title="拆包工作台">
            <Card className="tw-card-rightLine" bordered={false}>
              <Button onClick={this.handleSubmit} className="tw-btn-primary" size="large">
                提交
              </Button>
              {/* <Button onClick={this.handleAdd} type="primary" size="large">
                新增
              </Button> */}
            </Card>
            <Card className="tw-card-rightLine">
              <Table {...tableProps} />
            </Card>
          </PageHeaderWrapper>
        ) : (
          <Card className="tw-card-rightLine" bordered={false}>
            <Table {...tableProps} />
          </Card>
        )}
      </Spin>
    );
  }
}

export default SplitPack;
