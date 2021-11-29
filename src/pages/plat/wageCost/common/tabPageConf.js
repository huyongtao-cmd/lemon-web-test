import { formatMessage } from 'umi/locale';

const tabConf = [
  {
    key: 'detail',
    tab: formatMessage({ id: `ui.menu.plat.expense.wageCost.mainpage.detail`, desc: '明细数据' }),
  },
  {
    key: 'payObj',
    tab: formatMessage({ id: `ui.menu.plat.expense.wageCost.mainpage.payObj`, desc: '付款对象' }),
  },
  {
    key: 'BU',
    tab: formatMessage({ id: `ui.menu.plat.expense.wageCost.mainpage.BU`, desc: 'BU成本' }),
  },
];

export default tabConf;
