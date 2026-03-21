import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

interface PasswordConfirmationPreviewProps {
  password: string;
  confirmPassword: string;
}

const PasswordConfirmationPreview = ({
  password,
  confirmPassword,
}: PasswordConfirmationPreviewProps) => {
  const [shake, setShake] = useState(false);

  const status = useMemo(() => {
    if (!password.length || !confirmPassword.length) return 'idle';
    if (password === confirmPassword) return 'match';
    return 'mismatch';
  }, [password, confirmPassword]);

  useEffect(() => {
    if (confirmPassword.length <= password.length) return;
    setShake(true);
  }, [confirmPassword.length, password.length]);

  useEffect(() => {
    if (!shake) return;
    const timer = window.setTimeout(() => setShake(false), 450);
    return () => window.clearTimeout(timer);
  }, [shake]);

  if (!password.length) {
    return null;
  }

  const slots = password.split('');
  const matchedCharacters = slots.filter((char, index) => confirmPassword[index] === char).length;
  const helperText =
    status === 'match'
      ? 'Passwords match.'
      : confirmPassword.length
      ? `${matchedCharacters} of ${password.length} characters align.`
      : 'Confirm the password to verify each character.';

  return (
    <motion.div
      animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.38 }}
      className="mt-3 rounded-[20px] border border-manga-border bg-manga-surface/75 p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-manga-muted">
          Confirmation Check
        </p>
        <div
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            status === 'match'
              ? 'theme-chip theme-chip-success'
              : status === 'mismatch'
              ? 'theme-chip theme-chip-danger'
              : 'theme-chip theme-chip-neutral'
          )}
        >
          {status === 'match' ? (
            <CheckCircleIcon className="h-3.5 w-3.5" />
          ) : status === 'mismatch' ? (
            <ExclamationCircleIcon className="h-3.5 w-3.5" />
          ) : null}
          <span>
            {status === 'match' ? 'Matched' : status === 'mismatch' ? 'Checking' : 'Waiting'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {slots.map((char, index) => {
          const current = confirmPassword[index];
          const isMatch = current === char;

          return (
            <motion.span
              key={`${char}-${index}`}
              initial={{ opacity: 0.75, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.015 }}
              className={clsx(
                'theme-chip h-10 w-6 justify-center rounded-xl border text-[0.62rem]',
                !current
                  ? 'theme-chip-neutral'
                  : isMatch
                  ? 'theme-chip-success'
                  : 'theme-chip-danger'
              )}
              aria-hidden="true"
            >
              <span className="text-base leading-none">
                {current ? '•' : ''}
              </span>
            </motion.span>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-manga-muted">
        {helperText}
      </p>
    </motion.div>
  );
};

export default PasswordConfirmationPreview;
