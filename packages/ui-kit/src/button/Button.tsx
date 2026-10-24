import { StyledButton } from "./button.styles";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost";
}

export const Button = ({
	children,
	variant = "primary",
	type = "button",
	...props
}: ButtonProps) => {
	return (
		<StyledButton type={type} data-variant={variant} {...props}>
			{children}
		</StyledButton>
	);
};
