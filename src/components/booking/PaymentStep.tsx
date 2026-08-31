import { useState, useRef } from 'react';
import {
  Building,
  MessageCircle,
  Shield,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Banknote,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileCheck,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import type { BankAccount } from '@/types';

export interface PaymentSubmitData {
  paymentMethod: string;
  selectedCurrencyCode?: string;
  senderName?: string;
  senderNumber?: string;
  transferAmount?: number;
  transferCurrencyCode?: string;
  transferToNumber?: string;
  receiptDataUrl?: string;
  receiptFileName?: string;
}

interface PaymentStepProps {
  onBack: () => void;
  onConfirm: (data: PaymentSubmitData) => void;
  isLoading?: boolean;
  error?: string | null;
  bankAccounts?: BankAccount[];
  expectedTotalUsd?: number;
}

const CURRENCY_LABELS: Record<string, { name: string; flag: string }> = {
  usd: { name: 'دولار أمريكي (USD)', flag: '🇺🇸' },
  USD: { name: 'دولار أمريكي (USD)', flag: '🇺🇸' },
  sar: { name: 'ريال سعودي (SAR)', flag: '🇸🇦' },
  SAR: { name: 'ريال سعودي (SAR)', flag: '🇸🇦' },
  yerSouth: { name: 'ريال يمني جديد (عدن/المحافظات)', flag: '🇾🇪' },
  yerNorth: { name: 'ريال يمني قديم (صنعاء)', flag: '🇾🇪' },
};

export default function PaymentStep({
  onBack,
  onConfirm,
  isLoading = false,
  error,
  bankAccounts = [],
  expectedTotalUsd,
}: PaymentStepProps) {
  // Payment selection: bank ID string, or 'cash', or 'whatsapp'
  const firstBank = bankAccounts.length > 0 ? bankAccounts[0] : null;
  const [selectedMethod, setSelectedMethod] = useState<string>(
    firstBank ? firstBank.id : 'cash'
  );

  // For bank transfer details
  const currentBank = bankAccounts.find((b) => b.id === selectedMethod);
  const availableCurrencies = currentBank?.accounts || [];

  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    availableCurrencies[0]?.currencyCode || 'SAR'
  );
  const [senderName, setSenderName] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);

  // Receipt image upload state (مطابق لتطبيق مساري)
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptFileSize, setReceiptFileSize] = useState<string>('');
  const [isProcessingReceipt, setIsProcessingReceipt] = useState<boolean>(false);
  const [showReceiptZoom, setShowReceiptZoom] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeAccount =
    availableCurrencies.find(
      (a) => a.currencyCode.toLowerCase() === selectedCurrency.toLowerCase()
    ) || availableCurrencies[0];

  const handleCopyAccount = () => {
    if (activeAccount?.accountNumber) {
      navigator.clipboard.writeText(activeAccount.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setValidationError('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).');
      return;
    }

    // Validate size (max 15MB before client compression)
    if (file.size > 15 * 1024 * 1024) {
      setValidationError('حجم الصورة كبير جداً. الحد الأقصى هو 15 ميغابايت.');
      return;
    }

    setValidationError(null);
    setIsProcessingReceipt(true);
    setReceiptFileName(file.name);
    setReceiptFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    try {
      // Compress and resize image client-side to ensure fast and lightweight upload (<500KB)
      const compressedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            try {
              const maxDimension = 1600;
              let width = img.width;
              let height = img.height;

              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = Math.round((height * maxDimension) / width);
                  width = maxDimension;
                } else {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(event.target?.result as string);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              resolve(dataUrl);
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = () => reject(new Error('Failed to decode image'));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      if (compressedDataUrl) {
        setReceiptImage(compressedDataUrl);
      } else {
        throw new Error('Empty image data');
      }
    } catch {
      // Fallback to raw file read with validation
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        if (res) {
          setReceiptImage(res);
        } else {
          setValidationError('فشلت قراءة ملف الإيصال. يرجى إعادة المحاولة.');
          setReceiptImage(null);
        }
      };
      reader.onerror = () => {
        setValidationError('تعذر قراءة ملف الإيصال. يرجى اختيار ملف صالح.');
        setReceiptImage(null);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptImage(null);
    setReceiptFileName('');
    setReceiptFileSize('');
    setIsProcessingReceipt(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isBankTransfer = !!currentBank;

  const handleSubmit = () => {
    setValidationError(null);

    if (isBankTransfer) {
      if (isProcessingReceipt) {
        setValidationError('جاري معالجة وتجهيز صورة الإشعار، يرجى الانتظار ثوانٍ معدودة...');
        return;
      }
      if (!senderName || senderName.trim().length < 2) {
        setValidationError('يرجى إدخال اسم المحوّل بالكامل (حرفين على الأقل).');
        return;
      }
      const parsedAmount = parseFloat(transferAmount.trim().replace(',', '.'));
      if (!transferAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setValidationError('يرجى إدخال مبلغ التحويل بشكل صحيح.');
        return;
      }
      if (!receiptImage) {
        setValidationError('يرجى إرفاق صورة إشعار التحويل البنكي للمتابعة.');
        return;
      }

      onConfirm({
        paymentMethod: 'transfer',
        selectedCurrencyCode: activeAccount?.currencyCode || selectedCurrency,
        senderName: senderName.trim(),
        transferAmount: parsedAmount,
        transferCurrencyCode: activeAccount?.currencyCode || selectedCurrency,
        transferToNumber: activeAccount?.accountNumber || '',
        receiptDataUrl: receiptImage,
        receiptFileName: receiptFileName || 'receipt.jpg',
      });
      return;
    }

    if (selectedMethod === 'cash') {
      onConfirm({
        paymentMethod: 'cash',
        selectedCurrencyCode: 'USD',
      });
      return;
    }

    // Default: whatsapp
    onConfirm({
      paymentMethod: 'whatsapp',
      selectedCurrencyCode: 'USD',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-xl font-black text-neutral-900">طريقة الدفع</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            اختر وسيلة الدفع المناسبة لإتمام وتأكيد حجزك
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
          <CreditCard size={20} />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* Section Title for Bank Accounts */}
        {bankAccounts.length > 0 && (
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            الحسابات والمحافظ البنكية المعتمدة:
          </p>
        )}

        {/* Dynamic Operational Bank Accounts */}
        {bankAccounts.map((bank) => {
          const isSelected = selectedMethod === bank.id;
          return (
            <div key={bank.id} className="rounded-2xl transition-all">
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod(bank.id);
                  if (bank.accounts.length > 0) {
                    setSelectedCurrency(bank.accounts[0].currencyCode);
                  }
                }}
                className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#23096e] bg-[#23096e]/5 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isSelected ? 'text-white' : 'text-neutral-700 bg-neutral-100'
                  }`}
                  style={
                    isSelected
                      ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }
                      : {}
                  }
                >
                  {bank.iconUrl ? (
                    <img
                      src={bank.iconUrl}
                      alt={bank.nameAr}
                      className="w-7 h-7 object-contain rounded-md"
                    />
                  ) : (
                    <Building size={22} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-neutral-900 text-sm sm:text-base">
                      تحويل عبر {bank.nameAr}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      معتمد
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    التحويل المباشر إلى حسابات مساري المعتمدة في {bank.nameAr}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#23096e]' : 'border-neutral-300'
                  }`}
                >
                  {isSelected && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: '#23096e' }}
                    />
                  )}
                </div>
              </button>

              {/* Bank Details & Transfer Form when this bank is selected */}
              {isSelected && (
                <div className="mt-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Currency Selector */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        عملة التحويل *
                      </label>
                      <select
                        value={activeAccount?.currencyCode || selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-bold text-neutral-800 bg-white outline-none focus:border-[#23096e]"
                      >
                        {bank.accounts.map((acc) => (
                          <option key={acc.currencyCode} value={acc.currencyCode}>
                            {CURRENCY_LABELS[acc.currencyCode]?.flag || '💵'}{' '}
                            {CURRENCY_LABELS[acc.currencyCode]?.name || acc.currencyCode}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Account Number Box */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        رقم الحساب المحوّل إليه ({bank.nameAr})
                      </label>
                      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white">
                        <span
                          className="font-mono font-black text-neutral-900 tracking-wider text-sm sm:text-base"
                          dir="ltr"
                        >
                          {activeAccount?.accountNumber || 'غير متوفر'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:underline cursor-pointer"
                        >
                          {copiedAccount ? (
                            <>
                              <Check size={14} className="text-emerald-600" />
                              <span className="text-emerald-600">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transfer details: Sender Name & Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200/80">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        اسم المحوّل (صاحب الحساب المرسل) *
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="أدخل اسم الشخص الذي قام بالتحويل"
                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-medium text-neutral-800 bg-white outline-none focus:border-[#23096e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        المبلغ المحوّل *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="أدخل المبلغ المحول بالضبط"
                        className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-medium text-neutral-800 bg-white outline-none focus:border-[#23096e]"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Receipt Upload Section (مطابق لتطبيق مساري) */}
                  <div className="pt-2 border-t border-neutral-200/80">
                    <label className="block text-xs font-bold text-neutral-700 mb-2">
                      إرفاق إشعار / إيصال التحويل (لتأكيد الحجز)
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="receipt-upload-input"
                    />

                    {isProcessingReceipt ? (
                      <div className="w-full border-2 border-dashed border-[#23096e]/40 rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-[#23096e]/5 text-center animate-pulse">
                        <Loader2 size={26} className="animate-spin text-[#23096e]" />
                        <p className="text-xs font-bold text-[#23096e]">
                          جاري معالجة وتحسين صورة الإيصال...
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          يتم ضغط الصورة تلقائياً لسرعة الإرسال والتأكيد
                        </p>
                      </div>
                    ) : !receiptImage ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-neutral-300 hover:border-[#23096e] rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-neutral-50/50 hover:bg-[#23096e]/5 transition-all cursor-pointer text-center group shadow-sm hover:shadow"
                      >
                        <div className="w-12 h-12 rounded-full bg-white group-hover:bg-[#23096e]/10 text-neutral-500 group-hover:text-[#23096e] flex items-center justify-center transition-colors shadow-sm">
                          <Upload size={20} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-[#23096e] transition-colors">
                            اضغط هنا لاختيار صورة إشعار التحويل البنكي
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            يقبل صور JPG, PNG, WEBP من الكاميرا أو المعرض
                          </p>
                        </div>
                      </button>
                    ) : (
                      <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-50/30 p-3.5 shadow-sm transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Thumbnail with zoom trigger */}
                            <button
                              type="button"
                              onClick={() => setShowReceiptZoom(true)}
                              className="relative group w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shrink-0 cursor-pointer shadow-sm"
                              title="اضغط لتكبير ومعاينة الصورة"
                            >
                              <img
                                src={receiptImage}
                                alt="Receipt Preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye size={16} />
                              </div>
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                <FileCheck size={14} className="text-emerald-600 shrink-0" />
                                <span>تم إرفاق وتجهيز الإيصال بنجاح</span>
                              </div>
                              <p className="text-xs font-medium text-neutral-700 truncate mt-0.5" dir="ltr">
                                {receiptFileName || 'receipt.jpg'}
                              </p>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 mt-1">
                                {receiptFileSize || 'جاهز للإرسال'}
                              </span>
                            </div>
                          </div>

                          {/* Actions: View / Replace / Remove */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setShowReceiptZoom(true)}
                              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                              title="معاينة الصورة بالحجم الكامل"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                              title="استبدال بصورة أخرى"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveReceipt}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                              title="حذف الإيصال"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Full Image Zoom Modal */}
                        {showReceiptZoom && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                            <div className="relative max-w-2xl w-full bg-white rounded-2xl p-4 shadow-2xl flex flex-col max-h-[90vh]">
                              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                                <h4 className="text-sm font-bold text-neutral-900">
                                  معاينة إشعار التحويل البنكي
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setShowReceiptZoom(false)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                              <div className="overflow-auto py-3 flex items-center justify-center">
                                <img
                                  src={receiptImage}
                                  alt="Receipt Full Preview"
                                  className="max-h-[70vh] rounded-lg object-contain"
                                />
                              </div>
                              <div className="pt-3 border-t border-neutral-200 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowReceiptZoom(false)}
                                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                  إغلاق المعاينة
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                    <span className="text-emerald-600 font-bold">ملاحظة:</span> سيتم تأكيد حجزك بعد التحقق من إشعار التحويل ومطابقة المبلغ المحول.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Other Payment Methods Title */}
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider pt-2">
          خيارات دفع أخرى:
        </p>

        {/* Cash on Arrival (مطابق لتطبيق مساري) */}
        <button
          type="button"
          onClick={() => setSelectedMethod('cash')}
          className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-start transition-all cursor-pointer ${
            selectedMethod === 'cash'
              ? 'border-[#23096e] bg-[#23096e]/5 shadow-sm'
              : 'border-neutral-200 hover:border-neutral-300 bg-white'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
              selectedMethod === 'cash' ? 'text-white' : 'text-emerald-600 bg-emerald-50'
            }`}
            style={
              selectedMethod === 'cash'
                ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }
                : {}
            }
          >
            <Banknote size={22} />
          </div>
          <div className="flex-1">
            <p className="font-black text-neutral-900 text-sm sm:text-base">
              الدفع نقداً عند الوصول
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              ادفع قيمة إقامتك نقداً عند وصولك إلى مكتب الاستقبال في الفندق.
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedMethod === 'cash' ? 'border-[#23096e]' : 'border-neutral-300'
            }`}
          >
            {selectedMethod === 'cash' && (
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: '#23096e' }}
              />
            )}
          </div>
        </button>

        {/* WhatsApp Option */}
        <button
          type="button"
          onClick={() => setSelectedMethod('whatsapp')}
          className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-start transition-all cursor-pointer ${
            selectedMethod === 'whatsapp'
              ? 'border-[#23096e] bg-[#23096e]/5 shadow-sm'
              : 'border-neutral-200 hover:border-neutral-300 bg-white'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
              selectedMethod === 'whatsapp' ? 'text-white' : 'text-green-500 bg-green-50'
            }`}
            style={
              selectedMethod === 'whatsapp'
                ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }
                : {}
            }
          >
            <MessageCircle size={22} />
          </div>
          <div className="flex-1">
            <p className="font-black text-neutral-900 text-sm sm:text-base">
              طلب حجز وتنسيق عبر واتساب
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              نستلم طلبك وسيتواصل معك فريق خدمة العملاء فوراً لترتيب طريقة الدفع والتأكيد.
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedMethod === 'whatsapp' ? 'border-[#23096e]' : 'border-neutral-300'
            }`}
          >
            {selectedMethod === 'whatsapp' && (
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: '#23096e' }}
              />
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200/60 mb-6">
        <Shield size={18} className="text-amber-600 shrink-0" />
        <p className="text-xs sm:text-sm text-amber-800 font-medium leading-relaxed">
          تنبيه: إرسال الطلب في هذه الخطوة لا يعني تأكيد الحجز نهائياً. يتم اعتماد الحجز بعد مطابقة إشعار الدفع أو التحقق مع الفندق.
        </p>
      </div>

      {/* Validation / Server Errors */}
      {(validationError || error) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-6 animate-in fade-in">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700 font-semibold">
            {validationError || error}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading || isProcessingReceipt}
          className="flex-1 py-3.5 rounded-xl border-2 border-neutral-200 font-bold text-neutral-600 hover:border-neutral-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          رجوع
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isProcessingReceipt}
          className="flex-[2] flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 cursor-pointer text-sm sm:text-base"
          style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              جاري إرسال الحجز...
            </>
          ) : isProcessingReceipt ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              جاري معالجة الإيصال...
            </>
          ) : (
            <>
              {selectedMethod !== 'cash' && receiptImage ? (
                <>
                  تأكيد وإرسال الحجز (الإيصال مرفق ✓)
                  <CheckCircle2 size={18} className="text-emerald-300" />
                </>
              ) : (
                <>
                  تأكيد وإرسال الحجز
                  <CheckCircle2 size={18} />
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
