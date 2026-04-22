import {
  createSocialImageResponse,
  SOCIAL_IMAGE_CONTENT_TYPE,
  SOCIAL_IMAGE_SIZE,
} from '@/lib/og/create-social-image';

export const alt = 'Social preview';
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = SOCIAL_IMAGE_CONTENT_TYPE;

const SOCIAL_IMAGE_TITLE = 'Home';

export default async function SocialImage() {
  return createSocialImageResponse({
    title: SOCIAL_IMAGE_TITLE,
  });
}
