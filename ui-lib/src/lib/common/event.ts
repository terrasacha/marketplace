export const event = ({ action, category, label, value }: any) => {
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
export const eventTransaction = ({ action, category, label, token, amount }: any) => {
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    event_token: token,
    event_amount: amount
  });
};
