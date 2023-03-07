import Avatar from "@mui/material/Avatar";
import styled from "styled-components";
import { useRecipient } from "../hooks/useRecipient";

type RecipientAvatarProps = ReturnType<typeof useRecipient>;

const StyledAvatar = styled(Avatar)`
  margin: 5px 10px 5px 5px;
`;

const RecipientAvatar = ({
  recipient,
  recipientEmail,
}: RecipientAvatarProps) => {
  return recipient?.photoURL ? (
    <StyledAvatar
      imgProps={{ referrerPolicy: "no-referrer" }}
      src={recipient?.photoURL}
    />
  ) : (
    <StyledAvatar>
      {recipientEmail && recipientEmail[0].toUpperCase()}
    </StyledAvatar>
  );
};

export default RecipientAvatar;
