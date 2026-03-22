import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AssistedPasswordConfirmation({
  password,
  confirmPassword,
  onChange,
}: {
  password: string;
  confirmPassword: string;
  onChange: (value: string) => void;
}) {
  const [shake, setShake] = useState(false);

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (
      confirmPassword.length >= password.length &&
      e.target.value.length > confirmPassword.length
    ) {
      setShake(true);
    } else {
      onChange(e.target.value);
    }
  };

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isError = confirmPassword.length > 0 && !password.startsWith(confirmPassword);

  const bounceAnimation = {
    x: shake ? [-5, 5, -5, 5, 0] : 0,
    transition: { duration: 0.4 },
  };

  const borderAnimation = {
    borderColor: passwordsMatch
      ? '#10B981' // emerald-500
      : isError 
        ? '#EF4444' // red-500
        : '#3f3f46', // zinc-700
    transition: { duration: 0.3 },
  };

  return (
    <div className="relative w-full">
      <motion.div animate={bounceAnimation}>
        <motion.input
          className="w-full rounded-md border bg-zinc-900 px-3 py-2 pr-10 text-zinc-200 placeholder-zinc-500 ring-1 ring-transparent focus:outline-0 focus:ring-manga-accent transition-colors"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          animate={borderAnimation}
        />
        {/* Helper visual feedback text inside input right side */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
           {passwordsMatch && (
             <motion.svg initial={{scale:0}} animate={{scale:1}} className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </motion.svg>
           )}
           {isError && (
              <motion.svg initial={{scale:0}} animate={{scale:1}} className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
           )}
        </div>
      </motion.div>
    </div>
  );
}
