import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import MoreVerticalIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, IconButton, Link, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, db } from "../config/firebase";
import * as EmailValidator from "email-validator";
import { useCollection } from "react-firebase-hooks/firestore";
import { addDoc, collection, query, where } from "firebase/firestore";
import { Conversation } from "../types";
import ConversationSelect from "./ConversationSelect";

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  border-right: 1px solid whitesmoke;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and F irefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledSearch = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-radius: 25px;
`;

const StyledSidebarButton = styled(Button)`
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`;

const StyledSearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
`;

const StyledUserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const StyledContainerInner = styled.div`
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 1;
`;

const Sidebar = () => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const [isOpenNewConverSationDialog, setIsOpenNewConverSationDialog] =
    useState(false);

  const [recipientEmail, setRecipientEmail] = useState("");

  const toggleNewConversationDialog = (isOpen: boolean) => {
    setIsOpenNewConverSationDialog(isOpen);
    if (!isOpen) {
      setRecipientEmail("");
    }
  };

  const isInvitingSelf = recipientEmail === loggedInUser?.email;

  //   check if conversation already exists between the current user and recipient
  const queryGetConversationsForCurrentUser = query(
    collection(db, "conversations"),
    where("users", "array-contains", loggedInUser?.email)
  );
  const [conversationsSnapshot, __loading, __error] = useCollection(
    queryGetConversationsForCurrentUser
  );

  const isConversationAlreadyExists = (recipientEmail: string) => {
    return conversationsSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(recipientEmail)
    );
  };

  const createConversation = async () => {
    if (!recipientEmail) return;

    if (
      EmailValidator.validate(recipientEmail) &&
      !isInvitingSelf &&
      !isConversationAlreadyExists(recipientEmail)
    ) {
      // add conversation user to db "conversations" collection
      // A conversation is between the current logged user and the user invited

      await addDoc(collection(db, "conversations"), {
        users: [loggedInUser?.email, recipientEmail],
      });
    }
    toggleNewConversationDialog(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("ERROR", error);
    }
  };

  return (
    <StyledContainer>
      <StyledContainerInner>
        <StyledHeader>
          <Tooltip title={loggedInUser?.email} placement="right">
            <StyledUserAvatar
              imgProps={{ referrerPolicy: "no-referrer" }}
              src={loggedInUser?.photoURL || ""}></StyledUserAvatar>
          </Tooltip>
          <div>
            <IconButton>
              <ChatIcon />
            </IconButton>
            <IconButton>
              <MoreVerticalIcon />
            </IconButton>
            <IconButton onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </div>
        </StyledHeader>
        <StyledSearch>
          <SearchIcon />
          <StyledSearchInput placeholder="Search in conversations" />
        </StyledSearch>
        <StyledSidebarButton onClick={() => toggleNewConversationDialog(true)}>
          START A NEW CONVERSATION
        </StyledSidebarButton>
      </StyledContainerInner>

      {/* Dialog */}
      <Dialog
        open={isOpenNewConverSationDialog}
        onClose={() => toggleNewConversationDialog(false)}>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a Google email address for the user you with to chat
            with <Link href="#">{loggedInUser?.email}</Link>
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleNewConversationDialog(false)}>
            Cancel
          </Button>
          <Button
            disabled={!recipientEmail}
            onClick={() => createConversation()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* List of conversations */}
      <div>
        {conversationsSnapshot?.docs.map((conversation) => (
          <ConversationSelect
            key={conversation.id}
            id={conversation.id}
            conversationUser={(conversation.data() as Conversation).users}
          />
        ))}
      </div>
    </StyledContainer>
  );
};

export default Sidebar;
