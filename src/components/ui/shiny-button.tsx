import type React from 'react'
import './shiny-button.css'

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function ShinyButton({ children, onClick, className = '', href, target, rel, type = 'button', disabled }: ShinyButtonProps) {
  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={`shiny-cta ${className}`}>
        <span>{children}</span>
      </a>
    )
  }
  return (
    <button className={`shiny-cta ${className}`} onClick={onClick} type={type} disabled={disabled}>
      <span>{children}</span>
    </button>
  )
}
