import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building2, CheckCircle2 } from 'lucide-react';
import type { PendingCheckout, TransactionRecord } from '../types';

interface PaymentGatewayModalProps {
  checkout: PendingCheckout | null;
  onClose: () => void;
  onConfirmPayment: (method: 'Card' | 'UPI' | 'NetBanking') => Promise<TransactionRecord | null>;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  checkout,
  onClose,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<'Card' | 'UPI' | 'NetBanking'>('Card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8814');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [upiId, setUpiId] = useState('aarav.mehta@okaxis');
  const [bankName, setBankName] = useState('HDFC Institutional Banking');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<TransactionRecord | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  if (!checkout) return null;

  const platformFee = Math.max(2, Math.round(checkout.amountUsd * 0.03));
  const totalAmount = checkout.amountUsd + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrMsg(null);
    try {
      const tx = await onConfirmPayment(method);
      if (tx) {
        setReceipt(tx);
      } else {
        setErrMsg('Transaction could not be finalized. Please verify slot availability.');
      }
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Payment error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="font-display text-lg font-semibold text-slate-900">
              TossMore Pay Secure Checkout
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setReceipt(null);
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close payment modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {receipt ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-emerald-950">Payment Verified & Confirmed</div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Reference <span className="font-mono font-semibold">{receipt.referenceCode}</span> · {receipt.date}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-600">Item</span>
                <span className="font-medium text-slate-900 text-right max-w-[260px]">{receipt.description}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-medium text-slate-900">{receipt.method}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-600">Total Paid</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  ${receipt.amountUsd}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setReceipt(null);
                onClose();
              }}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
              <div className="font-semibold text-slate-900">{checkout.description}</div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${checkout.amountUsd}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Escrow & Verification Fee</span>
                <span className="font-mono tabular-nums">${platformFee}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                <span>Total Due</span>
                <span className="font-mono tabular-nums">${totalAmount}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-600 mb-2">Select Payment Method</div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'Card', label: 'Card', icon: CreditCard },
                    { id: 'UPI', label: 'UPI / Instant', icon: Smartphone },
                    { id: 'NetBanking', label: 'NetBanking', icon: Building2 },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {method === 'Card' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {method === 'UPI' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Verified UPI ID</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            )}

            {method === 'NetBanking' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bank Institution</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  <option>HDFC Institutional Banking</option>
                  <option>ICICI Corporate & Retail</option>
                  <option>State Bank Sports Account</option>
                  <option>HSBC Global Athletics</option>
                </select>
              </div>
            )}

            {errMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {errMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
              >
                {processing ? 'Processing...' : `Pay $${totalAmount} Securely`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
