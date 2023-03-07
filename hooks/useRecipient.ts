import { getRecipientEmail } from "./../utils/getRecipientEmail";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase";
import { AppUser, Conversation } from "../types";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

export const useRecipient = (conversationUsers: Conversation["users"]) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  // get recipient email
  const recipientEmail = getRecipientEmail(conversationUsers, loggedInUser);

  // get recipient avatar
  const queryGetRecippient = query(
    collection(db, "users"),
    where("email", "==", recipientEmail)
  );

  const [recipientSnapshot, __loadng, __error] =
    useCollection(queryGetRecippient);

  // recipient snapshot could be an empty array, leading to docs[0] being undefined
  // so we had to force "?" after docs[0] because there is no data on "undefined"
  const recipient = recipientSnapshot?.docs[0]?.data() as AppUser | undefined;

  return { recipient, recipientEmail };
};
