export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button type={type} data-variant={variant} {...props}>
      {children}
    </button>
  );
};
