// In-app notifications (the bell in the header). Best-effort: a failure here must never break the order flow.
export async function notify(db, userId, n) {
  if (!userId) return;
  try {
    await db.query(
      'INSERT INTO user_notifications(user_id,kind,title_ar,title_en,body_ar,body_en,link) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [userId, n.kind || 'info', n.title_ar, n.title_en || n.title_ar, n.body_ar || '', n.body_en || n.body_ar || '', n.link || '']
    );
  } catch (e) {
    console.warn('notify failed:', e.message);
  }
}

export const STATUS_TEXT = {
  confirmed: ['تم تأكيد طلبك', 'Your order is confirmed'],
  processing: ['جاري تجهيز طلبك', 'Your order is being prepared'],
  shipped: ['طلبك في الطريق إليك', 'Your order is on its way'],
  delivered: ['تم تسليم طلبك', 'Your order was delivered'],
  cancelled: ['تم إلغاء طلبك', 'Your order was cancelled']
};
