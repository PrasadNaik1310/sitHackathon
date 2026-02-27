'use client';
import {useState} from 'react';
import { useRouter } from 'next/navigation';
import { userLogin, userSignUp } from '@/lib/api';
import type { SubmitEvent } from 'react';

export default function LoginPage(){
    const router = useRouter();
    const [loginMode, setLoginMode] = useState<"signin"|"signup">("signin");
    const [userLogin, setUserLogi] = useState({
        phoneNo:"",
        emailId:"",
    })
    const [otp, setOtp] = useState("");
    const[isloading, setIsLoading] = useState(false);
    const[error, setError] = useState("");

  const handlePatientLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

      // Backend confirmation waiting
      if (loginMode === "signin") {
        if (!userLogin.phoneNo) {
          setError("Please enter your Mobile Number.");
          return;
          
        }
      }     setIsLoading(true);
      try {
        const res = await fetch('/api/auth/check-number', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: userData.phoneNo, loginMode: 'signin' }),
        });
        const data = await res.json();
        if (data.exists) {
          // Proceed to OTP verification
          //setLoginMode("otp");
        } else {
          setError("Mobile Number not registered. Please sign up.");
        }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }


}