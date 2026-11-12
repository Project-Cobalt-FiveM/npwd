import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { BankingBalanceChange, BankingEvents } from '@typings/banking';
import { useNuiEvent } from '@common/hooks/useNuiEvent';
import { useApplyBalanceChange, useLoadAccounts } from '../hooks/state';
import { AccountDetail } from './AccountDetail';
import { AccountsHome } from './AccountsHome';
import { Members } from './Members';
import { TransactionDetail } from './TransactionDetail';
import { TransferFlow } from './transfer/TransferFlow';

export const BankingApp: React.FC = () => {
  const loadAccounts = useLoadAccounts();
  const applyBalanceChange = useApplyBalanceChange();

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useNuiEvent<BankingBalanceChange>('BANKING', BankingEvents.BALANCE_CHANGED, applyBalanceChange);

  return (
    <div className="flex h-full flex-col bg-[#E7E7E7] text-[#1E201E] antialiased">
      <Switch>
        <Route path="/banking/transfer" component={TransferFlow} />
        <Route path="/banking/entry/:entryId" component={TransactionDetail} />
        <Route path="/banking/account/:accountId/members" component={Members} />
        <Route path="/banking/account/:accountId" component={AccountDetail} />
        <Route path="/banking" component={AccountsHome} />
      </Switch>
    </div>
  );
};
