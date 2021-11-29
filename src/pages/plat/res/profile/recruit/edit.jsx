import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'recruitEdit';

@connect(({ loading, recruitEdit, recruit, dispatch }) => ({
  loading,
  recruitEdit,
  recruit,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class RecruitEdit extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    !id && dispatch({ type: `${DOMAIN}/queryUserMessage` }); // 无id，新增，拉去个人信息
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      }).then(res => {
        const {
          recruitEdit: {
            formData: { jobType1 },
          },
        } = this.props;
        jobType1 &&
          dispatch({
            type: `${DOMAIN}/jobTypeChange`,
            payload: jobType1,
          });
      });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      recruit: { searchForm },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { id, copy } = fromQs();
        if (id && !copy) {
          dispatch({
            type: `${DOMAIN}/edit`,
          }).then(res => {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/hr/res/profile/recruit?_refresh=0');
            dispatch({ type: `recruit/query`, payload: searchForm });
          });
        } else {
          dispatch({
            type: `${DOMAIN}/submit`,
          }).then(res => {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/hr/res/profile/recruit?_refresh=0');
            dispatch({ type: `recruit/query`, payload: searchForm });
          });
        }
      }
    });
  };

  handleChangeTobType = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { jobType2: [] },
    });
    form.setFieldsValue({
      jobType2: undefined,
    });
    dispatch({
      type: `${DOMAIN}/jobTypeChange`,
      payload: value,
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      recruitEdit: { formData, resDataSource, baseBuDataSource, jobType2 },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const editBtn = loading.effects[`${DOMAIN}/edit`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn || editBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/res/profile/recruit?_refresh=0')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.res.recruitEdit" defaultMessage="招聘岗位新增" />
          }
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="jobName"
              label="岗位名称"
              decorator={{
                initialValue: formData.jobName || '',
                rules: [
                  {
                    required: true,
                    message: '请输入岗位名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入岗位名称" />
            </Field>
            <Field
              name="buId"
              label="招聘部门"
              decorator={{
                initialValue: formData.buId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择招聘部门',
                  },
                ],
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
            <Field
              name="jobType1"
              label="分类一"
              decorator={{
                initialValue: formData.jobType1 || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择分类一',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="RES:JOB_TYPE1"
                placeholder="请选择分类二"
                onChange={v => this.handleChangeTobType(v)}
              />
            </Field>
            <Field
              name="jobType2"
              label="分类二"
              decorator={{
                initialValue: formData.jobType2 || undefined,
              }}
            >
              <Selection source={jobType2} placeholder="请选择分类二" />
            </Field>
            <Field
              name="workplace"
              label="工作地"
              decorator={{
                initialValue: formData.workplace || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择工作地',
                  },
                ],
              }}
            >
              <Selection.UDC mode="multiple" code="COM:CITY" placeholder="请选择工作地" />
            </Field>
            <Field
              name="workplaceAdd"
              label="工作地补充说明"
              decorator={{
                initialValue: formData.workplaceAdd || '',
              }}
            >
              <Input placeholder="请输入工作地补充说明" />
            </Field>
            <Field
              name="recruitment"
              label="招聘人数"
              decorator={{
                initialValue: formData.recruitment || '',
                rules: [
                  {
                    required: true,
                    message: '请输入招聘人数',
                  },
                ],
              }}
            >
              <InputNumber
                className="x-fill-100"
                placeholder="请输入招聘人数"
                precision={0}
                min={0}
                max={999999999999}
              />
            </Field>
            <Field
              name="fullPart"
              label="兼职/全职"
              decorator={{
                initialValue: formData.fullPart || 'FULL',
              }}
            >
              <RadioGroup>
                <Radio value="PART">兼职</Radio>
                <Radio value="FULL">全职</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="workStyle"
              label="服务方式"
              decorator={{
                initialValue: formData.workStyle || 'ON_SITE',
              }}
            >
              <Selection.UDC code="RES:WORK_STYLE" placeholder="请选择服务方式" />
            </Field>
            <Field
              name="timeRequirement"
              label="时间要求"
              decorator={{
                initialValue: formData.timeRequirement || 'FIXED',
              }}
            >
              <Selection.UDC code="TSK:TIME_REQUIREMENT" placeholder="请选择时间要求" />
            </Field>
            <Field
              name="jobInfo"
              label="岗位简介"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.jobInfo || '',
                rules: [
                  {
                    required: true,
                    message: '请输入岗位简介',
                  },
                ],
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入岗位简介" />
            </Field>
            <Field
              name="requirements"
              label="岗位要求"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.requirements || '',
                rules: [
                  {
                    required: true,
                    message: '请输入岗位要求',
                  },
                ],
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入岗位要求" />
            </Field>
            <Field
              name="ntFlag"
              label="内部推荐"
              decorator={{
                initialValue: formData.ntFlag || '',
                rules: [
                  {
                    required: true,
                    message: '请选择是否接受内部推荐',
                  },
                ],
              }}
            >
              <RadioGroup>
                <Radio value="YES">接受</Radio>
                <Radio value="NO">不接受</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="canSee"
              label="外部资源可见"
              decorator={{
                initialValue: formData.canSee || '',
                rules: [
                  {
                    required: true,
                    message: '请选择外部资源是否可见',
                  },
                ],
              }}
            >
              <RadioGroup>
                <Radio value="YES">是</Radio>
                <Radio value="NO">否</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="recruitStatus"
              label="状态"
              decorator={{
                initialValue: formData.recruitStatus || 'RECRUITMENT',
                rules: [
                  {
                    required: true,
                    message: '请选择状态',
                  },
                ],
              }}
            >
              <Selection.UDC code="RES:RECRUIT_STATUS" placeholder="请选择状态" />
            </Field>

            <Field
              name="recommPicResid"
              label="招聘负责人"
              decorator={{
                initialValue: formData.recommPicResid || '',
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
              />
            </Field>
            <Field
              name="createTime"
              label="创建日期"
              decorator={{
                initialValue: formData.createTime || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default RecruitEdit;
