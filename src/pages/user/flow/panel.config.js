/* eslint-disable */

export default [
  {
    type: 'group',
    children: [
      {
        type: 'card',
        text: '项目管理类-进度管理',
        children: [
          {
            type: 'link',
            text: '项目结项流程',
            link: '/user/project/finishProject/flowCreate',
            procIden: 'ACC_A40',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: '无合同项目申请',
            link: '/user/project/noContractProj/flowCreate',
            procIden: 'ACC_A47',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: '项目当量变更',
            link: '',
            procIden: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '项目立项流程',
            link: '/user/project/setUpProject/flowCreate',
            procIden: 'ACC_A65',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
        ],
      },
      {
        type: 'card',
        text: '项目管理类-项目人力成本管理',
        children: [
          {
            type: 'link',
            text: '全员工时填报流程',
            link: '/user/timesheet/detail',
            procIden: '',
            allowUse: true, // 一些特殊的‘流程’允许不注册就能访问
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
        ],
      },
      {
        type: 'card',
        text: '合同管理类-销售合同管理',
        children: [
          {
            type: 'link',
            text: '合同变更/终止流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '项目入场审批流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
        ],
      },
      {
        type: 'card',
        text: '合同管理类-采购合同管理',
        children: [
          {
            type: 'link',
            text: '新建采购合同(非项目)',
            link: '',
            // link: '/sale/contract/purchasesCreate',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '采购合同审批流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
        ],
      },
    ],
  },
  {
    type: 'group',
    children: [
      {
        type: 'card',
        text: '行政资产类-行政支持',
        children: [
          {
            type: 'link',
            text: 'A23.出差申请流程',
            link: '/user/center/travel/edit',
            procIden: 'ACC_A23',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'M01.用印申请流程',
            link: '/plat/adminMgmt/useSealApply/apply',
            procIden: 'ADM_M01',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: '名片申请流程',
            link: '/plat/adminMgmt/businessCard/apply',
            procIden: 'RES_R01',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: '证照借用及归还流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '自购电脑申请流程',
            link: '/plat/expense/computer/apply/create',
            procIden: 'ACC_A26',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'A19.特殊费用申请',
            link: '/plat/expense/spec/SpecCreate',
            procIden: 'ACC_A19',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
        ],
      },
      {
        type: 'card',
        text: '行政资产类-其他',
        children: [
          {
            type: 'link',
            text: '出差申请补充确定流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '知识地图功能',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
        ],
      },
      {
        type: 'card',
        text: '销售管理类',
        children: [
          {
            type: 'link',
            text: 'S01.销售线索收集',
            link: '/sale/management/leadscreate',
            procIden: 'TSK_S01',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
        ],
      },
    ],
  },
  {
    type: 'group',
    children: [
      {
        type: 'card',
        text: '财务管理类-费用报销',
        children: [
          {
            type: 'link',
            text: 'A25.专项费用报销',
            link: '/plat/expense/spec/create',
            procIden: 'ACC_A25',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'A12.非差旅费用报销',
            link: '/plat/expense/normal/create',
            procIden: 'ACC_A12',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'A13.差旅费用报销',
            link: '/plat/expense/trip/create',
            procIden: 'ACC_A13',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          // {
          //   type: 'link',
          //   text: '客户承担费用报销流程',
          //   link: '',
          //   // link: '/user/expense/TODO/apply/create',
          // },
          {
            type: 'link',
            text: 'A27.特殊费用报销',
            link: '/plat/expense/particular/create',
            procIden: 'ACC_A27',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          // {
          //   type: 'link',
          //   text: 'COS01.常规费用报销',
          //   link: '/workTable/cos/regularExpenseDisplay?mode=edit',
          //   procIden: 'COS_S01',
          //   displayFlag: 1,
          //   clickFlag: 1,
          //   jumpFlag: 1,
          // },
          // {
          //   type: 'link',
          //   text: 'COS02.差旅费用报销',
          //   link: '/workTable/cos/tripExpenseDisplay?mode=edit',
          //   procIden: 'COS02',
          //   displayFlag: 1,
          //   clickFlag: 1,
          //   jumpFlag: 1,
          // },
          // {
          //   type: 'link',
          //   text: 'COS03.福利费报销',
          //   link: '/workTable/cos/welfareExpenseDisplay?mode=edit',
          //   procIden: 'COS03',
          //   displayFlag: 1,
          //   clickFlag: 1,
          //   jumpFlag: 1,
          // },
        ],
      },
      {
        type: 'card',
        text: '财务管理类',
        children: [
          {
            type: 'link',
            text: 'A29.预付款流程',
            link: '',
            // link: '/user/center/prePay/create',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: 'A66.资金划款流程',
            link: '/plat/expense/transferMoney/flowCreate',
            procIden: 'ACC_A66',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: '备用金/项目/临时借款申请流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '还款流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '项目宿舍押金申请流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '紧急付款流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '客户承担费用开票收款流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '收入/费用结算流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
        ],
      },
      {
        type: 'card',
        text: '系统维护',
        children: [
          {
            type: 'link',
            text: '系统问题反馈流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
        ],
      },
    ],
  },
  {
    type: 'group',
    children: [
      {
        type: 'card',
        text: '人力资源管理类-员工关系管理',
        children: [
          {
            type: 'link',
            text: 'A35.员工请假流程',
            link: '/user/center/myVacation/vacationFlow/create',
            procIden: 'ACC_A35',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'A31.员工辞职流程',
            link: '/user/leave/create',
            procIden: 'ACC_A31',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'A42.试用期考核流程(中期)',
            link: '/user/probation/probationMid/create',
            procIden: 'ACC_A42',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'A43.试用期考核流程(末期)',
            link: '/user/probation/probationLast/create',
            procIden: 'ACC_A43',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'A62.BaseBU变更流程',
            link: '/user/BaseBUChange/create',
            procIden: 'ACC_A61',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          {
            type: 'link',
            text: 'G02.Base地与社保公积金缴纳地变更流程',
            link: '/user/changeBase/create',
            procIden: 'ORG_G02',
            displayFlag: 1,
            clickFlag: 1,
            jumpFlag: 1,
          },
          // {
          //   type: 'link',
          //   text: '原BaseBU-BU负责人审批',
          //   link: '/user/BaseBUChange/BaseBUCreate/flow',
          // },
          // {
          //   type: 'link',
          //   text: '加班申请流程',
          //   link: '',
          //   alert: true,
          //   displayFlag: 1,
          //   clickFlag: 1,
          //   jumpFlag: 0,
          //   clickMsg: (
          //     <div>
          //       <p>
          //         1. 加班申请流程：线下向项目经理申请，申请后请项目经理在系统维护好加班安排
          //         <br />
          //         加班安排功能入口：【项目列表 → 安排加班】 或者 【项目详情 → 成员管理 →
          //         成员加班管理】
          //       </p>
          //       <p>2. 个人可在【个人中心 → 我的加班】查看安排给我的加班和调休安排情况</p>
          //       <p style={{ color: 'red', fontWeight: 'bold' }}>
          //         3.
          //         原则上项目经理要在加班前维护好加班安排，成员实际加班后填报该项目的加班工时，审批通过后系统会自动生成相应的调休
          //       </p>
          //       <p>
          //         4.
          //         如特殊情况，成员先提交了工时，项目经理后维护的加班记录，系统不会自动生成调休；如需补调休，请成员邮件BU负责人或项目经理，手动添加调休
          //         <br />
          //         BU负责人 调休管理入口：【组织工作台 → BU考勤管理 → 调休管理】
          //         <br />
          //         项目经理 安排调休功能：【项目详情 → 成员管理 → 成员加班管理 → 安排调休】
          //       </p>
          //     </div>
          //   ),
          // },
          {
            type: 'link',
            text: '员工岗位变动',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '公司福利申请流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '申请延长假期流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '本公司实习经历',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
          {
            type: 'link',
            text: '顾问简历上传流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
        ],
      },
      {
        type: 'card',
        text: '人力资源管理类-培训管理',
        children: [
          {
            type: 'link',
            text: '培训申请流程',
            link: '',
            displayFlag: 1,
            clickFlag: 0,
            jumpFlag: 0,
          },
        ],
      },
    ],
  },
];
