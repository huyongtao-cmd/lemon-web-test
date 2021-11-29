export const mockButtons = [
  {
    type: 'button',
    icon: 'form',
    key: 'APPROVED',
    title: 'misc.accept',
    className: 'tw-btn-primary',
  },
  {
    type: 'button',
    icon: 'copy',
    key: 'REJECTED',
    title: 'misc.deny',
    className: 'tw-btn-error',
  },
  {
    type: 'cc',
  },
];

export const mockFields = [
  {
    cardId: 'leads',
    disabled: false,
    items: [
      {
        dataIndex: 'salesmanResId',
        required: true,
        disabled: false,
      },
    ],
  },
];
