'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();
  const [hasUnresolvedAuth, setHasUnresolvedAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          router.push('/home');
        } else {
          router.push('/landing');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push('/landing');
      } finally {
        setHasUnresolvedAuth(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );
}