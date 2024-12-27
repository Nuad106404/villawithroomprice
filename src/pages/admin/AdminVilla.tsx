import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchVillaDetails, updateVillaDetails, setVilla } from '../../store/slices/villaSlice';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { villaApi } from '../../services/api';

interface FormData {
  name: {
    en: string;
    th: string;
  };
  title: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  beachfront: {
    en: string;
    th: string;
  };
  pricePerNight: number;
  discountedPrice: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  bankDetails: Array<{
    bank: string;
    accountNumber: string;
    accountName: string;
  }>;
  backgroundImage?: string;
  newBackgroundImage?: File;
  slideImages: string[];
  newSlideImages?: FileList;
}

const defaultFormData: FormData = {
  name: { en: '', th: '' },
  title: { en: '', th: '' },
  description: { en: '', th: '' },
  beachfront: { en: '', th: '' },
  pricePerNight: 0,
  discountedPrice: 0,
  maxGuests: 6,
  bedrooms: 3,
  bathrooms: 3,
  bankDetails: [
    {
      bank: '',
      accountNumber: '',
      accountName: ''
    }
  ],
  slideImages: [],
};

export default function AdminVilla() {
  const dispatch = useDispatch();
  const { villa, loading } = useSelector((state: RootState) => state.villa);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [promptPayQR, setPromptPayQR] = useState<File | null>(null);
  const [promptPayQRPreview, setPromptPayQRPreview] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchVillaDetails());
  }, [dispatch]);

  useEffect(() => {
    if (villa) {
      setFormData({
        name: villa.name || { en: '', th: '' },
        title: villa.title || { en: '', th: '' },
        description: villa.description || { en: '', th: '' },
        beachfront: villa.beachfront || { en: '', th: '' },
        pricePerNight: villa.pricePerNight || 0,
        discountedPrice: villa.discountedPrice || 0,
        maxGuests: villa.maxGuests || 6,
        bedrooms: villa.bedrooms || 3,
        bathrooms: villa.bathrooms || 3,
        bankDetails: villa.bankDetails || [
          {
            bank: '',
            accountNumber: '',
            accountName: ''
          }
        ],
        backgroundImage: villa.backgroundImage,
        slideImages: villa.slideImages || [],
      });
      setPromptPayQRPreview(villa.promptPay?.qrImage || '');
    }
  }, [villa]);

  const handleInputChange = (
    field: string,
    value: string | number,
    lang?: 'en' | 'th'
  ) => {
    setFormData((prev) => {
      if (lang) {
        return {
          ...prev,
          [field]: {
            ...prev[field as keyof typeof prev],
            [lang]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleBackgroundImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store the file in formData without uploading
    setFormData(prev => ({
      ...prev,
      newBackgroundImage: file
    }));
  };

  const handleSlideImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setFormData(prev => ({
      ...prev,
      newSlideImages: files
    }));
  };

  const handleDeleteSlideImage = async (index: number) => {
    try {
      const response = await axios.delete(`/admin/villa/slides/${index}`);
      dispatch(setVilla(response.data.villa));
      toast.success('Slide image deleted successfully');
    } catch (error) {
      console.error('Error deleting slide image:', error);
      toast.error('Failed to delete slide image');
    }
  };

  const handleReorderSlideImages = async (newOrder: number[]) => {
    try {
      const response = await axios.patch('/admin/villa/slides/reorder', { newOrder });
      dispatch(setVilla(response.data.villa));
      toast.success('Slide images reordered successfully');
    } catch (error) {
      console.error('Error reordering slide images:', error);
      toast.error('Failed to reorder slide images');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate bank details
      const hasEmptyBankDetails = formData.bankDetails.some(
        bank => !bank.bank || !bank.accountNumber || !bank.accountName
      );

      if (hasEmptyBankDetails) {
        setError('All bank details fields are required');
        setIsSubmitting(false);
        return;
      }

      // Format bank details
      const formattedBankDetails = formData.bankDetails.map(bank => ({
        bank: bank.bank.trim(),
        accountNumber: bank.accountNumber.trim(),
        accountName: bank.accountName.trim()
      }));

      // Prepare form data
      const formDataToSubmit = {
        ...formData,
        bankDetails: formattedBankDetails
      };

      const response = await axios.patch('/admin/villa', formDataToSubmit);
      
      if (response.status === 200) {
        toast.success('Villa details updated successfully');
        
        // Update local state with formatted data
        setFormData(prev => ({
          ...prev,
          bankDetails: formattedBankDetails
        }));
      }
    } catch (error: any) {
      console.error('Error updating villa:', error);
      setError(error.response?.data?.message || 'Error updating villa details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankDetailsSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Validate bank details
      const hasEmptyBankDetails = formData.bankDetails.some(
        bank => !bank.bank || !bank.accountNumber || !bank.accountName
      );

      if (hasEmptyBankDetails) {
        setError('All bank details fields are required');
        setIsSubmitting(false);
        return;
      }

      // Format bank details
      const formattedBankDetails = formData.bankDetails.map(bank => ({
        bank: bank.bank.trim(),
        accountNumber: bank.accountNumber.trim(),
        accountName: bank.accountName.trim()
      }));

      // Update bank details
      const response = await villaApi.updateBankDetails(formattedBankDetails);
      
      if (response.bankDetails) {
        // Update local state with formatted data
        setFormData(prev => ({
          ...prev,
          bankDetails: response.bankDetails
        }));
        toast.success('Bank details updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating bank details:', error);
      const errorMessage = error.message || 'Error updating bank details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankDetailsChange = (index: number, field: string, value: string) => {
    const newBankDetails = [...formData.bankDetails];
    newBankDetails[index] = {
      ...newBankDetails[index],
      [field]: value
    };
    handleInputChange('bankDetails', newBankDetails);
  };

  const addBankDetail = () => {
    const newBankDetails = [...formData.bankDetails];
    newBankDetails.push({
      bank: '',
      accountNumber: '',
      accountName: ''
    });
    handleInputChange('bankDetails', newBankDetails);
  };

  const removeBankDetail = (index: number) => {
    const newBankDetails = [...formData.bankDetails];
    newBankDetails.splice(index, 1);
    handleInputChange('bankDetails', newBankDetails);
  };

  const handlePromptPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let qrImageUrl = villa?.promptPay?.qrImage || '';

      if (promptPayQR) {
        const formData = new FormData();
        formData.append('image', promptPayQR);
        const { imageUrl } = await villaApi.uploadImage(formData);
        qrImageUrl = imageUrl;
      }

      await villaApi.updatePromptPay({ qrImage: qrImageUrl });
      toast.success('PromptPay QR updated successfully');
      dispatch(fetchVillaDetails());
    } catch (error) {
      toast.error('Failed to update PromptPay QR');
      console.error('Error updating PromptPay:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPromptPayQR(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromptPayQRPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePromptPayQR = async () => {
    try {
      await villaApi.updatePromptPay({ qrImage: '' });
      toast.success('PromptPay QR deleted successfully');
      dispatch(fetchVillaDetails());
    } catch (error) {
      toast.error('Failed to delete PromptPay QR');
      console.error('Error deleting PromptPay QR:', error);
    }
  };

  if (!villa && loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Villa Settings</h1>
      
      <Card className="max-w-2xl">
        <div className="space-y-6 p-6">
          {/* Main Villa Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Background Image Upload */}
            <div className="mb-6 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Background Image</h2>
              <div className="flex items-center gap-4">
                {(formData.backgroundImage || formData.newBackgroundImage) && (
                  <img
                    src={formData.newBackgroundImage 
                      ? URL.createObjectURL(formData.newBackgroundImage)
                      : formData.backgroundImage}
                    alt="Villa background"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended size: 1920x1080px. Max file size: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Slide Images Upload */}
            <div className="mb-6 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Slide Images</h2>
              
              {/* Current Slide Images */}
              {formData.slideImages && formData.slideImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.slideImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteSlideImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Slide Images Preview */}
              {formData.newSlideImages && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {Array.from(formData.newSlideImages).map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New slide ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Input */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSlideImagesChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  You can upload multiple images. Recommended size: 1920x1080px. Max file size: 5MB each
                </p>
              </div>
            </div>

            {/* English Name */}
            <div className="space-y-2">
              <Label htmlFor="name-en">Villa Name (English)</Label>
              <Input
                id="name-en"
                value={formData.name.en}
                onChange={(e) => handleInputChange('name', e.target.value, 'en')}
                placeholder="Enter villa name in English"
                className="w-full"
                required
              />
            </div>

            {/* Thai Name */}
            <div className="space-y-2">
              <Label htmlFor="name-th">Villa Name (Thai)</Label>
              <Input
                id="name-th"
                value={formData.name.th}
                onChange={(e) => handleInputChange('name', e.target.value, 'th')}
                placeholder="Enter villa name in Thai"
                className="w-full"
                required
              />
            </div>

            {/* English Title */}
            <div className="space-y-2">
              <Label htmlFor="title-en">Hero Title (English)</Label>
              <Input
                id="title-en"
                value={formData.title.en}
                onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                placeholder="Enter hero title in English"
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                This title will be displayed in the hero section of the homepage
              </p>
            </div>

            {/* Thai Title */}
            <div className="space-y-2">
              <Label htmlFor="title-th">Hero Title (Thai)</Label>
              <Input
                id="title-th"
                value={formData.title.th}
                onChange={(e) => handleInputChange('title', e.target.value, 'th')}
                placeholder="Enter hero title in Thai"
                className="w-full"
                required
              />
            </div>

            {/* English Description */}
            <div className="space-y-2">
              <Label htmlFor="description-en">Description (English)</Label>
              <textarea
                id="description-en"
                value={formData.description.en}
                onChange={(e) => handleInputChange('description', e.target.value, 'en')}
                placeholder="Enter description in English"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md border-input bg-background resize-y"
                required
              />
            </div>

            {/* Thai Description */}
            <div className="space-y-2">
              <Label htmlFor="description-th">Description (Thai)</Label>
              <textarea
                id="description-th"
                value={formData.description.th}
                onChange={(e) => handleInputChange('description', e.target.value, 'th')}
                placeholder="Enter description in Thai"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md border-input bg-background resize-y"
                required
              />
            </div>

            {/* English Beachfront */}
            <div className="space-y-2">
              <Label htmlFor="beachfront-en">Beachfront Description (English)</Label>
              <Input
                id="beachfront-en"
                value={formData.beachfront.en}
                onChange={(e) => handleInputChange('beachfront', e.target.value, 'en')}
                placeholder="Enter beachfront description in English"
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                This text appears in the villa description section
              </p>
            </div>

            {/* Thai Beachfront */}
            <div className="space-y-2">
              <Label htmlFor="beachfront-th">Beachfront Description (Thai)</Label>
              <Input
                id="beachfront-th"
                value={formData.beachfront.th}
                onChange={(e) => handleInputChange('beachfront', e.target.value, 'th')}
                placeholder="Enter beachfront description in Thai"
                className="w-full"
                required
              />
            </div>

            {/* Price Per Night */}
            <div className="space-y-2">
              <Label htmlFor="pricePerNight">Price Per Night</Label>
              <Input
                id="pricePerNight"
                type="number"
                min={0}
                step="0.01"
                value={formData.pricePerNight}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (value >= 0) {
                    handleInputChange('pricePerNight', value);
                  }
                }}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                Price per night for the villa
              </p>
            </div>

            {/* Discounted Price */}
            <div className="space-y-2">
              <Label htmlFor="discountedPrice">Discounted Price</Label>
              <Input
                id="discountedPrice"
                type="number"
                min={0}
                step="0.01"
                value={formData.discountedPrice}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (value >= 0) {
                    handleInputChange('discountedPrice', value);
                  }
                }}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                Discounted price per night for the villa
              </p>
            </div>

            {/* Max Guests */}
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Maximum Number of Guests</Label>
              <Input
                id="maxGuests"
                type="number"
                min={1}
                max={50}
                value={formData.maxGuests}
                onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value))}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                Maximum number of guests allowed in the villa
              </p>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Number of Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min={1}
                max={50}
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                Number of bedrooms in the villa
              </p>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Number of Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min={1}
                max={50}
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                Number of bathrooms in the villa
              </p>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bank Details
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBankDetail}
                  disabled={formData.bankDetails.length >= 5}
                >
                  Add Bank
                </Button>
              </div>
              
              {formData.bankDetails.map((bank, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bank #{index + 1}
                    </h4>
                    {formData.bankDetails.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBankDetail(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`bank-${index}`}>Bank Name</Label>
                      <Input
                        id={`bank-${index}`}
                        value={bank.bank}
                        onChange={(e) => handleBankDetailsChange(index, 'bank', e.target.value)}
                        placeholder="e.g., Kasikorn Bank (KBank)"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`accountNumber-${index}`}>Account Number</Label>
                      <Input
                        id={`accountNumber-${index}`}
                        value={bank.accountNumber}
                        onChange={(e) => handleBankDetailsChange(index, 'accountNumber', e.target.value)}
                        placeholder="xxx-x-xxxxx-x"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`accountName-${index}`}>Account Name</Label>
                      <Input
                        id={`accountName-${index}`}
                        value={bank.accountName}
                        onChange={(e) => handleBankDetailsChange(index, 'accountName', e.target.value)}
                        placeholder="Company Name Co., Ltd."
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {error && (
                <p className="text-sm text-red-500 mt-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleBankDetailsSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Bank Details'}
                </Button>
              </div>
            </div>

            {/* Main form submit button */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="submit"
                className="w-32"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
