import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Divider, Radio, Switch, Checkbox, Row, Col } from 'antd';
import Title from '@/components/layout/Title';
import { Selection, FileManagerEnhance, DatePicker } from '@/pages/gen/field';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import {
  selectUsersWithBu,
  selectCoop, // 合作伙伴
} from '@/services/gen/list';
import {
  selectCust, // 客户
  selectSupplier, // 供应商
  selectBuProduct, // 产品
} from '@/services/user/Contract/sales';
import moment from 'moment';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const fieldLayout = {
  labelCol: { span: 9, xxl: 9 },
  wrapperCol: { span: 15, xxl: 15 },
};

const DOMAIN = 'videoMgmt';

@connect(({ loading, dispatch, videoMgmt }) => ({
  loading,
  dispatch,
  videoMgmt,
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
class VideoMgmtEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'VIDEO' },
      });
      // 视频类别
      dispatch({
        type: `${DOMAIN}/videoCatData`,
        payload: { catNo: 'VIDEO_CAT' },
      });
      // 展示栏目标签
      dispatch({
        type: `${DOMAIN}/queryUdcList`,
        payload: {
          id,
          categoryCode: 'COM:VIDEO_SHOW_LABEL',
        },
      }).then(response => {
        // 有id编辑页，查详情
        if (id) {
          dispatch({
            type: `${DOMAIN}/videoDetail`,
            payload: { id, catNo: 'VIDEO_CAT' },
          });
        }
      });
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll, setFields },
      dispatch,
      videoMgmt: { searchForm, formData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      // 资源类型一的必填受查看权限影响，手动塞error
      const { accessResType1, accessFlag } = formData;
      if (!accessResType1 && accessFlag === 'BY_RES_TYPE') {
        setFields({
          accessResType1: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
        return;
      }
      if (!error) {
        // const { videoFile = [], videoLogo = [] } = formData;
        // if (videoFile.length > 1) {
        //   createMessage({ type: 'warn', description: '只允许上传一个视频附件！' });
        //   return;
        // }
        // if (videoLogo.length > 1) {
        //   createMessage({ type: 'warn', description: '只允许上传一个LOGO图片！' });
        //   return;
        // }
        dispatch({
          type: `${DOMAIN}/videoEdit`,
          payload: formData,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/plat/market/videoMgmt?_refresh=0');
            dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  // 配置所需要的内容1
  renderPage = () => {
    const {
      dispatch,
      videoMgmt: {
        formData,
        pageConfig: { pageBlockViews = [] },
        type2,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '视频信息表单');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        vNo = {},
        vName = {},
        accessFlag = {},
        accessResType1 = {},
        accessResType2 = {},
        inchargeResId = {},
        buId = {},
        supplierId = {},
        prodId = {},
        coopId = {},
        custId = {},
        showFlag = {},
        vDesc = {},
        uploadResId = {},
        uploadDate = {},
        keyword = {},
      } = pageFieldJson;
      const fields = [
        <Field
          name="vno"
          label={vNo.displayName}
          key="vNo"
          decorator={{
            initialValue: formData.vno || '',
            rules: [{ required: vNo.requiredFlag, message: '必填' }],
          }}
          sortNo={vNo.sortNo}
          {...fieldLayout}
        >
          <Input disabled={vNo.fieldMode === 'UNEDITABLE'} placeholder="系统自动生成" />
        </Field>,
        <Field
          name="vname"
          label={vName.displayName}
          key="vName"
          decorator={{
            initialValue: formData.vname || '',
            rules: [{ required: vName.requiredFlag, message: '必填' }],
          }}
          sortNo={vName.sortNo}
          {...fieldLayout}
        >
          <Input
            disabled={vName.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${vName.displayName}`}
          />
        </Field>,
        <Field
          name="videoFile"
          label="视频附件"
          // decorator={{
          //   rules: [{ required: true, message: '必填' }],
          // }}
          {...fieldLayout}
        >
          <FileManagerEnhance
            api="/api/base/v1/catVideo/video/sfs/token"
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={formData.id}
            max={100}
          />
        </Field>,
        <Field
          presentational
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 22, xxl: 22 }}
          style={{ color: 'red' }}
        >
          <span style={{ fontSize: '12px', paddingLeft: '20px' }}>
            {`视频要求：大小<100M，格式MP4（H.264)。`}
          </span>
        </Field>,
        <Field name="videoLogo" label="LOGO" {...fieldLayout}>
          <FileManagerEnhance
            api="/api/base/v1/catVideo/logo/sfs/token"
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={formData.id}
            max={300 / 1024}
          />
        </Field>,
        <Field
          presentational
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 22, xxl: 22 }}
          style={{ color: 'red' }}
        >
          <span style={{ fontSize: '12px', paddingLeft: '20px' }}>
            Logo要求：支持*.jpg, *.gif, *.png，建议上传16:9(256*144)的图片，文件最大300k。
          </span>
        </Field>,
        <Field
          name="accessFlag"
          label={accessFlag.displayName}
          key="accessFlag"
          decorator={{
            initialValue: formData.accessFlag || '',
            rules: [
              {
                required: accessFlag.requiredFlag,
                message: '必填',
              },
            ],
          }}
          sortNo={accessFlag.sortNo}
          {...fieldLayout}
        >
          <RadioGroup
            disabled={accessFlag.fieldMode === 'UNEDITABLE'}
            onChange={e => {
              if (e.target.value === 'ALL') {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    accessResType1: undefined,
                    accessResType2: undefined,
                  },
                });
                setFieldsValue({
                  accessResType1: undefined,
                  accessResType2: undefined,
                });
              }
            }}
          >
            <Radio value="ALL">所有资源</Radio>
            <Radio value="BY_RES_TYPE">按资源类型</Radio>
          </RadioGroup>
        </Field>,
        <FieldLine {...fieldLayout} label="有查看权限资源类型">
          <Field
            name="accessResType1"
            decorator={{
              initialValue: formData.accessResType1 || undefined,
              rules: [
                {
                  required: formData.accessFlag === 'BY_RES_TYPE' && accessResType1.requiredFlag,
                  message: '必填',
                },
              ],
            }}
            wrapperCol={{ span: 23, xxl: 23 }}
          >
            <Selection.UDC
              code="RES:RES_TYPE1"
              disabled={formData.accessFlag === 'ALL' || accessResType1.fieldMode === 'UNEDITABLE'}
              placeholder={`${accessResType1.displayName}`}
              onChange={v => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    accessResType2: undefined,
                  },
                });
                setFieldsValue({
                  accessResType2: undefined,
                });
                if (v) {
                  dispatch({
                    type: `${DOMAIN}/typeChange`,
                    payload: v,
                  });
                } else {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      type2: [],
                    },
                  });
                }
              }}
            />
          </Field>
          <Field
            name="accessResType2"
            decorator={{
              initialValue: formData.accessResType2 || undefined,
              rules: [
                {
                  required: formData.accessFlag === 'BY_RES_TYPE' && accessResType2.requiredFlag,
                  message: '必填',
                },
              ],
            }}
            wrapperCol={{ span: 23, xxl: 23 }}
          >
            <Selection
              source={type2}
              disabled={formData.accessFlag === 'ALL' || accessResType2.fieldMode === 'UNEDITABLE'}
              placeholder={`${accessResType2.displayName}`}
            />
          </Field>
        </FieldLine>,
        <Field
          name="inchargeResId"
          label={inchargeResId.displayName}
          key="inchargeResId"
          decorator={{
            initialValue: formData.inchargeResId || undefined,
            rules: [{ required: inchargeResId.requiredFlag, message: '必填' }],
          }}
          sortNo={inchargeResId.sortNo}
          {...fieldLayout}
        >
          <Selection.Columns
            key="inchargeResId"
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${inchargeResId.displayName}`}
            disabled={inchargeResId.fieldMode === 'UNEDITABLE'}
          />
        </Field>,
        <Field
          name="buId"
          label={buId.displayName}
          key="buId"
          decorator={{
            initialValue: formData.buId || undefined,
            rules: [{ required: buId.requiredFlag, message: '必填' }],
          }}
          sortNo={buId.sortNo}
          {...fieldLayout}
        >
          <Selection.Columns
            key="buId"
            className="x-fill-100"
            source={() => selectBuMultiCol()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${buId.displayName}`}
            disabled={buId.fieldMode === 'UNEDITABLE'}
          />
        </Field>,
        <Field
          name="supplierId"
          label={supplierId.displayName}
          key="supplierId"
          decorator={{
            initialValue: formData.supplierId || undefined,
            rules: [{ required: supplierId.requiredFlag, message: '必填' }],
          }}
          sortNo={supplierId.sortNo}
          {...fieldLayout}
        >
          <Selection
            key="supplierId"
            className="x-fill-100"
            source={() => selectSupplier()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${supplierId.displayName}`}
            disabled={supplierId.fieldMode === 'UNEDITABLE'}
          />
        </Field>,
        <Field
          name="prodId"
          label={prodId.displayName}
          key="prodId"
          decorator={{
            initialValue: formData.prodId || undefined,
            rules: [{ required: prodId.requiredFlag, message: '必填' }],
          }}
          sortNo={prodId.sortNo}
          {...fieldLayout}
        >
          <Selection
            key="prodId"
            className="x-fill-100"
            source={() => selectBuProduct()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${prodId.displayName}`}
            disabled={prodId.fieldMode === 'UNEDITABLE'}
          />
        </Field>,
        <Field
          name="coopId"
          label={coopId.displayName}
          key="coopId"
          decorator={{
            initialValue: formData.coopId || undefined,
            rules: [{ required: coopId.requiredFlag, message: '必填' }],
          }}
          sortNo={coopId.sortNo}
          {...fieldLayout}
        >
          <Selection
            key="coopId"
            className="x-fill-100"
            source={() => selectCoop()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${coopId.displayName}`}
            disabled={coopId.fieldMode === 'UNEDITABLE'}
          />
        </Field>,
        <Field
          name="custId"
          label={custId.displayName}
          key="custId"
          decorator={{
            initialValue: formData.custId || undefined,
            rules: [{ required: custId.requiredFlag, message: '必填' }],
          }}
          sortNo={custId.sortNo}
          {...fieldLayout}
        >
          <Selection
            key="custId"
            className="x-fill-100"
            source={() => selectCust()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${custId.displayName}`}
            disabled={custId.fieldMode === 'UNEDITABLE'}
          />
        </Field>,
        <Field
          name="showFlag"
          label={showFlag.displayName}
          key="showFlag"
          decorator={{
            initialValue: formData.showFlag || '',
            rules: [{ required: showFlag.requiredFlag, message: '必填' }],
          }}
          sortNo={showFlag.sortNo}
          {...fieldLayout}
        >
          <RadioGroup disabled={showFlag.fieldMode === 'UNEDITABLE'}>
            <Radio value="SHOW">展示</Radio>
            <Radio value="HIDE">隐藏</Radio>
          </RadioGroup>
        </Field>,
        <Field
          name="keyword"
          key="keyword"
          label={keyword.displayName}
          decorator={{
            initialValue: formData.keyword || '',
            rules: [{ required: !!keyword.requiredFlag, message: `请输入${keyword.displayName}` }],
          }}
          sortNo={keyword.sortNo}
          {...fieldLayout}
        >
          <Input placeholder={`请输入${keyword.displayName}`} />
        </Field>,
        <Field
          name="vdesc"
          label={vDesc.displayName}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 4 }}
          wrapperCol={{ span: 20, xxl: 20 }}
          decorator={{
            initialValue: formData.vdesc || '',
            rules: [{ required: vDesc.requiredFlag, message: '必填' }],
          }}
          sortNo={vDesc.sortNo}
        >
          <Input.TextArea rows={3} placeholder={`请选择${vDesc.displayName}`} />
        </Field>,
        <Field
          name="uploadResId"
          label={uploadResId.displayName}
          key="uploadResId"
          decorator={{
            initialValue: formData.uploadResId || undefined,
            rules: [{ required: uploadResId.requiredFlag, message: '必填' }],
          }}
          sortNo={uploadResId.sortNo}
          {...fieldLayout}
        >
          <Selection.Columns
            key="uploadResId"
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${uploadResId.displayName}`}
            disabled={uploadResId.fieldMode === 'UNEDITABLE'}
          />
        </Field>,
        <Field
          name="uploadDate"
          label={uploadDate.displayName}
          key="uploadDate"
          decorator={{
            initialValue: formData.uploadDate || '',
            rules: [{ required: uploadDate.requiredFlag, message: '必填' }],
          }}
          sortNo={uploadDate.sortNo}
          {...fieldLayout}
        >
          <DatePicker disabled={uploadDate.fieldMode === 'UNEDITABLE'} format="YYYY-MM-DD" />
        </Field>,
      ];

      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          {filterList}
        </FieldList>
      );
    }

    return '';
  };

  onCellChanged = (index, value, name) => {
    const {
      videoMgmt: { twVideoShowLabelEntityList },
      dispatch,
    } = this.props;

    const newDataSource = twVideoShowLabelEntityList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    if (name === 'checked' && value === false) {
      newDataSource[index].startDate = undefined;
      newDataSource[index].endDate = undefined;
    }
    if (name === 'checked' && value === true) {
      newDataSource[index].sphd1
        ? (newDataSource[index].startDate = moment().format('YYYY-MM-DD'))
        : undefined;
      newDataSource[index].sphd1
        ? (newDataSource[index].endDate = moment(Date.now())
            .add(Number(newDataSource[index].sphd1), 'day')
            .format('YYYY-MM-DD'))
        : undefined;
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { twVideoShowLabelEntityList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      form,
      dispatch,
      videoMgmt: {
        catCodeFormData,
        twVideoShowLabelEntityList,
        twVideoShowLabelEntityListDel,
        videoCatDataList,
        videoCatDataListCopy,
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    const submitting =
      loading.effects[`${DOMAIN}/videoEdit`] || loading.effects[`${DOMAIN}/videoDetail`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={submitting}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                closeThenGoto(markAsTab(from));
              } else {
                closeThenGoto('/plat/market/videoMgmt');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="视频信息" />}
        >
          <FieldList legend="基本信息" getFieldDecorator={getFieldDecorator} col={2}>
            {this.renderPage()}
          </FieldList>
          <Divider dashed />
          <FieldList legend="类别" getFieldDecorator={getFieldDecorator} col={2}>
            {videoCatDataList.map(v => (
              <Field
                name={v.tabField}
                label={v.showName}
                key={v.tabField}
                decorator={{
                  initialValue:
                    // eslint-disable-next-line no-nested-ternary
                    catCodeFormData[v.tabField] && !Array.isArray(catCodeFormData[v.tabField])
                      ? v.multFlag === 'YES'
                        ? catCodeFormData[v.tabField].split(',')
                        : catCodeFormData[v.tabField]
                      : undefined,
                  rules: [{ required: v.blankFlag === 'YES', message: '必填' }],
                }}
                {...fieldLayout}
              >
                <Selection
                  key={v.tabField}
                  className="x-fill-100"
                  source={v.list}
                  transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  placeholder={`请选择${v.showName}`}
                  mode={v.multFlag === 'YES' && 'multiple'}
                  onChange={e => {
                    if (e) {
                      setTimeout(() => {
                        dispatch({
                          type: `${DOMAIN}/updateCatCodeForm`,
                          payload: {
                            [v.tabField]: `${e}`,
                          },
                        });
                      }, 0);
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          [v.tabField]: undefined,
                        },
                      });
                      dispatch({
                        type: `${DOMAIN}/updateCatCodeForm`,
                        payload: {
                          [v.tabField]: undefined,
                        },
                      });
                    }
                  }}
                  onValueChange={e => {
                    if (!Array.isArray(e) && e && e.subCatDId) {
                      const tt = videoCatDataListCopy.map(item => {
                        if (e.subCatDId.includes(item.id)) {
                          // 有关联的下拉框清空
                          dispatch({
                            type: `${DOMAIN}/updateForm`,
                            payload: {
                              [item.tabField]: undefined,
                            },
                          });
                          setFieldsValue({
                            [item.tabField]: undefined,
                          });

                          // 筛选关联数据
                          return {
                            ...item,
                            list: item.list.filter(obj => Number(obj.supCatDValId) === e.id),
                          };
                        }
                        return item;
                      });
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          videoCatDataList: tt,
                        },
                      });
                    }
                  }}
                />
              </Field>
            ))}
          </FieldList>
          <Divider dashed />
          <FieldList legend="展示栏目标签" getFieldDecorator={getFieldDecorator} col={1}>
            {twVideoShowLabelEntityList.map((v, index) => (
              <Field
                name={v.code}
                key={v.code}
                label={v.name}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                presentational
              >
                <Row gutter={6}>
                  <Col span={1}>
                    <Checkbox
                      checked={v.checked}
                      onChange={e => {
                        this.onCellChanged(index, e.target.checked, 'checked');
                        if (e.target.checked) {
                          const tt = twVideoShowLabelEntityListDel.filter(item => item !== v.id);
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: {
                              twVideoShowLabelEntityListDel: tt,
                            },
                          });
                        } else {
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: {
                              twVideoShowLabelEntityListDel: twVideoShowLabelEntityListDel.concat(
                                v.id
                              ),
                            },
                          });
                        }
                      }}
                    />
                  </Col>
                  <Col span={2} style={{ textAlign: 'right', color: '#999' }}>
                    期间：
                  </Col>
                  <Col span={8}>
                    <Row gutter={4} type="flex" justify="center">
                      <Col span={11}>
                        <DatePicker
                          value={v.startDate}
                          onChange={e => {
                            this.onCellChanged(index, e, 'startDate');
                          }}
                          format="YYYY-MM-DD"
                        />
                      </Col>
                      <Col span={2}>
                        <div style={{ width: '100%', textAlign: 'center' }}>~</div>
                      </Col>
                      <Col span={11}>
                        <DatePicker
                          value={v.endDate}
                          onChange={e => {
                            this.onCellChanged(index, e, 'endDate');
                          }}
                          format="YYYY-MM-DD"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Field>
            ))}
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VideoMgmtEdit;
