import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth } from "../config/firebase";
import { IMessage } from "../types";

const StyledMessage = styled.p`
  width: fit-content;
  min-width: 30%;
  max-width: 90%;
  padding: 15px 15px 30px;
  border-radius: 8px;
  margin: 10px;
  position: relative;
`;

const StyledSentMessage = styled(StyledMessage)`
  margin-left: auto;
  background-color: #dcf8c6;
`;

const StyledReceiverMessage = styled(StyledMessage)`
  background-color: whitesmoke;
`;

const StyledTimeStamp = styled.span`
  color: gray;
  padding: 10px;
  font-size: x-small;
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
`;

const Message = ({ message }: { message: IMessage }) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const MessageType =
    loggedInUser?.email === message.user
      ? StyledSentMessage
      : StyledReceiverMessage;

  return (
    <MessageType>
      {message.text}
      <StyledTimeStamp>{message.sent_at}</StyledTimeStamp>
    </MessageType>
  );
};

export default Message;
