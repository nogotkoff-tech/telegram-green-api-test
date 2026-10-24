import { type Credentials, CredentialsSchema } from "@gata/shared";
import { Button } from "@gata/ui-kit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes/routes";

export const LoginPage = () => {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Credentials>({
		resolver: zodResolver(CredentialsSchema),
	});

	const onSubmit = (data: Credentials) => {
		localStorage.setItem("credentials", JSON.stringify(data));
		navigate(ROUTES.CHATS);
	};

	return (
		<div data-testid="login-page">
			<h1>Login</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input
					{...register("idInstance")}
					name="idInstance"
					type="text"
					placeholder="Введите idInstance green-api"
				></input>
				{errors.idInstance?.message}
				<input
					{...register("apiTokenInstance")}
					name="apiTokenInstance"
					type="text"
					maxLength={50}
					placeholder="Введите apiTokenInstance green-api"
				></input>
				{errors.apiTokenInstance?.message}
				<Button type="submit">Войти</Button>
			</form>
		</div>
	);
};
