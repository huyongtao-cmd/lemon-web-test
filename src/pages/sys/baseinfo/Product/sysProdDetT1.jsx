import React from 'react';
// import { formatMessage } from 'umi/locale';
import { Checkbox, Input, InputNumber, Tag, TreeSelect } from 'antd';

import AsyncSelect from '@/components/common/AsyncSelect';
// import { fromQs } from '@/utils/stringUtils';
// import router from 'umi/router';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { selectUsers } from '@/services/sys/user';
import { selectResBus, selectBus } from '@/services/org/bu/bu';
import { selectCoop } from '@/services/gen/list';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
// import { createAlert } from '@/components/core/Confirm';

import { SysProdContext } from './sysProductDetail';

const { Description } = DescriptionList;
const { Field } = FieldList;

const ProdDetT1 = ({
  getFieldDecorator,
  dispatch,
  formData,
  treeData,
  subTreeData,
  tabkey,
  canEdit,
  id,
}) => {
  const { from } = fromQs();
  return (
    <>
      {canEdit ? (
        <FieldList
          layout="horizontal"
          legend="产品基本信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
          hasSeparator
        >
          <Field
            name="prodNo"
            label="产品编号"
            decorator={{
              initialValue: id ? formData.prodNo : '系统生成',
            }}
          >
            <Input disabled />
          </Field>
          <Field
            name="prodName"
            label="产品名称"
            decorator={{
              initialValue: formData.prodName,
              rules: [
                {
                  required: true,
                  message: '请输入产品名称',
                },
              ],
            }}
          >
            <Input placeholder="请输入产品名称" maxLength={35} />
          </Field>
          <Field
            name="classId"
            label="产品大类"
            decorator={{
              initialValue: formData.classId,
              rules: [
                {
                  required: true,
                  message: '必须选择产品大类',
                },
              ],
            }}
          >
            <TreeSelect
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={treeData}
              placeholder="请选择产品大类"
              onChange={e => {
                // 有值加载产品小类，没值清空产品小类
                if (e) {
                  dispatch({
                    type: 'sysProductDetail/subTree',
                    payload: {
                      pId: e,
                    },
                  });
                  dispatch({
                    type: 'sysProductDetail/updateState',
                    payload: {
                      formData: {
                        ...formData,
                        subClassId: null, // 清空 产品小类失败
                      },
                    },
                  });
                }
              }}
            />
          </Field>
          <Field
            name="subClassId"
            label="产品小类"
            decorator={{
              initialValue: formData.subClassId,
              rules: [
                {
                  required: false,
                  message: '必须选择产品小类',
                },
              ],
            }}
          >
            <TreeSelect
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={subTreeData}
              placeholder="请选择产品小类"
            />
          </Field>
          <Field
            name="taxRate"
            label="税率"
            decorator={{
              initialValue: formData.taxRate,
              rules: [
                {
                  required: true,
                  message: '必须选择税率',
                },
              ],
            }}
          >
            <UdcSelect code="COM:TAX_RATE" />
          </Field>
          <Field
            name="sortNo"
            label="排序号"
            decorator={{
              initialValue: +formData.sortNo,
              rules: [
                {
                  type: 'integer',
                  min: 0,
                  max: 9999,
                  message: '必须是数字[0-9999]',
                },
              ],
            }}
          >
            <InputNumber className="x-fill-100" placeholder="请输入排序号" />
          </Field>
          <Field
            name="prodProp"
            label="供应商主体属性"
            decorator={{
              initialValue: formData.prodProp,
              rules: [
                {
                  message: '请输入产品属性',
                },
              ],
            }}
          >
            <UdcSelect code="COM.PROD_PROP" />
          </Field>

          {from === 'orgbu' ? (
            <Field
              name="buId"
              label="所属BU"
              decorator={{
                initialValue: formData.buName,
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
          ) : (
            <Field
              name="buId"
              label="所属BU"
              decorator={{
                initialValue: formData.buName,
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
          )}

          <Field
            name="picResId"
            label="产品负责人"
            decorator={{
              initialValue: formData.picResId,
              rules: [
                {
                  required: true,
                  message: '必须选择产品负责人',
                },
              ],
            }}
          >
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="负责人下拉"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Field>

          <Field
            name="coopId"
            label="产品供应商"
            decorator={{
              initialValue: formData.coopId,
            }}
          >
            <Selection source={() => selectCoop()} placeholder="请选择所属合作伙伴" />
          </Field>

          <Field name="prodStatus" label="状态" presentational>
            <Input disabled value={formData.prodStatusName ? formData.prodStatusName : '上架'} />
          </Field>
          <Field
            name="industry"
            label="适用行业"
            decorator={{
              initialValue: formData.industry,
              rules: [
                {
                  message: '请输入适用行业',
                },
              ],
            }}
          >
            <Input placeholder="请输入适用行业" maxLength={35} />
          </Field>
          <Field
            name="refEqva"
            label="参考当量"
            decorator={{
              initialValue: formData.refEqva,
              rules: [
                {
                  message: '请输入参考当量',
                },
              ],
            }}
          >
            <Input placeholder="请输入参考当量" maxLength={35} />
          </Field>
          <Field name="inspectFlag" label="考察中">
            <Checkbox disabled checked={!!formData.inspectFlag} />
          </Field>
          <Field
            name="refPrice"
            label="参考价格"
            decorator={{
              initialValue: formData.refPrice,
              rules: [
                {
                  message: '请输入参考价格',
                },
              ],
            }}
          >
            <Input placeholder="请输入参考价格" maxLength={35} />
          </Field>
          <Field
            name="inspectReason"
            label="考察原因"
            decorator={{
              initialValue: formData.inspectReason,
              rules: [
                {
                  message: '请输入考察原因',
                },
              ],
            }}
          >
            <Input placeholder="请输入考察原因" maxLength={35} />
          </Field>
          <Field
            name="tagDesc"
            label="标签"
            decorator={{
              initialValue: formData.tagDesc,
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (
                      value &&
                      (value.replace(/[\u4e00-\u9fffa]/g, '**').length > 10 || value.length > 10)
                    ) {
                      callback('最多能输入五汉字，或10个字符');
                    }
                    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                    callback();
                  },
                },
              ],
            }}
          >
            <Input placeholder="请输入标签" />
          </Field>

          <Field
            name="royaltyType"
            label="提成类别"
            decorator={{
              initialValue: formData.royaltyType,
              rules: [
                {
                  required: false,
                  message: '必须填写提成类别',
                },
              ],
            }}
          >
            <UdcSelect code="ACC:ROYALTY_TYPE" />
          </Field>

          <Field presentational />

          <Field name="logo" label="产品Logo">
            <FileManagerEnhance
              api="/api/base/v1/buProd/logo/sfs/token"
              dataKey={formData.id}
              listType="text"
              disabled={false}
            />
          </Field>
          <Field
            presentational
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 22, xxl: 22 }}
            style={{ color: 'red' }}
          >
            Logo要求：支持*.jpg, *.gif, *.png，像素最大500*500，文件最大1MB。
          </Field>
          <Field name="video" label="视频">
            <FileManagerEnhance
              api="/api/base/v1/buProd/video/sfs/token"
              dataKey={formData.id}
              listType="text"
              disabled={false}
            />
          </Field>
          <Field
            presentational
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 22, xxl: 22 }}
            style={{ color: 'red' }}
          >
            {`视频要求：大小<20M，时长≤3分钟，格式MP4（H.264)。`}
          </Field>
        </FieldList>
      ) : (
        <DescriptionList size="large" title="产品基本信息" col={2} hasSeparator>
          <Description term="产品编号"> {formData.prodNo} </Description>
          <Description term="产品名称"> {formData.prodName} </Description>
          <Description term="产品大类"> {formData.className} </Description>
          <Description term="产品小类"> {formData.subClassName} </Description>
          <Description term="税率"> {formData.taxRateName} </Description>
          <Description term="排序号"> {formData.sortNo} </Description>
          <Description term="供应商主体属性"> {formData.prodPropName} </Description>
          <Description term="所属BU"> {formData.buName} </Description>
          <Description term="产品负责人"> {formData.picResName} </Description>
          <Description term="产品供应商"> {formData.coopName} </Description>
          <Description term="状态"> {formData.prodStatusName} </Description>
          <Description term="适用行业"> {formData.industry} </Description>
          <Description term="参考当量"> {formData.refEqva} </Description>
          <Description term="提成类型"> {formData.royaltyTypeName} </Description>
          <Description term="考察中">
            {' '}
            {formData.inspectFlag === 0 ? (
              <Tag color="green">否</Tag>
            ) : (
              <Tag color="red">是</Tag>
            )}{' '}
          </Description>
          <Description term="参考价格"> {formData.refPrice} </Description>
          <Description term="考察原因"> {formData.inspectReason} </Description>
          <Description term="标签"> {formData.tagDesc} </Description>
        </DescriptionList>
      )}

      {canEdit ? (
        <FieldList
          layout="horizontal"
          legend="产品特性"
          getFieldDecorator={getFieldDecorator}
          col={1}
        >
          <Field
            name="prodDesc"
            label="产品简介"
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            decorator={{
              initialValue: formData.prodDesc,
            }}
          >
            <Input.TextArea placeholder="请输入产品简介" rows={3} maxLength={400} />
          </Field>
          <Field
            name="functionDesc"
            label="功能模块"
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            decorator={{
              initialValue: formData.functionDesc,
            }}
          >
            <Input.TextArea placeholder="请输入功能模块" rows={3} maxLength={400} />
          </Field>
          <Field
            name="customerDesc"
            label="目标客户"
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            decorator={{
              initialValue: formData.customerDesc,
            }}
          >
            <Input.TextArea placeholder="请输入目标客户" rows={3} maxLength={400} />
          </Field>
        </FieldList>
      ) : (
        <DescriptionList size="large" title="产品特性" col={1}>
          <Description term="产品简介">{formData.prodDesc}</Description>
          <Description term="功能模块">{formData.functionDesc}</Description>
          <Description term="目标客户">{formData.customerDesc}</Description>
        </DescriptionList>
      )}
    </>
  );
};

export default () => (
  <SysProdContext.Consumer>{allProps => <ProdDetT1 {...allProps} />}</SysProdContext.Consumer>
);
