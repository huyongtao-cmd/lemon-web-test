import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Icon, Tooltip, Divider, Table, Spin } from 'antd';
import router from 'umi/router';
import { mountToTab } from '@/layouts/routerControl';
import { equals, type } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import DescriptionList from '@/components/layout/DescriptionList';
import { flowToRouter } from '@/utils/flowToRouter';
import MD5 from 'crypto-js/md5';
import styles from './index.less';
import capaStyles from '../capa.less';

@connect(({ loading, myAbilityGrowthIndividualAbility, user, dispatch }) => ({
  myAbilityGrowthIndividualAbility,
  dispatch,
  user,
  loading,
}))
@mountToTab()
class LeveIdTagModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      visible,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
    }
    return null;
  }

  toggleVisible = () => {
    const { visibleChange } = this.props;
    type(visibleChange) === 'Function' && visibleChange();
  };

  jumpLink = (defKey, id, taskId, prcId) => {
    const route = flowToRouter(defKey, {
      id: prcId, // prcId
      taskId,
      docId: id, // id
      mode: 'edit',
    });
    if (route) {
      this.toggleVisible();
      router.push(route);
    } else {
      createMessage({
        type: 'error',
        description: '获取流程信息失败',
      });
    }
  };

  goLink = row => {
    const {
      dispatch,
      user: {
        user: {
          info: { email },
        },
      },
    } = this.props;
    const { results, id, prcId, taskId, defKey } = row;
    const courseCode = row.courseNo;
    const loginName = email;
    const corpCode = 'elitesland';
    const timestamp = Date.now();
    const secret = MD5([courseCode, loginName, corpCode, timestamp].sort().join(''));
    switch (results) {
      case '审核中':
        this.jumpLink(defKey, id, taskId, prcId);
        break;
      case '进入学习':
        window.open(
          `http://v4.21tb.com/els/provider.newSyncUserAndPlay.do?courseCode=${courseCode}&loginName=${loginName}&corpCode=${corpCode}&timestamp=${timestamp}&secret=${secret}`,
          '_blank'
        );
        break;
      case '上传证书':
        dispatch({
          type: `growthInfo/saveCertFnHandle`,
          payload: {
            capaLevelId: row.capaLevelId,
            capaAbilityId: row.capaAbilityId,
          },
        });
        break;
      case '申请审核':
        dispatch({
          type: `growthInfo/checkPointFnHandle`,
          payload: {
            capaLevelId: row.capaLevelId,
            capaAbilityId: row.capaAbilityId,
          },
        });
        break;
      default:
    }
  };

  checkpointName = (value, dispatch) => (
    <>
      {value.map(item => {
        const { courseName, examMethod, lessonId } = item;
        let examPointNameShow = courseName;
        let longName = false;
        if (courseName && courseName.length > 20) {
          examPointNameShow = courseName.substring(0, 20) + '...';
          longName = true;
        }

        let cpnComponents = (
          <div className={capaStyles['detail-point-style']} key={item.id}>
            {examPointNameShow}
          </div>
        );
        if (longName) {
          cpnComponents = (
            <Tooltip placement="top" title={<pre>{courseName}</pre>} key={item.id}>
              <div className={capaStyles['detail-point-style']}>{examPointNameShow}</div>
            </Tooltip>
          );
        }
        if (examMethod === 'ONLINE') {
          cpnComponents = (
            <div className={capaStyles['detail-point-style']}>
              <span key={item.id} className={styles.courseName}>
                {courseName}
              </span>
            </div>
          );
        }
        return cpnComponents;
      })}
    </>
  );

  checkpointPerson = (value, row) => (
    <>
      {value.map(item => {
        const { results } = item;
        return results === '存在' ? (
          <div className={capaStyles['detail-point-style']} key={item.courseNo}>
            <Icon type="check" style={{ color: '#52c41a' }} />
          </div>
        ) : (
          <div className={capaStyles['detail-point-style']} key={item.courseNo}>
            <span
              style={{ cursor: 'pointer', color: '#284488' }}
              onClick={() => {
                this.goLink({ ...row, ...item });
                this.toggleVisible();
              }}
            >
              {results}
            </span>
          </div>
        );
      })}
    </>
  );

  render() {
    const {
      dispatch,
      loading,
      myAbilityGrowthIndividualAbility: { formData },
    } = this.props;
    const { visible } = this.state;

    const columns = [
      {
        title: '考核点',
        dataIndex: 'examPoint',
        key: 'name',
        width: '35%',
        align: 'center',
        render: (value, row, index) => (
          <>
            {value && value.length > 20 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 20)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            )}
            {row.isContains === 'true' ? (
              ''
            ) : (
              <span
                style={{
                  color: '#1890ff',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  dispatch({
                    type: `growthInfo/saveResTrainingProg`,
                    payload: {
                      ...row,
                    },
                  });
                }}
              >
                添加到【我的培训】
              </span>
            )}
          </>
        ),
      },
      {
        title: '考核方式',
        dataIndex: 'examMethodName',
        width: '15%',
        align: 'center',
      },
      {
        title: '培训课程',
        dataIndex: 'courseName',
        width: '35%',
        align: 'center',
        render: (value, row, index) =>
          this.checkpointName(row.trainingProgCourseViewList || [], dispatch),
      },
      {
        title: '',
        dataIndex: 'results',
        align: 'center',
        width: '15%',
        render: (val, row, index) =>
          this.checkpointPerson(row.trainingProgCourseViewList || [], row),
      },
    ];

    return (
      <Modal
        title="考核点"
        visible={visible}
        onOk={() => this.toggleVisible()}
        onCancel={() => this.toggleVisible()}
        destroyOnClose
        width={900}
      >
        <Spin spinning={loading.effects[`myAbilityGrowthIndividualAbility/capaAbility`]}>
          <div className={styles.LeveIdTagModal}>
            <div className={styles.title}>{formData.capaName || '-'}</div>
            <p className={styles.marginTop10px}>{formData.ddesc || '-'}</p>
            <div className={styles.marginTop10px}>
              <span className={styles.lable}>分类：</span>
              <span>{formData.capaTypeName || '-'}</span>
            </div>
          </div>

          <Divider dashed />
          <DescriptionList size="large" col={1} title="考核点" noTop>
            <div style={{ color: '#1890ff', margin: '5px 0' }}>
              <Icon type="exclamation-circle" />
              &nbsp;
              <span>以下考核全部通过后，能力会自动获得</span>
            </div>
          </DescriptionList>
          <Table
            bordered
            rowKey="ids"
            dataSource={formData.twAbilityView || []}
            columns={columns}
          />
        </Spin>
      </Modal>
    );
  }
}

export default LeveIdTagModal;
