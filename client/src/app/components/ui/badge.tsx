import type {HTMLAttributes, ReactNode, CSSProperties} from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'default';
    children: ReactNode;
    style?: CSSProperties;
}

const variantStyles: Record<string, CSSProperties> = {
    primary: {
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
    },
    accent: {
        backgroundColor: 'var(--color-accent)',
        color: 'var(--color-accent-dark)',
    },
    success: {
        backgroundColor: 'var(--color-success)',
        color: '#166534',
    },
    warning: {
        backgroundColor: 'var(--color-warning)',
        color: '#92400e',
    },
    error: {
        backgroundColor: 'var(--color-error)',
        color: '#991b1b',
    },
    default: {
        backgroundColor: 'var(--color-border)',
        color: 'var(--color-text-secondary)',
    },
};

export function Badge({ variant = 'default', children, className, style, ...props }: BadgeProps) {
    return (
        <span
            className={className}
            style={{
                ...variantStyles[variant],
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                ...style,
            }}
            {...props}
        >
      {children}
    </span>
    );
}