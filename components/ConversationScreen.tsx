import { IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import styled from "styled-components";
import { useRecipient } from "../hooks/useRecipient";
import { Conversation, IMessage } from "../types";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  converFirestoreTimestampToString,
  generateQueryGetMessage,
  transformMessage,
} from "../utils/getMessagesInConversation";
import RecipientAvatar from "./RecipientAvatar";
import Message from "./Message";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const StyledRicipientHeader = styled.div`
  position: sticky;
  background-color: #fff;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid gray;
`;

const StyledHeaderInfo = styled.div`
  flex-grow: 1;
  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }
  > span {
    font-size: 14px;
  }
`;

const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledHeaderIcon = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 100;
`;

const StyledInput = styled.input`
  font-size: 16px;
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin-left: 15px;
  margin-right: 15px;
`;

const StyledEndOfMessageForAutoScroll = styled.div``;

const ConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: IMessage[];
}) => {
  useEffect(() => {
    scrollToBottom();
  }, []);

  const [newMessage, setNewMessage] = useState("");

  const endOfMessageRef = useRef<HTMLDivElement>(null);

  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const conversationUsers = conversation.users;

  const { recipient, recipientEmail } = useRecipient(conversationUsers);

  const router = useRouter();

  const conversationId = router?.query?.id;

  const queryGetMessages = generateQueryGetMessage(conversationId as string);
  const [messagesSnapshot, messagesLoading, __error] =
    useCollection(queryGetMessages);

  const showMessages = useMemo(() => {
    if (messagesLoading) {
      return messages.map((message) => (
        <Message key={message.id} message={message} />
      ));
    }

    if (messagesSnapshot)
      return messagesSnapshot.docs.map((message) => (
        <Message key={message.id} message={transformMessage(message)} />
      ));

    return null;
  }, [messages, messagesLoading, messagesSnapshot]);

  const addMessageOnDbAndUpdateLastSeen = async () => {
    // update last seen in user collection

    await setDoc(
      doc(db, "users", loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true } // just update what is changed
    );

    // add mew message in "messages" collection

    await addDoc(collection(db, "messages"), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email,
    });

    setNewMessage("");
    // scroll to bottom
    scrollToBottom();
  };

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!newMessage) return;
      addMessageOnDbAndUpdateLastSeen();
    }
  };

  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (!newMessage) return;
    addMessageOnDbAndUpdateLastSeen();
  };

  const scrollToBottom = () => {
    endOfMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <StyledRicipientHeader>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />
        <StyledHeaderInfo>
          <StyledH3>{recipientEmail}</StyledH3>
          {recipient && (
            <span>
              Last active:{" "}
              {converFirestoreTimestampToString(recipient.lastSeen)}
            </span>
          )}
        </StyledHeaderInfo>
        <StyledHeaderIcon>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </StyledHeaderIcon>
      </StyledRicipientHeader>
      <StyledMessageContainer>{showMessages}</StyledMessageContainer>

      <StyledEndOfMessageForAutoScroll ref={endOfMessageRef} />

      {/* Enter new message */}
      <StyledInputContainer>
        <IconButton>
          <InsertEmoticonIcon />
        </IconButton>

        <StyledInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={sendMessageOnEnter}
        />

        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
          <SendIcon />
        </IconButton>
        <IconButton>
          <MicIcon />
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default ConversationScreen;
