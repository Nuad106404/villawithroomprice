import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { QRCode } from './QRCode';

export function PaymentDetails() {
  const { t } = useTranslation();
  const villa = useSelector((state: RootState) => state.villa.villa);
  const bankDetails = villa?.bankDetails || [];
  const booking = useSelector((state: RootState) => state.booking.booking);
  const amount = booking?.totalAmount || 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8">


        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bank Transfer
          </h3>
          
          <div className="space-y-4">
            {bankDetails.map((bank, index) => (
              <div
                key={index}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4"
              >
                <div className="flex flex-col">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {bank.bank}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Account Number
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {bank.accountNumber}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Account Name
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {bank.accountName}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCopy(bank.accountNumber)}
                >
                  Copy Account Number
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Please transfer the full amount using either PromptPay QR Code or bank transfer. After making the transfer, you will need to upload the payment slip in the next step.</p>
        </div>
      </div>
    </div>
  );
}