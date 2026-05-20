import type {HTMLAttributes, ReactNode, CSSProperties} from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  style?: CSSProperties;
}

export function Card({ children, hover, className, style, ...props }: CardProps) {
  return (
      <div
          className={className}
          style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 2px 12px rgba(244,114,182,0.08)',
            border: '1px solid var(--color-border)',
            transition: hover ? 'transform 0.2s, box-shadow 0.2s' : undefined,
            ...style,
          }}
          onMouseEnter={hover ? e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(244,114,182,0.18)';
          } : undefined}
          onMouseLeave={hover ? e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(244,114,182,0.08)';
          } : undefined}
          {...props}
      >
        {children}
      </div>
  );
}