"use client"

import Auth from '@/components/auth/Auth'
import VerifyOTP from '@/components/auth/VerifyOtp'
import { useState } from 'react'

const SignUp = () => {
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  const handleSuccessfulSignup = (userId: string) => {
    setTempUserId(userId);
    setShowOtpBox(true);
  };

  return (
    <div>
      {showOtpBox ? (
        <VerifyOTP tempUserId={tempUserId} />
      ) : (
        <Auth onSuccessfulSignup={handleSuccessfulSignup} />
      )}
    </div>
  );
}

export default SignUp