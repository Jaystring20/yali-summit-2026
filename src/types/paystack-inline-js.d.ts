declare module "@paystack/inline-js" {
  export interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: { reference: string; status: string; trans: string; transaction: string }) => void;
    onCancel?: () => void;
    onClose?: () => void;
  }
  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void;
    resumeTransaction(accessCode: string): void;
  }
}