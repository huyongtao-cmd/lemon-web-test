import React, { PureComponent } from 'react';
import { connect } from 'dva';
import createMessage from '@/components/core/AlertMessage';
import { Row, Col, Input, InputNumber, Modal, Icon, Tooltip } from 'antd';
import { UdcSelect, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectUsersAll } from '@/services/sys/user';
import { selectBus } from '@/services/org/bu/bu';
import styles from './UnpackInfo.less';

const DOMAIN = 'splitPack';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, splitPack, dispatch }) => ({
  loading,
  splitPack,
  dispatch,
}))
class UnpackInfo extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      order,
      splitPack: { updateData, jobType2Data, capasetLevelList },
    } = this.props;
    jobType2Data[order] = [];
    capasetLevelList[order] = [];
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        jobType2Data,
        capasetLevelList,
      },
    });
    // if (updateData && updateData[order] && updateData[order].jobType1) {
    //   dispatch({
    //     type: `${DOMAIN}/updateJobType2`,
    //     payload: { value: updateData[order].jobType1, order },
    //   });
    //   if (updateData && updateData[order] && updateData[order].jobType2) {
    //     dispatch({
    //       type: `${DOMAIN}/updateCapasetLevelList`,
    //       payload: {
    //         jobType1: updateData[order].jobType1,
    //         jobType2: updateData[order].jobType2,
    //         order,
    //       },
    //     });
    //   }
    // }
  }

  componentDidUpdate = () => {};

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const {
      dispatch,
      order,
      splitPack: { updateData, jobType2Data, capasetLevelList },
    } = this.props;
    const [...arr] = updateData;
    arr[order].jobType2 = null;
    arr[order].capasetLeveldId = '';
    arr[order].jobType1 = value;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: arr,
      },
    });
    jobType2Data[order] = [];
    capasetLevelList[order] = [];
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { jobType2Data, capasetLevelList },
    });
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: { value, order },
    });
  };

  // 工种子类 -> 级别
  handleChangeJobType2 = value => {
    const {
      dispatch,
      order,
      splitPack: { updateData, capasetLevelList },
    } = this.props;
    const [...arr] = updateData;
    const { jobType1 } = updateData[order];
    arr[order].capasetLeveldId = '';
    arr[order].jobType2 = value;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: arr,
      },
    });
    capasetLevelList[order] = [];
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { capasetLevelList },
    });
    dispatch({
      type: `${DOMAIN}/updateCapasetLevelList`,
      payload: {
        jobType1,
        jobType2: value,
        order,
      },
    });
  };

  handleChangeCapasetLevelList = value => {
    const {
      dispatch,
      order,
      splitPack: { updateData },
    } = this.props;
    const [...arr] = updateData;
    arr[order].capasetLeveldId = value;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: arr,
      },
    });
  };

  // 根据选择的接收资源获得接收资源bu
  fetchBU = value => {
    const {
      dispatch,
      order,
      splitPack: { updateData, jobType2Data, capasetLevelList },
    } = this.props;
    const [...arr] = updateData;
    arr[order].receiverResId = value;
    arr[order].receiverBuId = null;
    arr[order].jobType1 = null;
    arr[order].jobType2 = null;
    arr[order].capasetLeveldId = null;
    jobType2Data[order] = [];
    capasetLevelList[order] = [];
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: arr,
        jobType2Data,
        capasetLevelList,
      },
    });
    if (value) {
      dispatch({
        type: `${DOMAIN}/queryBu`,
        payload: {
          resId: value,
        },
      }).then(res => {
        if (res) {
          arr[order].receiverBuId = res;
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              updateData: arr,
            },
          });
        }
      });
      dispatch({
        type: `${DOMAIN}/queryCapasetLevel`,
        payload: {
          resId: value,
        },
      }).then(res => {
        if (res) {
          arr[order].jobType1 = res.jobType1;
          arr[order].jobType2 = res.jobType2;
          arr[order].capasetLeveldId = res.capasetLevelId;
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              updateData: arr,
            },
          });
          if (res.jobType1) {
            dispatch({
              type: `${DOMAIN}/updateJobType2`,
              payload: { value: res.jobType1, order },
            });
            if (res.jobType2) {
              dispatch({
                type: `${DOMAIN}/updateCapasetLevelList`,
                payload: {
                  jobType1: res.jobType1,
                  jobType2: res.jobType2,
                  order,
                },
              });
            }
          }
        }
      });
    }
  };

  // 删除整列
  handleDeleteClick = index => {
    const {
      splitPack: { updateData, jobType2Data, capasetLevelList, formCheckRes, actCheckRes },
      dispatch,
    } = this.props;
    if (updateData.length <= 1) {
      createMessage({ type: 'warn', description: '至少有一个本次拆包' });
    } else {
      const [...arr] = updateData;
      const [...jobType2Arr] = jobType2Data;
      const [...capasetLevelArr] = capasetLevelList;
      const [...formCheckArr] = formCheckRes;
      const [...actCheckArr] = actCheckRes;
      Modal.confirm({
        title: '确定要删除此列吗?',
        content: '这样做会删除掉整列的数据',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          arr.splice(index, 1);
          jobType2Arr.splice(index, 1);
          capasetLevelArr.splice(index, 1);
          formCheckArr.splice(index, 1);
          actCheckArr.splice(index, 1);
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              updateData: arr,
              jobType2Data: jobType2Arr,
              capasetLevelList: capasetLevelArr,
              formCheckRes: formCheckArr,
              actCheckRes: actCheckArr,
            },
          });
        },
        onCancel() {},
      });
    }
  };

  handlePakeNameChange = e => {
    const {
      order,
      dispatch,
      splitPack: { updateData },
    } = this.props;
    const [...arr] = updateData;
    arr[order].taskName = e.target.value;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: arr,
      },
    });
  };

  handleChangeQg = e => {
    const {
      order,
      dispatch,
      splitPack: { updateData },
    } = this.props;
    const [...arr] = updateData;
    arr[order].guaranteeRate = e;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        updateData: arr,
      },
    });
  };

  render() {
    const {
      loading,
      order,
      fromFlow,
      formCheckRes,
      splitPack: { jobType2Data, capasetLevelList, updateData, usersArr, busArr, jobType1Arr },
    } = this.props;

    return (
      <>
        {!fromFlow ? (
          <Icon
            className="unpack-info-title-i"
            type="close"
            onClick={() => {
              this.handleDeleteClick(order);
            }}
          />
        ) : (
          ''
        )}
        <Row style={{ width: '340px', marginBottom: '8px' }}>
          <Col>
            <Tooltip title="任务包名称">
              <Input
                style={formCheckRes.taskName ? { borderColor: 'red' } : {}}
                disabled={fromFlow}
                placeholder="请输入任务包名称"
                value={updateData[order].taskName}
                onChange={this.handlePakeNameChange}
              />
            </Tooltip>
          </Col>
        </Row>
        <Row style={{ width: '340px', marginBottom: '8px' }}>
          <Col>
            <Tooltip title="接收资源">
              <Selection.Columns
                disabled={fromFlow}
                className={formCheckRes.receiverResId ? styles.error : 'x-fill-100'}
                value={updateData[order].receiverResId}
                placeholder="请选择接收资源"
                source={usersArr}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                onChange={value => {
                  this.fetchBU(value);
                }}
              />
            </Tooltip>
          </Col>
        </Row>
        <Row gutter={8} style={{ width: '348px', marginBottom: '8px' }}>
          <Col span={8}>
            <Tooltip title="复合能力">
              <Selection
                className={formCheckRes.jobType1 ? styles.error : ''}
                style={{ width: '100%' }}
                disabled={fromFlow || loading.effects[`${DOMAIN}/queryCapasetLevel`] || false}
                value={updateData[order].jobType1}
                source={jobType1Arr}
                onChange={val => {
                  this.handleChangeJobType1(val);
                }}
              />
            </Tooltip>
          </Col>
          <Col span={8}>
            <Tooltip title="复合能力">
              <Selection
                className={formCheckRes.jobType2 ? styles.error : ''}
                style={{ width: '100%' }}
                disabled={fromFlow || loading.effects[`${DOMAIN}/queryCapasetLevel`] || false}
                value={updateData[order].jobType2}
                source={jobType2Data[order] || []}
                placeholder="选择复合能力"
                onChange={this.handleChangeJobType2}
              />
            </Tooltip>
          </Col>
          <Col span={8}>
            <Tooltip title="复合能力">
              <Selection
                className={formCheckRes.capasetLeveldId ? styles.error : ''}
                style={{ width: '100%' }}
                disabled={fromFlow || loading.effects[`${DOMAIN}/queryCapasetLevel`] || false}
                value={updateData[order].capasetLeveldId}
                source={capasetLevelList[order] || []}
                placeholder="选择复合能力"
                onChange={this.handleChangeCapasetLevelList}
              />
            </Tooltip>
          </Col>
        </Row>
        <Row style={{ width: '340px', marginBottom: '8px' }}>
          <Col>
            <Tooltip title="接收资源BU">
              <Selection
                className={formCheckRes.receiverBuId ? styles.error : 'x-fill-100'}
                value={updateData[order].receiverBuId}
                source={busArr}
                placeholder="根据接收资源自动带出"
                disabled
              />
            </Tooltip>
          </Col>
        </Row>
        <Row style={{ width: '340px' }}>
          <Col>
            <Tooltip title="质保金比例">
              <InputNumber
                style={formCheckRes.guaranteeRate ? { borderColor: 'red' } : {}}
                disabled={fromFlow}
                value={updateData[order].guaranteeRate}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                min={0}
                max={100}
                onChange={this.handleChangeQg}
              />
            </Tooltip>
          </Col>
        </Row>
      </>
    );
  }
}

export default UnpackInfo;
