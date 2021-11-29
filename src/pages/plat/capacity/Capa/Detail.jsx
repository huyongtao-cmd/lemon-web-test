import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { ascend, prop, sort } from 'ramda';

import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { TagOpt } from '@/utils/tempUtils';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import CourseDetail from '../Component/Modal/course';
import styles from './capa.less';

const DOMAIN = 'platCapaDetail';
const { Description } = DescriptionList;

@connect(({ loading, platCapaDetail }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...platCapaDetail,
}))
@mountToTab()
class CapaDetail extends PureComponent {
  state = {
    courseDetailShow: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    }
  }

  handleCancel = () => {
    closeThenGoto('/hr/capacity/main');
  };

  checkpointName = (value, dispatch) => (
    <>
      {value.map(item => {
        const { examPointName, examMethod, lessonId } = item;
        let examPointNameShow = examPointName;
        let longName = false;
        if (examPointName && examPointName.length > 30) {
          examPointNameShow = examPointName.substring(0, 30) + '...';
          longName = true;
        }

        let cpnComponents = (
          <div className={styles['detail-point-style']} key={item.id}>
            {examPointNameShow}
          </div>
        );
        if (longName) {
          cpnComponents = (
            <Tooltip placement="top" title={<pre>{examPointName}</pre>} key={item.id}>
              <div className={styles['detail-point-style']}>{examPointNameShow}</div>
            </Tooltip>
          );
        }
        if (examMethod === 'ONLINE') {
          cpnComponents = (
            <div className={styles['detail-point-style']}>
              <span
                key={item.id}
                className={styles.courseName}
                onClick={() => {
                  this.setState({
                    courseDetailShow: true,
                  });
                  dispatch({
                    type: `${DOMAIN}/queryCourseDetail`,
                    payload: {
                      id: lessonId,
                    },
                  });
                }}
              >
                {examPointName}
              </span>
            </div>
          );
        }
        return cpnComponents;
      })}
    </>
  );

  checkpointMode = value => (
    <>
      {value.map(item => (
        <div className={styles['detail-point-style']} key={item.id}>
          {item.examMethodName}
        </div>
      ))}
    </>
  );

  checkpointPerson = value => (
    <>
      {value.map(item => {
        const { levelFlag, examMethod, apprType, apprTypeName } = item;

        let { appResName } = item;
        if (levelFlag) {
          appResName += '及以上级别';
        }
        // if (examMethod === 'SYS' || examMethod === 'ONLINE') {
        //   appResName = '不需人工审核';
        // }
        if (
          apprType === 'CAPA_ADMIN' ||
          apprType === 'P_RES' ||
          apprType === 'BU_PIC' ||
          apprType === 'NO_APPR'
        ) {
          appResName = apprTypeName;
        }
        return (
          <div className={styles['detail-point-style']} key={item.id}>
            {appResName}
          </div>
        );
      })}
    </>
  );

  onToggle = () => {
    const { courseDetailShow } = this.state;
    this.setState({
      courseDetailShow: !courseDetailShow,
    });
  };

  render() {
    const {
      loading,
      dispatch,
      detailForm = {},
      detailList,
      selAbilityId,
      tablePropsList,
      tableDetailPropsList,
      hasLevelFlagTablePropsList,
      courseDetail = {},
    } = this.props;
    const { courseDetailShow } = this.state;
    const {
      id,
      levelId,
      capaName,
      capaNo,
      capaType1,
      capaType1Name,
      capaType2,
      capaType2Name,
      ddesc,
      hasLevelFlag,
      capaStatusName,
      levelName,
    } = detailForm;

    const tableDetailPropsHaveLevelFlag = {
      rowKey: 'id',
      bordered: true,
      pagination: false,
      size: 'small',
      selectedRowKeys: null,
      dataSource: hasLevelFlagTablePropsList || [],
      scroll: {
        x: 1050,
      },
      columns: [
        {
          title: '级别',
          dataIndex: 'leveldName',
          key: 'leveldName',
          align: 'center',
          width: 150,
        },
        {
          title: '能力描述',
          dataIndex: 'cdDesc',
          key: 'cdDesc',
          width: 300,
          render: (value, row, index) => {
            let cdDescCom = <pre className={styles.cdDesc}>{value}</pre>;
            if (value && value.length > 32) {
              const newValue = value.substring(0, 32) + '...';
              cdDescCom = (
                <Tooltip placement="top" title={cdDescCom}>
                  <div className={styles['detail-point-style']}>{newValue}</div>
                </Tooltip>
              );
            }
            return cdDescCom;
          },
        },
        {
          title: '考核点',
          dataIndex: 'checkpoint',
          key: 'checkpointName',
          align: 'left',
          width: 200,
          render: (value, row, index) => this.checkpointName(value, dispatch),
        },
        {
          title: '考核方式',
          dataIndex: 'checkpoint',
          key: 'checkpointMode',
          align: 'center',
          width: 150,
          render: (value, row, index) => this.checkpointMode(value),
        },
        {
          title: '审核人',
          dataIndex: 'checkpoint',
          key: 'checkpointPerson',
          align: 'center',
          width: 250,
          render: (value, row, index) => this.checkpointPerson(value),
        },
      ],
    };

    const tableDetailPropsNoLevelFlag = {
      rowKey: 'id',
      bordered: true,
      pagination: false,
      size: 'small',
      selectedRowKeys: null,
      dataSource: tableDetailPropsList || [],
      columns: [
        {
          title: '考核点',
          dataIndex: 'examPoint',
          key: 'examPoint',
          align: 'center',
          render: (value, row, index) => {
            const { examMethod, lessonId } = row;
            let examMethodCom = value;
            if (examMethod === 'ONLINE') {
              examMethodCom = (
                <div
                  className={styles['detail-point-style']}
                  style={{
                    minHeight: 'auto',
                    padding: '0',
                  }}
                >
                  <span
                    className={styles.courseName}
                    onClick={() => {
                      this.setState({
                        courseDetailShow: true,
                      });
                      dispatch({
                        type: `${DOMAIN}/queryCourseDetail`,
                        payload: {
                          id: lessonId,
                        },
                      });
                    }}
                  >
                    {value}
                  </span>
                </div>
              );
            }

            return examMethodCom;
          },
        },
        {
          title: '考核方式',
          dataIndex: 'examMethodName',
          key: 'examMethodName',
          align: 'center',
        },
        {
          title: '审核人',
          dataIndex: 'appResName',
          key: 'appResName',
          align: 'center',
          render: (value, row, index) => {
            const { levelFlag, examMethod, apprType, apprTypeName } = row;

            let appResName = value;
            if (levelFlag) {
              appResName = value + '及以上级别';
            }
            // if (examMethod === 'SYS' || examMethod === 'ONLINE') {
            //   appResName = '不需人工审核';
            // }
            if (
              apprType === 'CAPA_ADMIN' ||
              apprType === 'P_RES' ||
              apprType === 'BU_PIC' ||
              apprType === 'NO_APPR'
            ) {
              appResName = apprTypeName;
            }

            return appResName;
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="能力明细页">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        {loading ? (
          <Loading />
        ) : (
          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title
                icon="profile"
                id="ui.menu.hr.capacity.capa.det"
                defaultMessage="单项能力详情"
              />
            }
          >
            <DescriptionList size="large">
              <Description term="编号">{capaNo}</Description>
              <Description term="能力名称">{capaName}</Description>
              <Description term="分类">
                {capaType1Name}-{capaType2Name}
              </Description>
              <Description term="级别">{hasLevelFlag ? levelName : '无级别'}</Description>
              <Description term="状态">{capaStatusName}</Description>
            </DescriptionList>
            {!hasLevelFlag && (
              <DescriptionList size="large" col="1">
                <Description term="能力描述" style={{ marginTop: '-16px' }}>
                  <pre>{ddesc}</pre>
                </Description>
              </DescriptionList>
            )}
            <Divider dashed />
            {!hasLevelFlag && (
              <FieldList legend="考核点" noReactive>
                <Table {...tableDetailPropsNoLevelFlag} />
              </FieldList>
            )}

            {hasLevelFlag ? (
              <FieldList legend="级别定义" noReactive>
                <div className={styles['table-clear-padding']}>
                  <Table {...tableDetailPropsHaveLevelFlag} />
                </div>
              </FieldList>
            ) : (
              ''
            )}
          </Card>
        )}
        <CourseDetail
          visible={courseDetailShow}
          courseDetail={courseDetail}
          onToggle={this.onToggle}
        />
      </PageHeaderWrapper>
    );
  }
}

export default CapaDetail;
