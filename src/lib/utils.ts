

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'moisesinc', // Reemplaza con tu cloud name de Cloudinary
  },
});
export { cld }

export default function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


