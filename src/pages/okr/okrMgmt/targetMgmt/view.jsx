/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Form,
  Button,
  Input,
  InputNumber,
  Row,
  Col,
  Progress,
  Card,
  Icon,
  Divider,
  Tabs,
  Drawer,
  Steps,
  Switch,
  Avatar,
  List,
  Tooltip,
  Radio,
} from 'antd';
import { mountToTab, closeThenGoto, markAsTab, markAsNoTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';
import createMessage from '@/components/core/AlertMessage';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty, isNil, toString } from 'ramda';
import { mul, div } from '@/utils/mathUtils';
import moment from 'moment';
import DescriptionList from '@/components/layout/DescriptionList';
import { Selection, DatePicker } from '@/pages/gen/field';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import GradeTypeView from './component/GradeTypeView';
import Comment from './component/Comment';

import styles from './style.less';

const { Field } = FieldList;
const { Description } = DescriptionList;
const { TabPane } = Tabs;
const { Step } = Steps;
const RadioGroup = Radio.Group;
const DOMAIN = 'targetMgmt';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, targetMgmt, dispatch, gradeType, user }) => ({
  targetMgmt,
  dispatch,
  gradeType,
  loading:
    loading.effects[`${DOMAIN}/kRUpdate`] ||
    loading.effects[`${DOMAIN}/workPlanUpdate`] ||
    loading.effects[`${DOMAIN}/workPlanInsert`] ||
    loading.effects[`${DOMAIN}/workLogSave`],
  user,
}))
@Form.create({})
@mountToTab()
class TargetMgmtView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      childrenDrawer: false,
      workPlanInsertVisible: false,
      workPlanEditVisible: false,
      writeLogVisible: false,
      dates: ['', ''],
      gradeTypeVisible: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      targetMgmt: { formDataView },
    } = this.props;
    const { id } = fromQs();

    dispatch({ type: `${DOMAIN}/cleanView` }).then(res => {
      id &&
        dispatch({
          type: `${DOMAIN}/queryDetailView`,
          payload: {
            id,
          },
        }).then(ress => {
          if (!isNil(ress)) {
            dispatch({
              type: `${DOMAIN}/commentSelectDetail`,
              payload: {
                id: fromQs().id,
                objectSpeakFlag: 0,
                objectResId: ress.objectiveResId,
              },
            });
          }
        });
      id &&
        dispatch({
          type: `${DOMAIN}/queryWorkPlanDetail`,
          payload: {
            objectiveId: id,
          },
        });
    });
    dispatch({ type: `${DOMAIN}/res` });
  }

  getKeyResultDetail = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/keyResultDetail`,
      payload: {
        id,
      },
    });
  };

  getWorkPlanDetail = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getWorkPlanDetail`,
      payload: {
        id,
      },
    });
  };

  keyResultUpdate = () => {
    const {
      dispatch,
      targetMgmt: {
        keyResultFormData: { okrKeyresultId },
      },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/kRUpdate`,
    }).then(response => {
      if (response.ok) {
        createMessage({ type: 'success', description: '保存成功' });
        this.onChildrenDrawerClose(); // 请求成功后关闭第二层抽屉
        // this.onClose();
        // 重新拉去关键结果详情
        const { id } = fromQs();
        dispatch({
          type: `${DOMAIN}/queryDetailView`,
          payload: {
            id,
          },
        });
        // // 请求成功后拉取关键结果详情
        // dispatch({
        //   type: `${DOMAIN}/queryDetail`,
        //   payload: {
        //     id: fromQs().id,
        //   },
        // });
        // 请求成功后拉取目标详情
        dispatch({
          type: `${DOMAIN}/keyResultDetail`,
          payload: {
            id: okrKeyresultId,
          },
        });
      } else {
        createMessage({ type: 'error', description: response.reason || '操作失败' });
      }
    });
  };

  workPlanSubmit = id => {
    const {
      form: { validateFieldsAndScroll, setFields },
      dispatch,
      user: {
        user: { extInfo = {} },
      },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (isEmpty(values.dates[0]) || isNil(isEmpty(values.dates[0]))) {
          setFields({
            dates: {
              value: undefined,
              errors: [new Error('请选择日期范围')],
            },
          });
          return;
        }
        if (id) {
          dispatch({
            type: `${DOMAIN}/workPlanUpdate`,
            payload: { objectiveId: fromQs().id, id, ...values },
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '保存成功' });
              this.onPlanEditClose(); // 请求成功后抽屉
              // 请求成功后拉取工作计划详情
              dispatch({
                type: `${DOMAIN}/queryWorkPlanDetail`,
                payload: {
                  objectiveId: fromQs().id,
                },
              });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        } else {
          dispatch({
            type: `${DOMAIN}/workPlanInsert`,
            payload: {
              objectiveId: fromQs().id,
              planResId: extInfo.resId,
              ...values,
            },
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '保存成功' });
              this.onPlanInsertClose(); // 请求成功后抽屉
              // 请求成功后拉取工作计划详情
              dispatch({
                type: `${DOMAIN}/queryWorkPlanDetail`,
                payload: {
                  objectiveId: fromQs().id,
                },
              });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        }
      }
    });
  };

  workLogSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/workLogSave`,
          payload: {
            ...values,
          },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            this.onWriteLogClose(); // 请求成功后关闭抽屉
            // 请求成功后拉取工作计划详情
            dispatch({
              type: `${DOMAIN}/queryWorkPlanDetail`,
              payload: {
                objectiveId: fromQs().id,
              },
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  commentInsertFun = () => {
    const {
      dispatch,
      targetMgmt: {
        formDataView: { objectSpeakFlag, objectComment, objectSpeakFlagSubmit, objectiveResId },
      },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/commentInsert`,
      payload: {
        objectComment,
        okrObjectiveId: fromQs().id,
        objectSpeakFlag: objectSpeakFlagSubmit,
      },
    }).then(res => {
      if (res.ok) {
        dispatch({
          type: `${DOMAIN}/commentSelectDetail`,
          payload: {
            id: fromQs().id,
            objectSpeakFlag,
            objectResId: objectiveResId,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateFormView`,
          payload: {
            objectComment: null,
          },
        });
      }
    });
  };

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  showChildrenDrawer = () => {
    this.setState({
      childrenDrawer: true,
    });
  };

  onChildrenDrawerClose = () => {
    this.setState({
      childrenDrawer: false,
    });
  };

  showPlanInsertDrawer = () => {
    this.setState({
      workPlanInsertVisible: true,
    });
  };

  onPlanInsertClose = () => {
    this.setState({
      workPlanInsertVisible: false,
    });
  };

  showPlanEditDrawer = () => {
    this.setState({
      workPlanEditVisible: true,
    });
  };

  onPlanEditClose = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/cleanWorkPlanModal`,
      payload: {},
    });
    this.setState({
      workPlanEditVisible: false,
    });
  };

  showWriteLogDrawer = () => {
    this.setState({
      writeLogVisible: true,
    });
  };

  onWriteLogClose = () => {
    this.setState({
      writeLogVisible: false,
    });
  };

  onLikeChange = (v, index) => {
    const {
      dispatch,
      targetMgmt: {
        formDataView: { objectSpeakFlag, objectiveResId },
      },
    } = this.props;
    const { likeId, id } = v;
    dispatch({
      type: `${DOMAIN}/commentLike`,
      payload: {
        likeId,
        commentId: id,
        deleteKeys: likeId || null,
      },
    }).then(res => {
      if (res.ok) {
        dispatch({
          type: `${DOMAIN}/commentSelectDetail`,
          payload: {
            id: fromQs().id,
            objectSpeakFlag,
            objectResId: objectiveResId,
          },
        });
        return;
      }
      createMessage({ type: 'error', description: '操作失败' });
    });
  };

  commentSubmit = (item, childrenComment, index) => {
    const {
      dispatch,
      targetMgmt: {
        formDataView: { objectSpeakFlagSubmit, objectSpeakFlag, objectiveResId },
      },
    } = this.props;
    const { id, okrObjectiveId, resId } = item;
    dispatch({
      type: `${DOMAIN}/commentInsert`,
      payload: {
        pcommentId: id,
        okrObjectiveId,
        presId: resId,
        objectSpeakFlag,
        objectComment: childrenComment,
      },
    }).then(res => {
      if (res.ok) {
        dispatch({
          type: `${DOMAIN}/commentSelectDetail`,
          payload: {
            id: fromQs().id,
            objectSpeakFlag,
            objectResId: objectiveResId,
          },
        });
      }
    });
  };

  toggleVisible = () => {
    const { gradeTypeVisible } = this.state;
    this.setState({ gradeTypeVisible: !gradeTypeVisible });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      targetMgmt: {
        formDataView,
        keyresultListView,
        keyResultFormData,
        twKrprogView,
        workPlanList,
        workPlanFromData = {},
        workPlanTotal,
        commentList,
        commentLogList,
        resDataSource,
      },
      gradeType: { gradeTypeFormData, gradeTypeList, gradeTypeListDel },
      user: {
        user: { extInfo },
      },
    } = this.props;
    const {
      visible,
      childrenDrawer,
      workPlanInsertVisible,
      workPlanEditVisible,
      writeLogVisible,
      dates,
      gradeTypeVisible,
    } = this.state;
    const { id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ORG_G01', title: 'OKR发布审批流程' }];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={e => {
              const urls = getUrl();
              const from = stringify({ from: markAsNoTab(urls) });
              router.push(`/okr/okrMgmt/targetMgmt/targetPath?objectId=${id}&${from}`);
            }}
          >
            目标实现路径图
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <GradeTypeView
          onChange={v => {
            this.toggleVisible();
          }}
          visible={gradeTypeVisible}
        />

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="目标详情" />}
          bordered={false}
        >
          <Row gutter={26}>
            <Col span={9}>
              <div
                ref={e => {
                  this.rightCard = e;
                }}
              >
                <Card
                  bodyStyle={{
                    border: '1px',
                    boxShadow: '0px 0px 15px #e8e8e8',
                    position: 'relative',
                  }}
                  className={styles.cardRight}
                >
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                      }}
                    >
                      <Progress
                        type="circle"
                        width={70}
                        strokeColor="#22d7bb"
                        percent={formDataView.finalScore || ''}
                        format={percent => `${percent} 分`}
                      />
                    </div>
                    <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
                      <Field style={{ position: 'relative' }} label="目标名称" presentational>
                        <div
                          style={{
                            color: '#000',
                            fontSize: '16px',
                            fontWeight: 'bolder',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <span>{formDataView.objectiveName || ''}</span>
                        </div>
                      </Field>
                      <Field label="更新时间：" presentational>
                        <div>{formDataView.objectiveUpdatedate || ''}</div>
                      </Field>
                      <Field label="目标层次" presentational>
                        <span>{formDataView.objectiveTypeName || ''}</span>
                      </Field>
                      <Field label="目标主体：" presentational>
                        <span>{formDataView.objectiveSubjectName || ''}</span>
                      </Field>
                      <Field label="负责人" presentational>
                        {formDataView.objectiveResName || ''}
                      </Field>
                      <Field label="公开查看权限" presentational>
                        {formDataView.publicTag === 'true' && '是'}
                        {formDataView.publicTag === 'false' && '否'}
                      </Field>
                      {formDataView.publicTag === 'true' ? (
                        <Field label="公开范围" presentational>
                          {formDataView.objRangeName || ''}
                        </Field>
                      ) : null}
                      {formDataView.publicTag === 'true' && formDataView.objRange === 'BU' ? (
                        <Field label="公开BU" presentational>
                          {formDataView.rangeBuName || ''}
                        </Field>
                      ) : null}
                      {formDataView.publicTag === 'true' && formDataView.objRange === 'RES' ? (
                        <Field label="公开人员" presentational>
                          {formDataView.rangeResName || ''}
                        </Field>
                      ) : null}
                      <Field label="起始/结束日期" presentational>
                        {`${formDataView.beginDate || ''}~${formDataView.endDate || ''}`}
                      </Field>
                      <Field label="上级目标" presentational>
                        {formDataView.supObjectiveId ? (
                          <Card
                            title={
                              <span title={formDataView.supObjectiveName || ''}>
                                {formDataView.supObjectiveName || ''}
                              </span>
                            }
                            style={{
                              borderRadius: '6px',
                              boxShadow: ' 0px 0px 20px #e8e8e8',
                            }}
                          >
                            <p>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '50%',
                                  textAlign: 'center',
                                }}
                              >
                                目标主体
                              </span>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '50%',
                                  textAlign: 'center',
                                }}
                              >
                                负责人
                              </span>
                            </p>
                            <p>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '50%',
                                  textAlign: 'center',
                                }}
                              >
                                {formDataView.supObjecttveSubjectName || ''}
                              </span>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '50%',
                                  textAlign: 'center',
                                }}
                              >
                                {formDataView.supObjecttveResName || ''}
                              </span>
                            </p>
                          </Card>
                        ) : (
                          <span>无上级目标</span>
                        )}
                      </Field>
                      <Field label="整体进度" presentational>
                        <Progress
                          percent={Number(Number(formDataView.objectiveCurProg || 0).toFixed(2))}
                          status="active"
                        />
                      </Field>
                      <Field label="状态" presentational>
                        {formDataView.objectiveStatusName || ''}
                      </Field>
                      {/* <Field label="目标类别" presentational> */}
                      {/* {formDataView.objectiveClass1Name || ''} */}
                      {/* </Field> */}
                      {/* <Field label="目标子类" presentational> */}
                      {/* {formDataView.objectiveClass2Name || ''} */}
                      {/* </Field> */}
                      <Field label="创建人" presentational>
                        {formDataView.createUserName || ''}
                      </Field>
                      <Field label="类别码1" presentational>
                        {formDataView.objectiveCat1 || ''}
                      </Field>
                    </FieldList>
                  </>
                </Card>
              </div>
            </Col>
            <Col span={15}>
              <Card
                style={{
                  minHeight: this.rightCard && this.rightCard.clientHeight,
                  boxShadow: '0px 0px 15px #e8e8e8',
                }}
                bodyStyle={{ border: '1px' }}
              >
                <Tabs
                  defaultActiveKey="1"
                  onChange={activeKey => {
                    if (activeKey === '3' || activeKey === '4') {
                      dispatch({
                        type: `${DOMAIN}/commentSelectDetail`,
                        payload: {
                          id: fromQs().id,
                          objectSpeakFlag: formDataView.objectSpeakFlag,
                          objectResId: formDataView.objectiveResId,
                        },
                      });
                    }
                  }}
                  type="card"
                >
                  <TabPane tab="关键结果KR" key="1">
                    {keyresultListView.length > 0 ? (
                      keyresultListView.map((item, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <React.Fragment key={index}>
                          <Card
                            bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '100px' }}
                            bordered={false}
                          >
                            <span style={{ position: 'absolute', left: '20px' }}>
                              <Progress
                                width={60}
                                strokeColor="#22d7bb"
                                type="circle"
                                percent={Number(
                                  mul(
                                    div(Number(item.curProg || 0), Number(item.objValue || 1)),
                                    100
                                  ).toFixed(2)
                                )}
                              />
                            </span>
                            <div>
                              {item.keyresultName || ''}
                              &nbsp; &nbsp;
                              {`[权重${item.keyresultWeight}%]`}
                              &nbsp;&nbsp; 描述：
                              {item.keyresultDesc || ''}
                            </div>
                            <br />
                            <div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '180px',
                                }}
                              >
                                当前进度：
                                {item.curProg || 0}
                                {item.keyresultType === 'PERCENT' ? '%' : ''}
                                &nbsp;
                                <Icon
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    if (
                                      formDataView.objectiveStatus === 'SCORING' ||
                                      formDataView.objectiveStatus === 'COMPLETE'
                                    ) {
                                      createMessage({
                                        type: 'warn',
                                        description:
                                          '状态为结果打分中和已完成的目标不能更新关键结果KR进度！',
                                      });
                                      return;
                                    }
                                    this.showDrawer();
                                    this.getKeyResultDetail(item.okrKeyresultId);
                                  }}
                                  type="form"
                                />
                              </span>
                              <span style={{ display: 'inline-block', width: '150px' }}>
                                起始：
                                {item.iniValue || ''}
                                {item.keyresultType === 'PERCENT' ? '%' : ''}
                              </span>
                              <span style={{ display: 'inline-block', width: '150px' }}>
                                目标：
                                {item.objValue || ''}
                                {item.keyresultType === 'PERCENT' ? '%' : ''}
                              </span>
                              <span>
                                评分：
                                {!isNil(item.keyresultGrade) ? item.keyresultGrade : '-'}
                                {/* &nbsp; &nbsp; <Icon style={{ cursor: 'pointer' }} type="form" /> */}
                              </span>
                            </div>
                          </Card>
                          <Divider dashed />
                        </React.Fragment>
                      ))
                    ) : (
                      <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        暂无数据
                      </span>
                    )}
                  </TabPane>
                  <TabPane tab="关键行动KA" key="2">
                    <div>
                      <Button
                        className="tw-btn-primary"
                        size="large"
                        onClick={() => {
                          this.showPlanInsertDrawer();
                        }}
                      >
                        {formatMessage({ id: `misc.insert`, desc: '新增' })}
                      </Button>
                      <Card
                        className={styles.planContent}
                        bodyStyle={{ paddingTop: 6, paddingBottom: 5 }}
                        bordered={false}
                      >
                        <List
                          size="large"
                          rowKey="id"
                          loading={loading}
                          pagination={{
                            pageSize: 3,
                          }}
                          grid={{ gutter: 24, column: 1 }}
                          dataSource={workPlanList}
                          itemLayout="horizontal"
                          renderItem={item => (
                            <List.Item key={item.id}>
                              <Divider />
                              <div className={styles.planList}>
                                <div>
                                  {item.taskName} {`${item.dateFrom}~${item.dateTo}`}
                                </div>
                                <div>
                                  <span>状态：</span>
                                  <span>{item.planStatusName || ''}</span>
                                </div>
                                <div>
                                  <Icon
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      this.showPlanEditDrawer();
                                      this.getWorkPlanDetail(item.id);
                                    }}
                                    type="form"
                                  />
                                </div>
                              </div>
                              <div className={styles.planList}>
                                <div>
                                  <span>相关人：</span>
                                  <span>{item.relevantResName || ''}</span>
                                </div>
                                <div>
                                  <span style={{ marginLeft: 44 }}>优先级：</span>
                                  <span>{item.priority || ''}</span>
                                </div>
                                <div>
                                  <span
                                    style={{ cursor: 'pointer', color: 'blue' }}
                                    onClick={() => {
                                      this.showWriteLogDrawer();
                                      this.getWorkPlanDetail(item.id);
                                    }}
                                  >
                                    填日志
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div>
                                  <span>备注：</span>
                                  <span>{item.remark1 || ''}</span>
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </div>
                  </TabPane>
                  <TabPane tab="指导与评论" key="3">
                    <FieldList
                      legend="目标指导与评价"
                      layout="horizontal"
                      getFieldDecorator={getFieldDecorator}
                      col={1}
                    />
                    <br />
                    <Card bordered={false} bodyStyle={{ padding: '5px' }}>
                      <Input.TextArea
                        value={formDataView.objectComment}
                        onChange={e => {
                          dispatch({
                            type: `${DOMAIN}/updateFormView`,
                            payload: {
                              objectComment: e.target.value,
                            },
                          });
                        }}
                        style={{ marginBottom: '5px' }}
                        rows={3}
                      />
                      <div style={{ float: 'right' }}>
                        <span>
                          <Switch
                            checked={formDataView.objectSpeakFlagSubmit === 0}
                            onChange={e => {
                              dispatch({
                                type: `${DOMAIN}/updateFormView`,
                                payload: {
                                  objectSpeakFlagSubmit: e ? 0 : 1,
                                },
                              });
                            }}
                            checkedChildren="公开"
                            unCheckedChildren="私密"
                            defaultChecked
                          />
                        </span>
                        &nbsp; &nbsp;
                        <span>
                          <Button
                            onClick={e => {
                              if (!formDataView.objectComment) {
                                createMessage({
                                  type: 'warn',
                                  description: '评论内容不能为空！',
                                });
                                return;
                              }
                              this.commentInsertFun();
                            }}
                            className="tw-btn-default"
                          >
                            发布
                          </Button>
                        </span>
                      </div>
                    </Card>
                    <Card bordered={false} bodyStyle={{ padding: '5px' }}>
                      <Tabs
                        activeKey={formDataView.activeKey}
                        onChange={activeKey => {
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: {
                              commentList: [],
                            },
                          });
                          if (activeKey === 'msgBoard') {
                            dispatch({
                              type: `${DOMAIN}/updateFormView`,
                              payload: {
                                objectSpeakFlag: 0,
                                activeKey: 'msgBoard',
                              },
                            });
                            dispatch({
                              type: `${DOMAIN}/commentSelectDetail`,
                              payload: {
                                id: fromQs().id,
                                objectSpeakFlag: 0,
                                objectResId: formDataView.objectiveResId,
                              },
                            });
                          } else {
                            dispatch({
                              type: `${DOMAIN}/updateFormView`,
                              payload: {
                                objectSpeakFlag: 1,
                                activeKey: 'privateMsg',
                              },
                            });
                            dispatch({
                              type: `${DOMAIN}/commentSelectDetail`,
                              payload: {
                                id: fromQs().id,
                                objectSpeakFlag: 1,
                                objectResId: formDataView.objectiveResId,
                              },
                            });
                          }
                        }}
                      >
                        <TabPane tab="留言板" key="msgBoard">
                          <Comment
                            listData={commentList}
                            like
                            onLikeChange={v => this.onLikeChange(v)}
                            commentSubmit={(item, childrenComment, index) =>
                              this.commentSubmit(item, childrenComment, index)
                            }
                          />
                        </TabPane>
                        <TabPane
                          tab="私信"
                          // disabled={
                          //   !isNil(extInfo) &&
                          //   Number(extInfo.resId) !== Number(formDataView.objectiveResId)
                          // }
                          key="privateMsg"
                        >
                          <Comment
                            listData={commentList}
                            onLikeChange={v => this.onLikeChange(v)}
                            commentSubmit={(item, childrenComment, index) =>
                              this.commentSubmit(item, childrenComment, index)
                            }
                          />
                        </TabPane>
                      </Tabs>
                    </Card>
                  </TabPane>
                  <TabPane tab="动态" key="4">
                    <FieldList
                      legend="目标动态"
                      layout="horizontal"
                      getFieldDecorator={getFieldDecorator}
                      col={1}
                    />
                    <Steps
                      style={{ maxHeight: '350px', overflowY: 'scroll' }}
                      className={styles.commentLogList}
                      progressDot
                      direction="vertical"
                    >
                      {commentLogList.map((v, index) => (
                        <Step
                          // eslint-disable-next-line react/no-array-index-key
                          key={index}
                          title={v.modifyTime}
                          description={
                            <>
                              <span>{v.objectUpdResName || ''}</span>
                              &nbsp; &nbsp;
                              {index === commentLogList.length - 1 ? (
                                '创建目标'
                              ) : isNil(v.objectiveUpdProg) || isEmpty(v.objectiveUpdProg) ? (
                                '发表了评论'
                              ) : (
                                <>
                                  <span>{`更新了目标进度为${v.objectiveUpdProg || 0}%`}</span>
                                  &nbsp;&nbsp;&nbsp;
                                  <span>{`进度更新说明：${v.objectUpdDsec || ''}`}</span>
                                </>
                              )}
                            </>
                          }
                        />
                      ))}
                    </Steps>
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </Card>
        <Drawer
          title={
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bolder',
              }}
            >
              {keyResultFormData.keyresultName || ''}
            </span>
          }
          destroyOnClose
          onClose={this.onClose}
          visible={visible}
          width={800}
          className={styles.kRDrawer}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field label="当前进度" presentational>
              <Row gutter={20}>
                <Col span={20}>
                  <Progress
                    percent={Number(
                      mul(
                        div(Number(keyResultFormData.curProg), Number(keyResultFormData.objValue)),
                        100
                      ).toFixed(2)
                    )}
                    status="active"
                  />
                </Col>
                <Col span={4}>
                  <Icon
                    onClick={() => {
                      this.showChildrenDrawer();
                    }}
                    style={{ cursor: 'pointer' }}
                    type="form"
                  />
                </Col>
              </Row>
            </Field>
            <Field label="KR打分" presentational>
              <span>
                {!isNil(keyResultFormData.keyresultGrade) ? keyResultFormData.keyresultGrade : '-'}
              </span>
              &nbsp; &nbsp;&nbsp;&nbsp;
              {/* <Icon style={{ cursor: 'pointer' }} type="form" /> */}
              &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp;
              <Button
                className="tw-btn-primary"
                onClick={() => {
                  dispatch({
                    type: `gradeType/updateGradeTypeForm`,
                    payload: {
                      ...keyResultFormData,
                      gradeType:
                        keyResultFormData.krGrade && !isEmpty(keyResultFormData.krGrade)
                          ? keyResultFormData.krGrade[0].gradeType
                          : undefined,
                      gradeTypeName:
                        keyResultFormData.krGrade && !isEmpty(keyResultFormData.krGrade)
                          ? keyResultFormData.krGrade[0].gradeTypeName
                          : '',
                    },
                  });
                  dispatch({
                    type: `gradeType/updateState`,
                    payload: {
                      gradeTypeList: keyResultFormData.krGrade,
                    },
                  });
                  this.toggleVisible();
                }}
              >
                打分规则
              </Button>
            </Field>
            <Field label="周期" presentational>
              <span>
                {`${keyResultFormData.beginDate || ''} ~ ${keyResultFormData.endDate || ''}`}
              </span>
              &nbsp; &nbsp;&nbsp;
              {moment().diff(moment(keyResultFormData.endDate), 'days') > 0 ? (
                <span style={{ backgroundColor: '#99b3f3', padding: '5px', borderRadius: '4px' }}>
                  已过期
                  {moment().diff(moment(keyResultFormData.endDate), 'days')}天
                </span>
              ) : (
                ''
              )}
            </Field>
          </FieldList>
          <br />
          <br />
          <Steps progressDot direction="vertical">
            {twKrprogView.map((v, index) => (
              <Step
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                title={v.modifyTime}
                description={
                  <Card className={styles.updateLog} bodyStyle={{ padding: '10px' }}>
                    <DescriptionList size="large" col={2}>
                      <Description term="更新进度">
                        <span>
                          {`${Number(v.updProg).toLocaleString() || 0}${
                            v.keyresultType === 'PERCENT' ? '%' : ''
                          }`}
                        </span>
                      </Description>
                      <Description term="更新人">{v.resName || ''}</Description>
                    </DescriptionList>
                    <DescriptionList size="large" col={1}>
                      <Description term="更新说明">
                        <pre>{v.updDescTem || ''}</pre>
                      </Description>
                    </DescriptionList>
                  </Card>
                }
              />
            ))}
          </Steps>
          <Drawer
            title={
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'bolder',
                  textAlign: 'center',
                }}
              >
                关键结果KR进度更新
              </span>
            }
            width={600}
            destroyOnClose
            onClose={this.onChildrenDrawerClose}
            visible={childrenDrawer}
          >
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
              <Field label="结果衡量类型" presentational>
                {keyResultFormData.keyresultTypeName}
              </Field>
              <Field label="起始值-目标值" presentational>
                {keyResultFormData.keyresultType !== 'tag'
                  ? `${keyResultFormData.iniValue || 0}${
                      keyResultFormData.keyresultType === 'PERCENT' ? '%' : ''
                    } - ${keyResultFormData.objValue || 0}${
                      keyResultFormData.keyresultType === 'PERCENT' ? '%' : ''
                    }`
                  : ''}
              </Field>
              <Field label="当前进度" presentational>
                <Progress
                  percent={Number(
                    mul(
                      div(Number(keyResultFormData.curProg), Number(keyResultFormData.objValue)),
                      100
                    ).toFixed(2)
                  )}
                  status="active"
                />
              </Field>
              <Field label="更新进度" presentational>
                {keyResultFormData.keyresultType === 'PERCENT' && (
                  <>
                    <InputNumber
                      value={keyResultFormData.updProg || null}
                      precision={0}
                      min={0}
                      max={100}
                      style={{ width: '80%' }}
                      onChange={e => {
                        dispatch({
                          type: `${DOMAIN}/updateKRForm`,
                          payload: {
                            updProg: e || 0,
                          },
                        });
                      }}
                      placeholder="请输入更新进度"
                    />
                    <span> %</span>
                  </>
                )}
                {keyResultFormData.keyresultType === 'NUMBER' && (
                  <InputNumber
                    value={keyResultFormData.updProg || null}
                    precision={0}
                    min={0}
                    max={Number(keyResultFormData.objValue)}
                    style={{ width: '80%' }}
                    onChange={e => {
                      dispatch({
                        type: `${DOMAIN}/updateKRForm`,
                        payload: {
                          updProg: e || 0,
                        },
                      });
                    }}
                    placeholder="请输入更新进度"
                  />
                )}
                {keyResultFormData.keyresultType === 'tag' && (
                  <Switch
                    checked={keyResultFormData.acheiveTagTem === 'true'}
                    onChange={e => {
                      dispatch({
                        type: `${DOMAIN}/updateKRForm`,
                        payload: {
                          acheiveTagTem: e ? 'true' : 'false',
                          updProg: e ? 100 : 0,
                        },
                      });
                    }}
                  />
                )}
              </Field>
              <Field label="说明" presentational>
                <Input.TextArea
                  value={keyResultFormData.updDescTem || null}
                  onChange={e => {
                    dispatch({
                      type: `${DOMAIN}/updateKRForm`,
                      payload: {
                        updDescTem: e.target.value,
                      },
                    });
                  }}
                  rows={3}
                  placeholder="请输入说明"
                />
              </Field>
            </FieldList>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Button
                style={{
                  marginRight: 8,
                }}
                className="tw-btn-default"
                onClick={() => this.onChildrenDrawerClose()}
              >
                返回
              </Button>
              <Button
                loading={loading}
                className="tw-btn-primary"
                onClick={e => this.keyResultUpdate()}
                type="primary"
              >
                确认
              </Button>
            </div>
          </Drawer>
        </Drawer>
        <Drawer
          title={
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bolder',
                textAlign: 'center',
              }}
            >
              新增关键行动KA
            </span>
          }
          width={620}
          destroyOnClose
          onClose={this.onPlanInsertClose}
          visible={workPlanInsertVisible}
          className={styles.workPlanformList}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="taskName"
              label="计划名称"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请输入计划名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入计划名称" />
            </Field>
            <Field
              name="dates"
              label="日期范围"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请选择计划开始/结束日',
                  },
                ],
              }}
            >
              <DatePicker.RangePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="planStatus"
              label="状态"
              decorator={{
                required: true,
                message: '请选择状态',
                initialValue: workPlanFromData.planStatus || undefined,
              }}
            >
              <RadioGroup>
                <Radio value="PLAN">计划中</Radio>
                <Radio value="FINISHED">已完成</Radio>
              </RadioGroup>
            </Field>
            <Field label="优先级" name="priority" decorator={{}}>
              <InputNumber min={0} placeholder="请输入优先级" className="x-fill-100" />
            </Field>
            <Field name="relevantResId" label="相关人员" decorator={{}}>
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择相关人员"
                mode="multiple"
                limit={20}
              />
            </Field>
            <Field name="remark1" label="任务备注" decorator={{}}>
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
          </FieldList>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              className="tw-btn-default"
              onClick={this.onPlanInsertClose}
            >
              返回
            </Button>
            <Button
              loading={loading}
              className="tw-btn-primary"
              onClick={e => this.workPlanSubmit()}
              type="primary"
            >
              确认
            </Button>
          </div>
        </Drawer>
        {/* 修改抽屉 */}
        <Drawer
          title={
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bolder',
                textAlign: 'center',
              }}
            >
              修改关键行动KA
            </span>
          }
          width={620}
          destroyOnClose
          onClose={this.onPlanEditClose}
          visible={workPlanEditVisible}
          className={styles.workPlanformList}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="taskName"
              label="计划名称"
              decorator={{
                initialValue: workPlanFromData.taskName || '',
                rules: [{ required: true, message: '请输入计划名称' }],
              }}
            >
              <Input placeholder="请输入计划名称" />
            </Field>
            <Field
              name="dates"
              label="日期范围"
              decorator={{
                initialValue: workPlanFromData.dates ? workPlanFromData.dates : dates,
                rules: [
                  {
                    required: true,
                    message: '请选择计划开始/结束日',
                  },
                ],
              }}
            >
              <DatePicker.RangePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="planStatus"
              label="状态"
              decorator={{
                required: true,
                message: '请选择状态',
                initialValue: workPlanFromData.planStatus || undefined,
              }}
            >
              <RadioGroup>
                <Radio value="PLAN">计划中</Radio>
                <Radio value="FINISHED">已完成</Radio>
              </RadioGroup>
            </Field>
            <Field
              label="优先级"
              name="priority"
              decorator={{
                initialValue: workPlanFromData.priority || '',
              }}
            >
              <InputNumber min={0} placeholder="请输入优先级" className="x-fill-100" />
            </Field>
            <Field
              name="relevantResId"
              label="相关人员"
              decorator={{
                initialValue: workPlanFromData.relevantResId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择相关人员"
                mode="multiple"
                limit={20}
              />
            </Field>
            <Field
              name="remark1"
              label="任务备注"
              decorator={{
                initialValue: workPlanFromData.remark1 || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
          </FieldList>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              className="tw-btn-default"
              onClick={this.onPlanEditClose}
            >
              返回
            </Button>
            <Button
              loading={loading}
              className="tw-btn-primary"
              onClick={e => this.workPlanSubmit(workPlanFromData.id)}
              type="primary"
            >
              确认
            </Button>
          </div>
        </Drawer>
        <Drawer
          title={
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bolder',
                textAlign: 'center',
              }}
            >
              填写工作日志
            </span>
          }
          width={620}
          destroyOnClose
          onClose={this.onWriteLogClose}
          visible={writeLogVisible}
          className={styles.workPlanformList}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field
              name="workDate"
              label="日期"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请选择日期',
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="workDesc"
              label="工作总结"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请输入工作总结',
                  },
                ],
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入工作总结" />
            </Field>
            <Field
              name="remark"
              label="需协调工作"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请输入需协调工作',
                  },
                ],
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入需协调工作" />
            </Field>
          </FieldList>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              className="tw-btn-default"
              onClick={this.onWriteLogClose}
            >
              返回
            </Button>
            <Button
              loading={loading}
              className="tw-btn-primary"
              onClick={e => this.workLogSubmit()}
              type="primary"
            >
              确认
            </Button>
          </div>
        </Drawer>
        <BpmConnection source={allBpm} />
      </PageHeaderWrapper>
    );
  }
}

export default TargetMgmtView;
