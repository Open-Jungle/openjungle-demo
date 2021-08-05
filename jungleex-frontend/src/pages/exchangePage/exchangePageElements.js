import styled from "styled-components";

export const FirstRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export const SecondRow = styled.div`
    display: flex;
    flex-direction: row;
`;

export const InteractionSectionWrapper = styled.div`
    display: block;
    position: relative;
    @media screen and (max-width: 768px) {
        width: 100%;
        position: fixed;
        bottom: ${({isInteraction}) => (isInteraction ? "0" : "-260px")};
        z-index: 10;
    }
`;