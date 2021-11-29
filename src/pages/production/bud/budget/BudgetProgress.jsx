import { Progress, Tooltip } from 'antd';
import React, { forwardRef } from 'react';
import styles from './BudgetProgress.less';

const BudgetProgress = forwardRef((props, _ref) => {
  const {
    row: { totalAppropriationAmt = 0, totalBudgetAmt = 0, usedAmt = 0, occupiedAmt = 0 },
  } = props;
  const appropriationRation =
    totalBudgetAmt === 0 ? 0 : (totalAppropriationAmt / totalBudgetAmt) * 100;
  const usedRation = totalBudgetAmt === 0 ? 0 : ((usedAmt + occupiedAmt) / totalBudgetAmt) * 100;
  const wrappedAppropriationRation = Number(appropriationRation.toFixed(1));
  const wrappedUsedRation = Number(usedRation.toFixed(1));
  return (
    <Tooltip title={`已使用比例: ${wrappedUsedRation}%,已拨款比例: ${wrappedAppropriationRation}%`}>
      {/*<Progress percent={wrappedAppropriationRation} successPercent={wrappedUsedRation} />*/}

      <div className={styles.progress}>
        <div>
          <div
            style={{
              backgroundColor: '#f5f5f5',
              position: 'relative',
              borderRadius: '100px',
              width: '70%',
              display: 'inline-block',
            }}
          >
            <div
              className={styles.appropriation}
              style={{
                width: `${wrappedAppropriationRation > 100 ? 100 : wrappedAppropriationRation}%`,
                ...(wrappedAppropriationRation > 100 ? { backgroundColor: 'red' } : {}),
              }}
            />
            <div
              className={styles.used}
              style={{
                width: `${wrappedUsedRation > 100 ? 100 : wrappedUsedRation}%`,
                ...(wrappedUsedRation > 100 ? { backgroundColor: 'red' } : {}),
              }}
            />
          </div>
          <span style={{ marginLeft: '5px', display: 'inline-block' }}>{wrappedUsedRation}%</span>
        </div>
      </div>
    </Tooltip>
  );
});

export default BudgetProgress;
