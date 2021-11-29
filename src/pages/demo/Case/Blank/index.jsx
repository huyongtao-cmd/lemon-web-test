import React, { createContext } from 'react';
import { connect } from 'dva';
import { Card, Form, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import Loading from '@/components/core/DataLoading';

// eslint-disable-next-line
import DemoT1 from './DemoT1';
// eslint-disable-next-line
import DemoT2 from './DemoT2';
// eslint-disable-next-line
import DemoT3 from './DemoT3';

const DOMAIN = 'fiddle'; // 自己替换
const BlankPageContext = createContext();

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, fiddle }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...fiddle, // 代表与该组件相关redux的model
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { dispatch } = props;
      const { name, value } = Object.values(changedFields)[0];
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class BlankPage extends React.PureComponent {
  state = {
    tabkey: 'tab1', // 复制这个页面过去这里需要什么写什么，这里是tab的demo所以这样写
  };

  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    // this.setState({});
  }

  /**
   * 页面样式显示完成后，或者关键数据完成加载后要做的事情
   */
  componentDidMount() {
    // const { dispatch } = this.props;
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  // 把要传递到子tab页面的属性啊什么的放在这个函数里面
  getContext = () => {
    // 不要忘记表单内容是放在redux里面的
    const { dispatch, formData } = this.props;

    return {
      dispatch,
      formData,
      markTab: this.markTab,
    };
  };

  // 注意函数的写法，只有这样写，该函数的上下文this才是当前类，不然则是调用者的上下文
  onTabChange = key => {
    this.setState({ tabkey: key });
  };

  // 标记tab字段修改
  markTab = index => {
    const { dispatch, tabModified } = this.props;
    // 这里只记录变化 任何字段输入都会触发
    if (!tabModified[index]) {
      tabModified[index] = 1;

      dispatch({
        type: 'fiddle/updateState',
        payload: {
          tabModified,
        },
      });
    }
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    // tab的状态放在本地
    const { tabkey } = this.state;
    // 是否变更放在redux中
    const { tabModified } = this.props;

    // 每一个页面组件都是由一个PageHeaderWrapper来控制全局样式的。
    // 里面可能是很多的card，或者是自定义内容。如果很复杂，可以把复杂内容做成子组件放在同级目录下import进来
    return (
      <PageHeaderWrapper
        title={
          /* 页面标题: 把注释写在后面 */
          <FormattedMessage id="ui.menu.demo.case" defaultMessage="页面标题 - 使用国际化标签" />
        }
      >
        {/* 空白卡片 */}
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <>
              <Title
                icon="profile"
                id="ui.menu.demo.card"
                defaultMessage="卡片标题 - 可以带一个图标，其他地方也可以用"
              />
              <small className="m-l-4">
                - 当有异步加载大量数据的时候，可以添加一个loading
                (这里是测试页，所以不会有数据加载出来)。
              </small>
            </>
          }
        >
          <blockquote>
            <pre>
              <p>
                空白卡片 -
                每个表单/表格页面都是由卡片组成的。注意这里是JSX，因此所有的HTML代码片段都是组件的一部分。
              </p>
              <p>
                由于DOM更新算法的存在，数组元素必须指定key不然会报错。如果没有根节点，你可以使用{' '}
                {'<></>'} 片段包裹多个元素。
              </p>
              <p>
                遇到多Tab卡片内嵌套子tab或者页面，也可以使用Context
                API处理属性向下级传递多级导致代码过度耦合的问题。
              </p>
            </pre>
            <cite>
              —— 以上整个引用中的内容(包含这句话)拷贝之后不要忘记删除，感谢您的理解与配合。
            </cite>
          </blockquote>
          <Loading />
        </Card>
        <br />

        {/* Tab卡片
            - 我知道这里稍微有点复杂，不过我已经尽量做的简单了，希望大家注意整个tab卡片的依赖控制变量。 */}
        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={[
            {
              key: 'tab1',
              tab: (
                <Title
                  dir="right"
                  icon={tabModified[0] ? 'warning' : null}
                  id="dev.demo.tab.title.tab1"
                  defaultMessage="内容-1"
                />
              ),
            },
            {
              key: 'tab2',
              tab: (
                <Title
                  dir="right"
                  icon={tabModified[1] ? 'warning' : null}
                  id="dev.demo.tab.title.tab2"
                  defaultMessage="内容-2"
                />
              ),
            },
            {
              key: 'tab3',
              tab: (
                <Title
                  dir="right"
                  icon={tabModified[2] ? 'warning' : null}
                  id="dev.demo.tab.title.tab3"
                  defaultMessage="内容-3"
                />
              ),
            },
          ]}
          onTabChange={this.onTabChange}
        >
          <BlankPageContext.Provider value={this.getContext()}>
            {
              /* webstorm/idea可以直接点进去。这里多个tab可共享一个上下文,类似以前scope的概念。
                这样写的好处是，万一你的Tab里还有子Tab或者引用，依然可以通过相同的方法用这里的上下文，不用一级级props传递。
                还有，这里拷贝过去不要忘记把这行注释删掉。。。 */
              {
                tab1: <DemoT1 />,
                tab2: <DemoT2 />,
                tab3: <DemoT3 />,
              }[tabkey]
            }
          </BlankPageContext.Provider>
        </Card>
        <br />

        {/* modal引用模块 */}
        <Modal visible={false}>将弹窗做成组件在这里引用，切换visible的状态控制是否显示</Modal>
        <Modal visible={false}>将弹窗做成组件在这里引用，切换visible的状态控制是否显示</Modal>
        <Modal visible={false}>将弹窗做成组件在这里引用，切换visible的状态控制是否显示</Modal>
      </PageHeaderWrapper>
    );
  }
}

// 将上下文导出供子页面使用 领域业务名称 + Context
export { BlankPageContext };

export default BlankPage;
