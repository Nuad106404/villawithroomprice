import React from 'react';
import { CreditCard, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

export function PaymentDetails() {
  const bankDetails = [
    {
      bank: "Kasikorn Bank (KBank)",
      accountNumber: "xxx-x-xxxxx-x",
      accountName: "Your Company Name Co., Ltd.",
      branch: "Central World Branch"
    },
    {
      bank: "Bangkok Bank",
      accountNumber: "xxx-x-xxxxx-x",
      accountName: "Your Company Name Co., Ltd.",
      branch: "Siam Paragon Branch"
    },
    {
      bank: "SCB (Siam Commercial Bank)",
      accountNumber: "xxx-x-xxxxx-x",
      accountName: "Your Company Name Co., Ltd.",
      branch: "EmQuartier Branch"
    }
  ];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-amber-500" />
          Bank Transfer Details
        </h3>
      </div>

      <div className="space-y-6">
        {bankDetails.map((bank) => (
          <div 
            key={bank.bank} 
            className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {bank.bank}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {bank.branch}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Account Number</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">{bank.accountNumber}</span>
                  <button
                    onClick={() => handleCopy(bank.accountNumber, 'Account number')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-500 hover:text-amber-500" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Account Name</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">{bank.accountName}</span>
                  <button
                    onClick={() => handleCopy(bank.accountName, 'Account name')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-500 hover:text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}