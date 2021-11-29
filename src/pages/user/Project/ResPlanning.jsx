import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { Button, Card, DatePicker, Form } from 'antd';
import classnames from 'classnames';
import { isEmpty, isNil, mapObjIndexed } from 'ramda';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';
import Planning from './modal/Planning';
import History from './modal/History';
import HistoryModal from './modal/HistoryModal';
import TemplateImportModal from './modal/TemplateImportModal1';

// 编辑页tab
const editOperationTabList = [
  {
    key: 'resPlanning',
    tab: formatMessage({ id: `user.project.menuMap.resplanning`, desc: '资源规划' }),
  },
  {
    key: 'changeHistory',
    tab: formatMessage({ id: `user.project.menuMap.changehistory`, desc: '变更历史' }),
  },
];

// 保存历史版本明细初始化
const historyFormDataModel = {
  id: null,
  versionNo: null, // 版本号
  changeReason: null, // 变更原因
};

const DOMAIN = 'userResPlanning';
@connect(({ loading, userResPlanning }) => ({
  loading,
  userResPlanning,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { key, value: value.value },
    });
  },
})
@mountToTab()
class ResPlanning extends PureComponent {
  state = {
    operationkey: 'resPlanning',
    historyVisible: false, // 保存历史版本管理弹框显示
    templateVisible: false, // 从模板导入弹框显示
    btnLoadingStatus: false,
    // btnHistoryLoadingStatus: false,
    historyFormData: {
      ...historyFormDataModel,
    },
    btnDisabled: false, // 保存、保存历史版本按钮默认使用
    didMountFlag: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    this.setState({
      operationkey: 'resPlanning',
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { objid: param.id, planType: param.planType },
    });
  }

  onOperationTabChange = key => {
    this.setState({
      operationkey: key,
      didMountFlag: key,
    });
    if (key === 'changeHistory') {
      // 切换到变更历史时，保存等按钮禁用
      this.setState({ btnDisabled: true });
    } else {
      this.setState({ btnDisabled: false });
    }
  };

  handleSave = () => {
    // this.setState({
    //   btnLoadingStatus: true,
    // });

    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userResPlanning: { formData, dataSource },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    const { operationkey } = this.state;
    // 校验明细项
    const roleError = dataSource.filter(v => isNil(v.role) || isEmpty(v.role));
    const capasetLevelIdError = dataSource.filter(
      v => isNil(v.capasetLevelId) || isEmpty(v.capasetLevelId)
    );
    // 浮点数校验
    const re = /^[0-9]+.?[0-9]*$/;
    const distributeRateNotNumError = dataSource.filter(
      v => v.distributeRate && !re.test(v.distributeRate)
    );
    if (roleError.length) {
      createMessage({ type: 'error', description: `请填写角色` });
      return;
    }
    if (capasetLevelIdError.length) {
      createMessage({ type: 'error', description: `请填写复合能力（系数）` });
      return;
    }
    if (distributeRateNotNumError.length) {
      createMessage({ type: 'error', description: `派发系数为浮点数` });
      return;
    }
    // 开始时间，结束时间校验
    // 1.开始时间>=规划开始时间
    const formDataStartDate = new Date(new Date(formData.startDate).setHours(0, 0, 0, 0)).getTime(); // 开始周的时间也叫做规划开始时间
    const startDateList = dataSource
      .filter(data => data.startDate)
      .filter(
        item =>
          formDataStartDate > new Date(new Date(item.startDate).setHours(0, 0, 0, 0)).getTime()
      );
    if (startDateList.length > 0) {
      createMessage({ type: 'error', description: `开始日期不能小于规划开始周` });
      return;
    }

    // 2.结束时间<=规划结束时间
    const formDataEndDate = new Date(
      new Date(
        moment(formData.startDate).add(Number(formData.durationWeek || 0), 'weeks')
      ).setHours(0, 0, 0, 0)
    ).getTime(); // 结束周的时间也叫做规划结束时间  2020-02-10 00:00:00

    const endDateItems = dataSource.filter(data => data.endDate);
    const endDateList = endDateItems.filter(
      item => new Date(new Date(item.endDate).setHours(0, 0, 0, 0)).getTime() > formDataEndDate
    );
    if (endDateList.length > 0) {
      createMessage({ type: 'error', description: `结束日期不能大于规划结束周` });
      return;
    }

    // 校验创建周不为空
    const notSatisfyList = dataSource.filter(item => {
      const filteredItem = Object.keys(item)
        .filter(key => key.includes('yearWeek'))
        .filter(key => isNil(item[key]) || isEmpty(item[key]));
      return !isEmpty(filteredItem);
    });

    if (!isEmpty(notSatisfyList)) {
      createMessage({ type: 'error', description: `请将创建的周数填写完整！` });
      return;
    }
    // 3.开始时间<=有规划天数最早周的开始时间  结束时间>=有规划天数最后一周的结束时间
    const yearWeekList = dataSource.filter(item => {
      const filteredItem = Object.keys(item).filter(key => key.includes('yearWeek'));
      return filteredItem;
    });
    // 包含yearWeek 说明有周数 点击了持续周数后面的加号
    if (yearWeekList.length > 0) {
      let firstDateIsFlag = false; // 校验开始日期和有规划天数最早周的开始时间
      let lastDateIsFlag = false; // 校验 结束日期和有规划天数最后一周的结束时间
      yearWeekList.forEach(item => {
        const keys = Object.keys(item);
        const weekList = [];
        keys.forEach(itm => {
          if (itm.includes('yearWeek')) {
            // 排除w以及以后为0的值，为0的值不做比较
            if (Number(item[itm]) !== 0) {
              weekList.push(itm);
            }
          }
        });
        // 获取不为0的yearWeek，主要是为了获取是第几周 获取周的开始日期和结束日期
        if (weekList.length > 0) {
          const yearWeekNumbers = [];
          // 截取yearWeek_后面的数据比如yearWeek_0  截取0 判断出周数
          weekList.forEach(week => {
            yearWeekNumbers.push(Number(week.substr(9)));
            // yearWeekNumbers.sort();
          });
          // 有规划天数最早周的开始时间为yearWeekNumbers[0]  开始时间<=有规划天数最早周的开始时间
          if (item.startDate) {
            const firstStartDate = new Date(
              new Date(
                moment(formData.startDate)
                  .add(yearWeekNumbers[0], 'weeks')
                  .format('YYYY-MM-DD')
              ).setHours(0, 0, 0, 0)
            ).getTime();
            if (
              new Date(new Date(item.startDate).setHours(0, 0, 0, 0)).getTime() > firstStartDate
            ) {
              firstDateIsFlag = true;
            }
          }

          // 有规划天数最晚周的结束时间为yearWeekNumbers[length-1]  结束时间>=有规划天数最后一周的结束时间
          if (item.endDate) {
            const lastStartDate = new Date(
              new Date(
                moment(formData.startDate)
                  .add(yearWeekNumbers[yearWeekNumbers.length - 1], 'weeks')
                  .add(6, 'days')
                  .format('YYYY-MM-DD')
              ).setHours(0, 0, 0, 0)
            ).getTime();
            if (new Date(new Date(item.endDate).setHours(0, 0, 0, 0)).getTime() < lastStartDate) {
              lastDateIsFlag = true;
            }
          }
        }
        //  else {
        //   firstDateIsFlag = true;
        // }
      });
      if (firstDateIsFlag) {
        createMessage({ type: 'error', description: `开始日期不能大于有规划天数最早周的开始时间` });
        return;
      }
      if (lastDateIsFlag) {
        createMessage({
          type: 'error',
          description: `结束日期不能小于有规划天数最晚一周的结束时间`,
        });
        return;
      }
    }

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { objid: param.id, planType: param.planType },
        }).then(res => {
          this.setState({
            btnLoadingStatus: false,
          });
          // if (res && res.ok) {
          //   this.setState({
          //     btnLoadingStatus: false,
          //   });
          // }
        });
      }
    });
  };

  // 保存历史版本新增弹出窗。
  historyToggleModal = () => {
    const { historyVisible } = this.state;
    this.setState({
      historyVisible: !historyVisible,
      historyFormData: {
        ...historyFormDataModel,
      },
    });
  };

  // 从模板导入弹窗
  templateImportModal = () => {
    const { templateVisible } = this.state;
    this.setState({
      templateVisible: !templateVisible,
    });
  };

  // 从商机导入
  businessOppotunityImport = () => {
    this.setState({ btnDisabled: true });
    const param = fromQs();
    const {
      dispatch,
      userResPlanning: { dataSource, formData },
    } = this.props;
    createConfirm({
      content: '此操作会将原有数据清除，确定导入吗?',
      onOk: () => {
        dispatch({
          type: `${DOMAIN}/getBusinessData`,
          payload: {
            id: param.id,
          },
        }).then(response => {
          if (response.ok) {
            const planningTitle = response.datum.planningTitle || [];
            const details = response.datum.details || [];
            const newFormData = { ...formData, durationWeek: planningTitle.durationWeek };
            const newDataSource = [...details];
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { formData: newFormData, dataSource: newDataSource },
            });
            const { weekSwitch } = this.state;
            weekSwitch(false, null, planningTitle.durationWeek);
          } else {
            createMessage({
              type: 'error',
              description: response.reason || '项目对应的商机不存在',
            });
          }
          this.setState({ btnDisabled: false });
        });
      },
    });
  };

  // 保存历史版本保存按钮事件
  historySubmitModal = () => {
    const {
      dispatch,
      userResPlanning: { formData },
    } = this.props;
    const { historyVisible, historyFormData } = this.state;

    dispatch({
      type: `${DOMAIN}/saveHistory`,
      payload: {
        id: formData.id,
        versionNo: historyFormData.versionNo,
        changeReason: historyFormData.changeReason,
      },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        historyVisible: !historyVisible,
        historyFormData,
      });
    });
  };

  // 选择模板弹窗关闭保存选的数据
  onBusinessTmplCheck = businessTmpl => {
    this.templateImportModal();
    createConfirm({
      content: '此操作会将原有数据清除，确定导入吗?',
      onOk: () => {
        const {
          dispatch,
          userResPlanning: { formData, dataSource },
        } = this.props;
        const planningTitle = businessTmpl.planningTitle || [];
        const details = businessTmpl.details || [];
        const newFormData = { ...formData, durationWeek: planningTitle.durationWeek };
        const newDataSource = [...details];

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { formData: newFormData, dataSource: newDataSource },
        });
        const { weekSwitch } = this.state;
        weekSwitch(false, null, planningTitle.durationWeek);
      },
    });
  };

  render() {
    const {
      loading,
      form,
      userResPlanning: {
        dataSource,
        formData: { planType },
      },
    } = this.props;
    const { btnLoadingStatus, businessBtnIsFlag } = this.state;

    const {
      operationkey,
      historyFormData,
      historyVisible,
      templateVisible,
      btnDisabled,
      didMountFlag,
    } = this.state;
    // 获取url上的参数
    const param = fromQs();
    const contentList = {
      resPlanning: (
        <Planning
          didMountFlag={didMountFlag}
          form={form}
          switchWeek={event => this.setState({ weekSwitch: event })}
        />
      ),
      changeHistory: <History form={form} />,
    };
    const submitBtn =
      loading.effects[`userResPlanning/query`] || loading.effects[`userResPlanning/save`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSave}
            // loading={btnLoadingStatus}
            disabled={btnDisabled || submitBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.historyToggleModal}
            disabled={btnDisabled}
          >
            {formatMessage({ id: `misc.save.history`, desc: '保存历史版本' })}
          </Button>
          {operationkey === 'changeHistory' ? null : (
            <Button
              className="tw-btn-primary"
              size="large"
              onClick={this.templateImportModal}
              disabled={btnDisabled}
            >
              从模板导入
            </Button>
          )}

          {planType === '1' || operationkey === 'changeHistory' ? null : (
            <Button
              className="tw-btn-primary"
              size="large"
              onClick={this.businessOppotunityImport}
              disabled={btnDisabled}
            >
              从商机导入
            </Button>
          )}

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              if (param.planType === '2') {
                closeThenGoto(`/user/project/projectDetail?id=${param.id}`);
              } else if (param.planType === '1') {
                closeThenGoto(`/sale/management/opps`);
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={operationkey}
          tabList={editOperationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
        <HistoryModal
          formData={historyFormData}
          visible={historyVisible}
          handleCancel={this.historyToggleModal}
          handleOk={this.historySubmitModal}
        />
        <TemplateImportModal
          visible={templateVisible}
          templateImportModal={this.templateImportModal}
          onCheck={this.onBusinessTmplCheck}
        />
      </PageHeaderWrapper>
    );
  }
}

export default ResPlanning;
