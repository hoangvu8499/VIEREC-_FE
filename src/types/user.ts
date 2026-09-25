/**
 * Payload đăng ký gửi lên backend (snake_case theo cột DB).
 * Gửi mật khẩu thô qua HTTPS — backend tự hash thành `password_hash`, FE không hash.
 */
export interface RegisterPayload {
  username: string
  password: string
  first_name: string
  last_name: string
  cccd: string
  /** `YYYY-MM-DD` */
  date_of_birth: string
  address: string
  phone_number: string
  email: string
}

export interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}
