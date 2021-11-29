import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Divider, Row, Col, List } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { treeToPlain } from '@/components/common/TreeTransfer';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { fromQs } from '@/utils/stringUtils';
import { RoleRaabsTransfer, NavsTree, UdcSelect } from '@/pages/gen/field';

const { Field } = FieldList;
const DOMAIN = 'sysTimedTaskEdit';
const tipsData = [
  '（1）0 0 2 1 * ? *  表示在每月的1日的凌晨2点调整任务',
  '（2）0 15 10? *  MON-FRI 表示周一到周五每天上午10:15执行作业',
  '（3）0 15 10 ? 6L 2002-2006 表示2002-2006年的每个月的最后一个星期五上午10:15执行作 ',
  '（4）0 0 10,14,16 * * ? 每天上午10点，下午2点，4点',
  '（5）0 0/30 9-17 * * ? 朝九晚五工作时间内每半小时',
  '（6）0 0 12 ? * WED 表示每个星期三中午12点',
  '（7）0 0 12 * * ? 每天中午12点触发',
  '（8）0 15 10 ? * * 每天上午10:15触发',
  '（9）0 15 10 * * ? 每天上午10:15触发',
  '（10）0 15 10 * * ? * 每天上午10:15触发',
  '（11）0 15 10 * * ? 2005 2005年的每天上午10:15触发',
  '（12）0 * 14 * * ? 在每天下午2点到下午2:59期间的每1分钟触发',
  '（13）0 0/5 14 * * ? 在每天下午2点到下午2:55期间的每5分钟触发',
  '（14）0 0/5 14,18 * * ? 在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发',
  '（15）0 0-5 14 * * ? 在每天下午2点到下午2:05期间的每1分钟触发',
  '（16）0 10,44 14 ? 3 WED 每年三月的星期三的下午2:10和2:44触发',
  '（17）0 15 10 ? * MON-FRI 周一至周五的上午10:15触发 　',
  '（18）0 15 10 15 * ? 每月15日上午10:15触发',
  '（19）0 1510 L * ? 每月最后一日的上午10:15触发',
  '（20）0 15 10 ? * 6L 每月的最后一个星期五上午10:15触发',
  '（21）0 15 10 ? * 6L 2002-20052002年至2005年的每月的最后一个星期五上午10:15触发',
  '（22）0 15 10 ? * 6#3 每月的第三个星期五上午10:15触发',
];

const defaultStructure = {
  id: 'code',
  pid: 'pcode',
  children: 'children',
  selected: 'checked',
};

@connect(({ sysTimedTaskEdit }) => ({ sysTimedTaskEdit }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class SystemRoleDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { taskCode } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: taskCode },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: values,
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sys/system/scheduledtask');
  };

  render() {
    const { form, sysTimedTaskEdit } = this.props;
    const { getFieldDecorator } = form;
    const { formData } = sysTimedTaskEdit;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
        >
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="taskName"
              label={formatMessage({ id: 'sys.system.name', desc: '名称' })}
              decorator={{
                initialValue: formData.taskName,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入名称" />
            </Field>
            <Field
              name="taskCode"
              label={formatMessage({ id: 'sys.scheduledtask.code', desc: '编码' })}
              decorator={{
                initialValue: formData.taskCode,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入编码" />
            </Field>

            <Field
              name="cron"
              label={formatMessage({ id: 'sys.scheduledtask.cron', desc: 'CRON表达式' })}
              decorator={{
                initialValue: formData.cron,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入CRON表达式" />
            </Field>

            <Field
              name="className"
              label={formatMessage({ id: 'sys.scheduledtask.class', desc: '任务类' })}
              decorator={{
                initialValue: formData.className,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入任务类" />
            </Field>

            <Field
              name="enable"
              label="是否运行"
              decorator={{
                initialValue: formData.enable ? 'YES' : 'NO',
                rules: [
                  {
                    required: true,
                    message: '请选择是否运行',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.YESNO" placeholder="请选择是否运行" />
            </Field>

            <Field
              name="taskDesc"
              label={formatMessage({ id: 'sys.scheduledtask.desc', desc: '任务描述' })}
              decorator={{
                initialValue: formData.taskDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入任务描述" />
            </Field>
          </FieldList>
          <Row style={{ marginTop: '50px' }}>
            <Col span={19} xxl={20}>
              <List
                size="small"
                header={<div>常用表达式例子</div>}
                bordered
                dataSource={tipsData}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemRoleDetail;
