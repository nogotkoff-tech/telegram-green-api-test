import {
	IncomingTextMessageNotificationsFormatSchema,
	ReceiveNotificationAPIResponseSchema,
	type TGetContactResponseInfo,
} from "@gata/shared";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useLoaderData, useNavigation } from "react-router-dom";
import { appInstanceStore } from "@/app/store";
import { httpClient } from "@/shared/api";
import { messagesStore } from "../store";
import {
	Avatar,
	ChatWindow,
	DarknessOverlay,
	Header,
	MessageBox,
	MessagesContainer,
	UserBox,
	UserContactName,
	UserInfoColumn,
	UserName,
} from "./chat-page.styles";

export const ChatPage = () => {
	const isMounted = useRef(false);
	const navigation = useNavigation();
	const loaderData = useLoaderData<TGetContactResponseInfo>();
	const appInstanceState = useSyncExternalStore(
		appInstanceStore.subscribe,
		appInstanceStore.getState,
	);
	const messagesState = useSyncExternalStore(
		messagesStore.subscribe,
		messagesStore.getState,
	);

	const eventSource = useRef<EventSource>(null);

	const deleteNotification = useCallback(async (receiptId: number) => {
		httpClient.delete("/deleteNotification", {
			transformRequest: (req) => (req.url += `/${receiptId}`),
		});
	}, []);

	const bootstrapSSEConnection = useCallback(() => {
		if (eventSource.current) {
			eventSource.current.onmessage = (event) => {
				const responseIncomingTextMessageNotification =
					ReceiveNotificationAPIResponseSchema.safeParse(
						JSON.parse(event.data),
					);

				if (
					responseIncomingTextMessageNotification.success &&
					responseIncomingTextMessageNotification.data
				) {
					const notification =
						responseIncomingTextMessageNotification.data.body;
					messagesState.addMessage({
						idMessage: notification.idMessage,
						messageData: notification.messageData,
						senderData: notification.senderData,
						timestamp: notification.timestamp,
					});
					deleteNotification(
						responseIncomingTextMessageNotification.data.receiptId,
					);
				}
			};

			eventSource.current.onerror = (error) => {
				console.error("Ошибка SSE соединения:", error);
			};
		}
	}, [messagesState.addMessage, deleteNotification]);

	useEffect(() => {
		if (eventSource.current) {
			bootstrapSSEConnection();
		}
	}, [bootstrapSSEConnection]);

	useEffect(() => {
		if (loaderData.chatId && !isMounted.current) {
			eventSource.current = new EventSource(
				`${import.meta.env.VITE_API_PROXY_WEBHOOKS_URL}/events?idInstance=${appInstanceState.idInstance}`,
			);
			isMounted.current = true;
		}
	}, [loaderData.chatId, appInstanceState.idInstance]);

	return (
		<ChatWindow key={loaderData.chatId}>
			<DarknessOverlay />
			<Header>
				{navigation.location ? (
					"loading..."
				) : (
					<UserBox>
						<Avatar src={loaderData.avatar || ""}></Avatar>
						<UserInfoColumn>
							<UserContactName>{loaderData.contactName}</UserContactName>
							<UserName>{loaderData.username}</UserName>
							<UserName>{loaderData.description}</UserName>
						</UserInfoColumn>
					</UserBox>
				)}
			</Header>
			<MessagesContainer>
				{messagesState.messages.map((message) => (
					<MessageBox key={message.idMessage}>
						<UserBox>
							<UserInfoColumn>
								<UserContactName>{loaderData.contactName}</UserContactName>
								<UserName>
									{message.messageData.textMessageData.textMessage}
								</UserName>
							</UserInfoColumn>
						</UserBox>
					</MessageBox>
				))}
			</MessagesContainer>
		</ChatWindow>
	);
};
