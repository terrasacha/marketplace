export const event = ({ action, category, label, value }: any) => {
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
export const eventTransactionCrypto = ({ action, category, label, token, amount }: any) => {
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    event_token: token,
    event_amount: amount
  });
};
export const eventTransactionFIAT = ({ action, category, label, token, amount, currency, tax, customer_email, transaction_status, x_ref_payco }: any) => {
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    event_token: token,
    event_amount: amount,
    event_currency: currency,
    event_tax: tax,
    event_transaction_status: transaction_status,
    event_customer_email: customer_email,
    event_ref_epayco: x_ref_payco
  });
};
