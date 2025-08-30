import { ChooiceIdentityType } from "../interface/loginFace";
import { CHOICE_IDENTITY } from "../constants";


export const chooiceIdentityAction = (state: ChooiceIdentityType) => {
    return {
        type: CHOICE_IDENTITY,
        payload: state,
    }
}