export const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, phone: u.phone, avatar_url: u.avatar_url, locale: u.locale, role: u.role, ...(u.role === 'admin' && u.admin_id ? { admin_id: u.admin_id } : {}), totp_enabled: !!u.totp_enabled, ...(u.auth_method ? { auth_method: u.auth_method } : {})
});
