import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// Next-Themes removed since ComiTe uses custom theme context. We enforce dark mode visually.
export const AuthForm: React.FC = () => {
  return (
    <div className="bg-zinc-950 py-20 text-zinc-200 selection:bg-zinc-600">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 mx-auto w-full max-w-xl p-4"
      >
        <Logo />
        <Header />
        <SocialButtons />
        <Divider />
        <LoginForm />
        <TermsAndConditions />
      </motion.div>
      <BackgroundDecoration />
    </div>
  )
}

export const BackButton: React.FC = () => (
  <SocialButton icon={<ChevronLeft size={16} />}>Go back</SocialButton>
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    className={`rounded-md bg-gradient-to-br from-manga-accent to-manga-accent-hover px-4 py-2 text-lg text-zinc-50 
    ring-2 ring-manga-accent/50 ring-offset-2 ring-offset-zinc-950 
    transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-manga-accent/70 ${className}`}
    {...props}
  >
    {children}
  </button>
)

export const Logo: React.FC = () => (
  <div className="mb-6 flex justify-center">
    <span className="text-[1.5rem] font-semibold tracking-[-0.03em] text-manga-text">
      <span style={{ fontFamily: "'CaskaydiaMono NF', monospace" }}>Comi</span>
      <span style={{ fontFamily: "'Hurmit NF', monospace" }}>Te</span>
    </span>
  </div>
)

export const Header: React.FC = () => (
  <div className="mb-6 text-center">
    <h1 className="text-2xl font-semibold">Sign in to your account</h1>
    <p className="mt-2 text-zinc-400">
      Don't have an account?{" "}
      <a href="/signup" className="text-manga-accent hover:underline">
        Create one.
      </a>
    </p>
  </div>
)

export const SocialButtons: React.FC = () => (
  <div className="mb-6 space-y-3">
    <div className="grid grid-cols-1 gap-3">
      <SocialButton fullWidth icon={<GoogleIcon />}>Sign in with Google</SocialButton>
    </div>
  </div>
)

export const SocialButton: React.FC<{
  icon?: React.ReactNode
  fullWidth?: boolean
  children?: React.ReactNode
  onClick?: () => void
}> = ({ icon, fullWidth, children, onClick }) => (
  <button
    onClick={onClick}
    type="button"
    className={`group relative flex items-center justify-center overflow-hidden rounded-md 
    border border-zinc-700 bg-zinc-800 
    px-4 py-2 font-semibold text-zinc-200 transition-all duration-500
    hover:scale-105 hover:text-zinc-900 active:scale-95
    ${fullWidth ? "col-span-2" : ""}`}
  >
    <div className="absolute inset-0 z-0 bg-zinc-200 translate-x-[250%] translate-y-[250%] scale-[2.5] rounded-full transition-transform duration-1000 group-hover:translate-x-0 group-hover:translate-y-0" />
    <div className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
      {icon}
      <span>{children}</span>
    </div>
  </button>
)

export const Divider: React.FC = () => (
  <div className="my-6 flex items-center gap-3">
    <div className="h-[1px] w-full bg-zinc-700" />
    <span className="text-zinc-400">OR</span>
    <div className="h-[1px] w-full bg-zinc-700" />
  </div>
)

const LoginForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => e.preventDefault()

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label
          htmlFor="email-input"
          className="mb-1.5 block text-zinc-400"
        >
          Email
        </label>
        <input
          id="email-input"
          type="email"
          placeholder="your.email@provider.com"
          className="w-full rounded-md border border-zinc-700 
          bg-zinc-900 px-3 py-2 text-zinc-200
          placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-manga-accent"
        />
      </div>
      <div className="mb-6">
        <div className="mb-1.5 flex items-end justify-between">
          <label
            htmlFor="password-input"
            className="block text-zinc-400"
          >
            Password
          </label>
          <a href="#" className="text-sm text-manga-accent">
            Forgot?
          </a>
        </div>
        <input
          id="password-input"
          type="password"
          placeholder="••••••••••••"
          className="w-full rounded-md border border-zinc-700 
          bg-zinc-900 px-3 py-2 text-zinc-200
          placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-manga-accent"
        />
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  )
}

export const TermsAndConditions: React.FC = () => (
  <p className="mt-9 text-center text-xs text-zinc-400">
    By signing in, you agree to our{" "}
    <a href="#" className="text-manga-accent">
      Terms & Conditions
    </a>{" "}
    and{" "}
    <a href="#" className="text-manga-accent">
      Privacy Policy.
    </a>
  </p>
)

export const BackgroundDecoration: React.FC = () => {
  const isDarkTheme = true; // Hardcoded for ComiTe aesthetic

  return (
    <div
      className="fixed right-0 top-0 z-0 size-[50vw] pointer-events-none opacity-20"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(249 115 22 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDarkTheme
            ? "radial-gradient(100% 100% at 100% 0%, rgba(9,9,11,0), rgba(20,20,20,1))"
            : "radial-gradient(100% 100% at 100% 0%, rgba(255,255,255,0), rgba(255,255,255,1))",
        }}
      />
    </div>
  )
}

export default AuthForm
