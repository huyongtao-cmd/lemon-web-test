import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Divider, Table, Form, Tag } from 'antd';

import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import InfoDetailsTaskOne from './InfoDetailsTaskOne';

import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { isNil, isEmpty } from 'ramda';

import style from './styles.less';

import {
  infoEditTabList,
  edubgColumns,
  workbgColumns,
  proExpColumns,
  financeInfoColumns,
} from '@/pages/plat/res/profile/config';

const { Description } = DescriptionList;

const DOMAIN = 'userCenterInfoDetail';

@connect(({ dispatch, loading, userCenterInfoDetail }) => ({
  dispatch,
  loading,
  userCenterInfoDetail,
}))
@Form.create({})
@mountToTab()
class UserDashboard extends PureComponent {
  state = {
    operationkey: 'basic',
    listObject: [
      {
        title: '个人信息',
        list: [
          { name: '姓名', key: 'resName' },
          { name: '英文名', key: 'englishName' },
          { name: '性别', key: 'resGenderName' },
          { name: '出生日期', key: 'birthday' },
          { name: '证件类型', key: 'idTypeName' },
          { name: '证件号码', key: 'idNo' },
          {
            name: '证件有效期',
            keyList: [{ key: 'idValidFrom' }, { key: 'idValidTo' }],
          },
          {
            name: '证件照片',
            key: 'id',
            isFile: true,
            api: '/api/person/v1/res/idphoto/sfs/token',
          },
          { name: '国籍', key: 'nationalityName' },
          { name: '籍贯', key: 'birthplace' },
          { name: '民族', key: 'nation' },
          { name: '婚姻状况', key: 'maritalName' },
          { name: '护照号码', key: 'passportNo' },
          {
            name: '护照有效期',
            keyList: [{ key: 'passportValidFrom' }, { key: 'passportValidTo' }],
          },
          {
            name: '护照照片',
            key: 'id',
            isFile: true,
            api: '/api/person/v1/res/passportphoto/sfs/token',
          },
          { name: '护照发放地', key: 'passportIssueplace' },
          {
            name: '个人简历',
            key: 'id',
            isFile: true,
            api: '/api/person/v1/res/personResume/sfs/token',
          },
        ],
      },
      {
        title: '联系方式',
        list: [
          { name: '移动电话', key: 'mobile' },
          { name: '固定电话', key: 'telNo' },
          { name: '平台邮箱', key: 'emailAddr' },
          { name: '个人邮箱', key: 'personalEmail' },
          {
            name: '社交号码',
            keyList: [{ key: 'snsType' }, { key: 'snsNo' }],
          },
          {
            name: '通讯地址',
            keyList: [
              { key: 'contactCountryName' },
              { key: 'contactProvinceName' },
              { key: 'contactCityName' },
              { key: 'contactAddress' },
            ],
          },
        ],
      },
      {
        title: '紧急联系人',
        list: [
          { name: '姓名', key: 'emContactName' },
          { name: '移动电话', key: 'emContactMobile' },
          { name: '固定电话', key: 'emContactTel' },
          { name: '关系', key: 'emContactRelation' },
        ],
      },
    ],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();

    dispatch({
      type: `${DOMAIN}/cleanFlow`,
    }).then(res => {
      // 详情信息
      id && dispatch({ type: `${DOMAIN}/query`, payload: { id } });

      // 流程配置
      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          })
        : dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              fieldsConfig: {},
            },
          });
    });
  }

  render() {
    const {
      dispatch,
      loading,
      form: { validateFieldsAndScroll },
      userCenterInfoDetail: {
        twResEdubgTemporaryEntity, // 教育经历
        twResEdubgTemporaryEntityAfter, // 教育经历
        twResWorkbgTemporaryEntity, // 工作经历
        twResWorkbgTemporaryEntityAfter, // 工作经历
        twResProjLogTemporaryEntity, // 资源项目履历
        twResProjLogTemporaryEntityAfter, // 资源项目履历
        twAbAccTemporaryEntity, // 财务信息
        twAbAccTemporaryEntityAfter, // 财务信息
        basicsBefore, // 基本信息修改前
        basicsAfter, // 基本信息修改后
        fieldsConfig,
        flowForm,
      },
    } = this.props;
    const { operationkey, listObject } = this.state;
    const { id, taskId, mode } = fromQs();
    const { taskKey } = fieldsConfig;
    const beforeTag = basicsBefore.selfTagging ? basicsBefore.selfTagging.split(',') : [];
    const afterTag = basicsAfter.selfTagging ? basicsAfter.selfTagging.split(',') : [];
    const contentList = {
      // 基本信息
      basic: (
        <>
          {listObject.map((v, vIndex) => (
            <>
              <DescriptionList size="large" title={v.title} col={2}>
                {v.list.map(item => {
                  if (item.isFile) {
                    return [
                      <Description term={item.name}>
                        <FileManagerEnhance
                          api={item.api}
                          dataKey={basicsBefore[item.key]}
                          listType="text"
                          disabled
                          preview
                        />
                      </Description>,
                      <Description term={<span>修改后</span>}>
                        <FileManagerEnhance
                          api={item.api}
                          dataKey={basicsAfter[item.key]}
                          listType="text"
                          disabled
                          preview
                        />
                      </Description>,
                    ];
                  }
                  if (item.keyList) {
                    // 设置flag值判断修改前和修改后是否有变化
                    let flag = 0;
                    item.keyList.forEach(v1 => {
                      if (basicsBefore[v1.key] !== basicsAfter[v1.key]) {
                        flag += 1;
                      }
                    });
                    return [
                      <Description term={item.name}>
                        {item.keyList.map(
                          (obj, objIndex) =>
                            (basicsBefore[obj.key] || '') +
                            (!isNil(basicsBefore[obj.key]) &&
                            !isEmpty(basicsBefore[obj.key]) &&
                            objIndex + 1 < item.keyList.length
                              ? '~'
                              : '')
                        )}
                      </Description>,
                      <Description term={<span>修改后</span>}>
                        <span className={flag && style.updateStyle}>
                          {item.keyList.map(
                            (obj, objIndex) =>
                              (basicsAfter[obj.key] || '') +
                              (!isNil(basicsAfter[obj.key]) &&
                              !isEmpty(basicsAfter[obj.key]) &&
                              objIndex + 1 < item.keyList.length
                                ? '~'
                                : '')
                          )}
                        </span>
                      </Description>,
                    ];
                  }
                  return [
                    <Description term={item.name}>{basicsBefore[item.key] || ''}</Description>,
                    <Description term={<span>修改后</span>}>
                      <span
                        className={
                          basicsBefore[item.key] !== basicsAfter[item.key] ? style.updateStyle : ''
                        }
                      >
                        {basicsAfter[item.key] || ''}
                      </span>
                    </Description>,
                  ];
                })}
              </DescriptionList>
              {vIndex + 1 < listObject.length && <Divider dashed />}
            </>
          ))}
        </>
      ),
      // 教育经历
      edubg: (
        <>
          <div className="tw-card-title">修改前</div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`${DOMAIN}/education`]}
              dataSource={twResEdubgTemporaryEntity}
              columns={edubgColumns}
              rowKey="id"
              bordered
            />
          </div>
          <br style={{ marginTop: '15px' }} />
          <Divider dashed />
          <div className="tw-card-title">
            <span>修改后</span>
          </div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`${DOMAIN}/education`]}
            dataSource={twResEdubgTemporaryEntityAfter}
            columns={edubgColumns}
            rowKey="id"
            bordered
            rowClassName={(record, index) => {
              const { edubgId = '' } = record;
              const { update } = style;
              if (!edubgId) {
                return update;
              }
              return '';
            }}
          />
        </>
      ),
      // 工作经历
      workbg: (
        <>
          <div className="tw-card-title">修改前</div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`${DOMAIN}/work`]}
              dataSource={twResWorkbgTemporaryEntity}
              columns={workbgColumns}
              rowKey="id"
              bordered
            />
          </div>
          <br style={{ marginTop: '15px' }} />
          <Divider dashed />
          <div className="tw-card-title">
            <span>修改后</span>
          </div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`${DOMAIN}/work`]}
              dataSource={twResWorkbgTemporaryEntityAfter}
              columns={workbgColumns}
              rowKey="id"
              bordered
              rowClassName={(record, index) => {
                const { workbgId = '' } = record;
                const { update } = style;
                if (!workbgId) {
                  return update;
                }
                return '';
              }}
            />
          </div>
        </>
      ),
      // 项目履历
      proExp: (
        <>
          <div className="tw-card-title">修改前</div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`${DOMAIN}/projectExperience`]}
              dataSource={twResProjLogTemporaryEntity}
              columns={proExpColumns}
              rowKey="id"
              bordered
            />
          </div>
          <br style={{ marginTop: '15px' }} />
          <Divider dashed />
          <div className="tw-card-title">
            <span>修改后</span>
          </div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`${DOMAIN}/projectExperience`]}
              dataSource={twResProjLogTemporaryEntityAfter}
              columns={proExpColumns}
              rowKey="id"
              bordered
              rowClassName={(record, index) => {
                const { projlogId = '' } = record;
                const { update } = style;
                if (!projlogId) {
                  return update;
                }
                return '';
              }}
            />
          </div>
        </>
      ),
      // 财务信息
      financeInfo: (
        <>
          <div className="tw-card-title">修改前</div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`${DOMAIN}/finance`]}
              dataSource={twAbAccTemporaryEntity}
              columns={financeInfoColumns}
              rowKey="id"
              bordered
            />
          </div>
          <br style={{ marginTop: '15px' }} />
          <Divider dashed />
          <div className="tw-card-title">
            <span>修改后</span>
          </div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`${DOMAIN}/finance`]}
              dataSource={twAbAccTemporaryEntityAfter}
              columns={financeInfoColumns}
              rowKey="id"
              bordered
              rowClassName={(record, index) => {
                const { accId = '' } = record;
                const { update } = style;
                if (!accId) {
                  return update;
                }
                return '';
              }}
            />
          </div>
        </>
      ),
      // 自我介绍不进行流程
      // selfEvaluation: (
      //   <>
      //     <DescriptionList size="large" title="自我介绍" col={2}>
      //       <Description term="自我评价">
      //         <span>
      //           <pre>{basicsBefore.selfEvaluation}</pre>
      //         </span>
      //       </Description>
      //       <Description term={<span>修改后</span>}>
      //         <span
      //           className={
      //             basicsBefore.selfEvaluation !== basicsAfter.selfEvaluation && style.updateStyle
      //           }
      //         >
      //           <pre>{basicsAfter.selfEvaluation}</pre>
      //         </span>
      //       </Description>
      //     </DescriptionList>
      //     <DescriptionList size="large" col={2}>
      //       <Description term="标签">
      //         {beforeTag.map(tagItem => (
      //           <Tag
      //             key={tagItem}
      //             style={{
      //               marginBottom: '8px',
      //             }}
      //           >
      //             {tagItem}
      //           </Tag>
      //         ))}
      //       </Description>
      //       <Description term={<span>修改后</span>}>
      //         {afterTag.map((tagItem, index) => (
      //           <Tag
      //             key={tagItem}
      //             className={beforeTag[index] !== afterTag[index] && style.updateStyle}
      //             style={{
      //               marginBottom: '8px',
      //             }}
      //           >
      //             {tagItem}
      //           </Tag>
      //         ))}
      //       </Description>
      //     </DescriptionList>
      //   </>
      // ),
    };
    const tempArr = infoEditTabList.concat([]);
    return (
      <PageHeaderWrapper title="个人信息修改审批">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark } = bpmForm;
            const { key } = operation;
            if (taskKey === 'ACC_A41_01_SUBMIT_i') {
              // 保存请求
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: {
                      taskId,
                      result: key,
                      procRemark: remark,
                      submit: 'true',
                    },
                  });
                }
              });
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          {mode === 'edit' && taskKey === 'ACC_A41_01_SUBMIT_i' ? (
            <InfoDetailsTaskOne />
          ) : (
            <Card
              className="tw-card-multiTab"
              bordered={false}
              activeTabKey={operationkey}
              tabList={tempArr.splice(0, 5)}
              onTabChange={key => this.setState({ operationkey: key })}
            >
              {contentList[operationkey]}
            </Card>
          )}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default UserDashboard;
