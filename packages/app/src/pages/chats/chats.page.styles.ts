import { styled } from "styled-components";

export const Box = styled.div`
    display: flex;
    flex-flow: row nowrap;
`;

export const Sidebar = styled.aside`
    padding: 35px;

    height: 100dvh;
    overflow-y: auto;

    background-color: darkviolet;
    color: white;

`;
export const ChatWindow = styled.section`
    flex: 50%;
`;

export const ChatList = styled.ul`
    list-style: none;
    padding: 0;
`;

export const ChatListItem = styled.li`
    font-size: 20px;

    margin: 0 -35px;
    padding: 20px;

    border-bottom: 2px solid purple;
    background-color: pink;
    
    a {
        color: black;
        text-decoration: none;
    }
`;
