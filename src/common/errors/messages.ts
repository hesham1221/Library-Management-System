import { LangEnum } from '@common/types/types';

export const errorMessages = {
  USER_NOT_FOUND: {
    EN: 'User not found',
    AR: 'لا يوجد مستخدم بهذا الاسم',
    code: 404,
  },
  NOT_FOUND: {
    EN: 'Not found',
    AR: 'غير موجود',
    code: 404,
  },
  BAD_REQUEST: {
    EN: 'Bad request',
    AR: 'طلب خاطئ',
    code: 400,
  },
  UNAUTHORIZED: {
    EN: 'Unauthorized',
    AR: 'غير مصرح',
    code: 401,
  },
  FORBIDDEN: {
    EN: 'Forbidden',
    AR: 'غير مسموح',
    code: 403,
  },
  NOT_ALLOWED: {
    EN: 'Not allowed',
    AR: 'غير مسموح',
    code: 405,
  },
  INVALID_CREDENTIALS: {
    EN: 'Invalid credentials',
    AR: 'بيانات الدخول غير صحيحة',
    code: 401,
  },
  INVALID_TOKEN: {
    EN: 'Invalid token',
    AR: 'التوكن غير صالح',
    code: 403,
  },
  TOO_MANY_REQUESTS: {
    EN: 'Too many requests from this IP',
    AR: 'تم تجاوز عدد الطلبات من هذا العنوان IP',
    code: 429,
  },
  UNVERIFIED_EMAIL: {
    EN: 'Email is not verified',
    AR: 'البريد الالكتروني غير مفعل',
    code: 400,
  },
  OLD_PASSWORD_REQUIRED: {
    EN: 'Old password required',
    AR: 'كلمة المرور القديمة مطلوبة',
    code: 400,
  },
  OLD_PASSWORD_DOES_NOT_MATCH: {
    EN: 'Old password does not match',
    AR: 'كلمة المرور القديمة غير متطابقة',
    code: 400,
  },
  PASSWORD_CANNOT_BE_SAME: {
    EN: 'Password cannot be same as old password',
    AR: 'كلمه المرور الجديدة لا يمكن ان تكون نفس كلمة المرور القديمة',
    code: 400,
  },
  USER_ALREADY_EXISTS: {
    EN: 'User already exists',
    AR: 'المستخدم موجود مسبقا',
    code: 409,
  },
  USER_WITH_SAME_EMAIL_ALREADY_EXISTS: {
    EN: 'User with same email already exists',
    AR: 'مستخدم مع هذا البريد الالكتروني موجود مسبقا',
    code: 410,
  },
  INVALID_VERIFICATION_CODE: {
    EN: 'Invalid verification code',
    AR: 'كود التحقق غير صالح',
    code: 400,
  },
  DEFAULT: {
    EN: 'Something went wrong',
    AR: 'حدث خطأ ما',
    code: 500,
  },
} as const;

export type TMessageText =
  (typeof errorMessages)[keyof typeof errorMessages][LangEnum];
export type TMessage = (typeof errorMessages)[keyof typeof errorMessages];
