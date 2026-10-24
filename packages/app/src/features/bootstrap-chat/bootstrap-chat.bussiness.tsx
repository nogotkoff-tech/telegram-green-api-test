import {
	CheckAccountRequestBodySchema,
	CheckAccountResponseSchema,
	type TCheckAccountRequestBody,
	type TCheckAccountResponse,
} from "@gata/shared";
import { Button } from "@gata/ui-kit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes/routes";
import { httpClient } from "@/shared/api";

export const BootstrapChat = () => {
	const { register, handleSubmit, setValue } =
		useForm<TCheckAccountRequestBody>({
			resolver: zodResolver(CheckAccountRequestBodySchema),
		});
	const navigate = useNavigate();

	const onSubmit = async (data: TCheckAccountRequestBody) => {
		const responseCheckAccount = await httpClient.post<TCheckAccountResponse>(
			"/checkAccount",
			data,
		);
		const candidateResponseCheckAccount = CheckAccountResponseSchema.safeParse(
			responseCheckAccount.data,
		);

		if (
			candidateResponseCheckAccount.success &&
			candidateResponseCheckAccount.data?.exist
		) {
			console.info(
				candidateResponseCheckAccount.data,
				`${ROUTES.CHAT}/${candidateResponseCheckAccount.data.chatId}`,
			);
			navigate(
				generatePath(ROUTES.CHAT, {
					chatId: candidateResponseCheckAccount.data.chatId,
				}),
			);
		} else if (
			candidateResponseCheckAccount.success &&
			candidateResponseCheckAccount.data &&
			!candidateResponseCheckAccount.data.exist
		) {
			// enable create chat feature
		} else {
			console.log(candidateResponseCheckAccount.error);
			// handle failured creating chat
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<label>
				Перейти в чат с пользователем по номеру:
				<input
					{...register("phoneNumber", {
						onBlur: (e) => {
							const value = e.currentTarget.value;
							setValue("phoneNumber", Number(value));
						},
					})}
					type="tel"
				></input>
				<Button type="submit">Создать контакт</Button>
			</label>
		</form>
	);
};
