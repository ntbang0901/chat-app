import { doc, getDoc, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import ConversationScreen from "../../components/ConversationScreen";
import Sidebar from "../../components/Sidebar";
import { auth, db } from "../../config/firebase";
import { Conversation, IMessage } from "../../types";
import {
  generateQueryGetMessage,
  transformMessage,
} from "../../utils/getMessagesInConversation";
import { getRecipientEmail } from "../../utils/getRecipientEmail";

interface Props {
  conversation: Conversation;
  messages: IMessage[];
}

const StyledContainer = styled.div`
  display: flex;
`;

const StyledConversationContainer = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
  height: 100vh;
  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and F irefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const Conversation = ({ conversation, messages }: Props) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  return (
    <StyledContainer>
      <Head>
        <title>
          Conversation with{" "}
          {getRecipientEmail(conversation.users, loggedInUser)}
        </title>
      </Head>
      <Sidebar />

      <StyledConversationContainer>
        <ConversationScreen conversation={conversation} messages={messages} />
      </StyledConversationContainer>
    </StyledContainer>
  );
};

export default Conversation;

export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async (context) => {
  const conversationId = context.params?.id;

  // conversation, to know who we are chatting with
  const conversationRef = doc(db, "conversations", conversationId as string);
  const conversationSnapshot = await getDoc(conversationRef);

  // get messages between logged in user and recipient in this conversation

  const messagesRef = generateQueryGetMessage(conversationId);
  const messagesSnapshot = await getDocs(messagesRef);

  const messages = messagesSnapshot.docs.map((message) =>
    transformMessage(message)
  );

  return {
    props: {
      conversation: conversationSnapshot.data() as Conversation,
      messages,
    },
  };
};
