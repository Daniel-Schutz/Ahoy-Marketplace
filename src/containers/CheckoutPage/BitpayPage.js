import React from 'react';
import { useLocation } from 'react-router-dom';

const BitpayPage = () => {
  const location = useLocation();
  const { orderParams, processAlias, transactionId, requestTransition, isPrivileged } = location.state;

  return (
    <div>
      <h1>Transaction Breakdown</h1>
      <ul>
        <li>Order Params: {JSON.stringify(orderParams)}</li>
        <li>Process Alias: {processAlias}</li>
        <li>Transaction ID: {transactionId}</li>
        <li>Request Transition: {requestTransition}</li>
        <li>Is Privileged: {isPrivileged ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  );
};

export default BitpayPage;
