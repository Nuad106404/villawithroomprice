import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchVillaDetails, updateVillaDetails } from '../../store/slices/villaSlice';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { villaApi } from '../../services/api';

interface BankDetails {
  bank: string;
  accountNumber: string;
  accountName: string;
}

interface FormData {
  bankDetails: BankDetails[];
}

const defaultFormData: FormData = {
  bankDetails: []
};

export default function AdminBank() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const villa = useSelector((state: RootState) => state.villa.villa);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [promptPayQR, setPromptPayQR] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (villa) {
      setFormData({
        bankDetails: villa.bankDetails || [],
      });
    }
  }, [villa]);

  useEffect(() => {
    dispatch(fetchVillaDetails() as any);
  }, [dispatch]);

  const handleAddBank = () => {
    setFormData(prev => ({
      ...prev,
      bankDetails: [
        ...prev.bankDetails,
        { bank: '', accountNumber: '', accountName: '' }
      ]
    }));
  };

  const handleRemoveBank = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.filter((_, i) => i !== index)
    }));
  };

  const handleBankDetailsChange = (index: number, field: keyof BankDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.map((bank, i) => 
        i === index ? { ...bank, [field]: value } : bank
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await dispatch(updateVillaDetails({
        bankDetails: formData.bankDetails
      }) as any);
      toast.success('Bank details updated successfully');
    } catch (error) {
      toast.error('Failed to update bank details');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptPayQR) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('qrCode', promptPayQR);
      await villaApi.uploadPromptPayQR(formData);
      await dispatch(fetchVillaDetails() as any);
      toast.success('PromptPay QR code updated successfully');
      setPromptPayQR(null);
    } catch (error) {
      toast.error('Failed to update PromptPay QR code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromptPayQR = async () => {
    setIsLoading(true);
    try {
      await villaApi.deletePromptPayQR();
      await dispatch(fetchVillaDetails() as any);
      toast.success('QR code deleted successfully');
    } catch (error) {
      toast.error('Failed to delete QR code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!villa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Bank Details Form */}
      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">Bank Account Management</h2>

            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Bank Accounts</h3>
                <Button
                  type="button"
                  onClick={handleAddBank}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Bank Account
                </Button>
              </div>

              {formData.bankDetails.map((bank, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveBank(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`bank-${index}`}>Bank Name</Label>
                      <Input
                        id={`bank-${index}`}
                        value={bank.bank}
                        onChange={(e) => handleBankDetailsChange(index, 'bank', e.target.value)}
                        placeholder="Enter bank name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`account-number-${index}`}>Account Number</Label>
                      <Input
                        id={`account-number-${index}`}
                        value={bank.accountNumber}
                        onChange={(e) => handleBankDetailsChange(index, 'accountNumber', e.target.value)}
                        placeholder="Enter account number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`account-name-${index}`}>Account Name</Label>
                      <Input
                        id={`account-name-${index}`}
                        value={bank.accountName}
                        onChange={(e) => handleBankDetailsChange(index, 'accountName', e.target.value)}
                        placeholder="Enter account name"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Separate PromptPay Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          PromptPay QR Code
        </h3>
        
        <form onSubmit={handlePromptPaySubmit} className="space-y-6">
          <div>
            <Label>QR Code Image</Label>
            <div className="mt-2 space-y-4">
              {villa?.promptPay?.qrImage && (
                <div className="relative w-48 h-48 mx-auto">
                  <img
                    src={villa.promptPay.qrImage}
                    alt="Current PromptPay QR"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={handleDeletePromptPayQR}
                  >
                    Delete QR Code
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPromptPayQR(e.target.files?.[0])}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update PromptPay QR'}
          </Button>
        </form>
      </div>
    </div>
  );
}
