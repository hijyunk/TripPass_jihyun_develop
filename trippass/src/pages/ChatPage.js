import React from "react";
import Layout from "../templates/Layout";
import DailyPlan from "../components/chatbot/DailyPlan";
import Chat from "../components/chatbot/Chat";
import styled from "styled-components";
import TripPlace from "../components/chatbot/TripPlace";

const ChatPageContainer = styled.div`
  display: flex;
  height: 85vh;
  padding-bottom: 20px;
`;

const ChatSection = styled.div`
  flex: 7;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 10px;
  margin-right: 20px;
`;

const DailyPlanSection = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  height: 85vh;

`;

const TripPlaceContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  flex: 3;
  box-sizing: border-box;
  margin-bottom: 20px;
`;

const DailyPlanContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  flex: 7;
  margin-bottom: 20px;
  box-sizing: border-box;
  overflow-y: auto; 
`;

const ChatPage = () => {
  return (
    <Layout>
      <ChatPageContainer>
        <ChatSection>
          <Chat />
        </ChatSection>
        <DailyPlanSection>
          <TripPlaceContainer>
            <TripPlace />
          </TripPlaceContainer>
          <DailyPlanContainer>
            <DailyPlan />
          </DailyPlanContainer>
        </DailyPlanSection>
      </ChatPageContainer>
    </Layout>
  );
};

export default ChatPage;
