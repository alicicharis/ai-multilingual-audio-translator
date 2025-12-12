import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function unwrap<T>(res: { data: T; error: any }) {
  if (res.error) {
    const err = new Error(res.error.message);
    (err as any).details = res.error;
    throw err;
  }

  return res.data;
}
