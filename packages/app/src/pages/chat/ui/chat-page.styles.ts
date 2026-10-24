import { styled } from "styled-components";

export const Header = styled.header`
    display: flex;
    flex-flow: row nowrap;

    background-color: rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);

    padding: 20px 40px;
`;

export const UserBox = styled.figure`
    font-size: 20px;
    
    display: flex;
    flex-flow: row nowrap;
    gap: 12px;

    margin: 0px;
`;
export const UserInfoColumn = styled.figcaption`
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    gap: 4px;
`;
export const UserContactName = styled.h2`
    font-size: 1em;
    margin: 0;
    color: white;
`;
export const UserName = styled.h3`
    font-size: 0.8em;
    color: darkgray;
    margin: 0;
`;

export const Avatar = styled.img`
    width: 2.5em;
    height: 2.5em;

    border-radius: 50%;
    border: 2px solid white;
    object-fit: cover;
    object-position: center center;
`;

export const ChatWindow = styled.div`
    position: relative;
    width: 100%;
    flex: 1;
    
    display: flex;
    flex-flow: column nowrap;
`;

export const DarknessOverlay = styled.div`
    position: absolute;
    inset: 0;

    background-image: url('/public/assets/background-chat.jpg'), linear-gradient(to top, rgba(0,0,0,0.3));
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
`;

export const MessagesContainer = styled.section`
    display: flex;
    flex-flow: column nowrap;
    gap: 4px;
    
    flex: 1;
    padding: 20px;

    z-index: 1;
`;

export const MessageBox = styled.div`
    padding: 20px;
    max-width: 45%;
    width: fit-content;

    background-color: rgba(0,0,0,0.8);
    backdrop-filter: blur(2px);
    border-radius: 20px;
`;
