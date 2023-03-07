import Button from "@mui/material/Button";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import styled from "styled-components";
import WhatsappLogo from "../assets/whatsapplogo.png";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";

const StyledContainer = styled.div`
  height: 100vh;
  display: grid;
  place-items: center;
  background-color: whitesmoke;
`;

const StyledLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
`;

const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`;

const Login = () => {
  const [signInWithGoogle, _user, _loading, _error] = useSignInWithGoogle(auth);

  const signWithGoogle = () => {
    signInWithGoogle();
  };

  return (
    <StyledContainer>
      <Head>
        <title>Login</title>
      </Head>
      <StyledLoginContainer>
        <StyledImageWrapper>
          <Image
            src={WhatsappLogo}
            alt="Whatsapp logo"
            height={200}
            width={200}
          />
        </StyledImageWrapper>
        <Button variant="outlined" onClick={signWithGoogle}>
          SIGN IN WITH GOOGLE
        </Button>
      </StyledLoginContainer>
    </StyledContainer>
  );
};

export default Login;
