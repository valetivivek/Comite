import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';

type DestructiveTextButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: ReactNode;
};

const DestructiveTextButton = ({
  className,
  children,
  type = 'button',
  ...props
}: DestructiveTextButtonProps) => {
  const normalizedChildren = Children.toArray(children).filter((child, index) => {
    if (
      index === 0 &&
      isValidElement(child) &&
      child.type === 'span' &&
      typeof child.props.className === 'string' &&
      child.props.className.includes('mr-3 text-lg')
    ) {
      return false;
    }

    return true;
  });

  return (
    <motion.button
      type={type}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={clsx(
        'group relative inline-flex items-center text-sm font-medium text-manga-muted transition-colors duration-300 hover:text-manga-danger',
        className
      )}
      variants={{
        tap: {
          scale: 0.98,
          transition: { duration: 0.1 },
        },
      }}
      {...props}
    >
      <span className="relative inline-flex flex-col items-start gap-1">
        <motion.span
          className="relative z-10"
          variants={{
            rest: {
              x: 0,
              letterSpacing: '0em',
            },
            hover: {
              x: [0, -1.25, 1.25, -1.25, 0],
              letterSpacing: '0.02em',
              transition: {
                x: {
                  duration: 0.15,
                  repeat: 2,
                  repeatType: 'mirror',
                  ease: 'linear',
                },
                letterSpacing: {
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                },
              },
            },
          }}
        >
          {normalizedChildren}
        </motion.span>
        <span className="relative h-px w-full overflow-hidden rounded-full bg-manga-border">
          <motion.span
            className="absolute inset-y-0 left-1/2 bg-manga-danger"
            variants={{
              rest: {
                width: '0%',
                left: '50%',
                opacity: 0.7,
              },
              hover: {
                width: '100%',
                left: '0%',
                opacity: 1,
                transition: {
                  duration: 0.35,
                  ease: [0.23, 1, 0.32, 1],
                },
              },
            }}
          />
        </span>
      </span>
    </motion.button>
  );
};

export default DestructiveTextButton;
