import React from 'react';

export default function TransactionsPage() {
  return (
    <div className="space-y-8 px-5">
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title">
          Transactions
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your transactions
        </p>
      </div>
      
      {/* Transactions list will go here */}
      <div className="bg-white p-6 rounded-lg border">
        <p className="text-muted-foreground">Transactions list coming soon...</p>
      </div>
    </div>
  );
}
