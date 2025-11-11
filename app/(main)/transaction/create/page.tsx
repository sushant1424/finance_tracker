import React from 'react';

export default function CreateTransactionPage() {
  return (
    <div className="space-y-8 px-5">
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title">
          Create Transaction
        </h1>
        <p className="text-muted-foreground mt-2">
          Add a new transaction to your account
        </p>
      </div>
      
      {/* Transaction form will go here */}
      <div className="bg-white p-6 rounded-lg border">
        <p className="text-muted-foreground">Transaction form coming soon...</p>
      </div>
    </div>
  );
}
