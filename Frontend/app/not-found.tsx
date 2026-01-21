import { NotFoundContent } from '@/components/custom/not-found-content';

export const metadata = {
    title: '404 - Page Not Found | MoodMate',
    description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
    return <NotFoundContent />;
}
